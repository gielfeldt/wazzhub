
import { store, view } from '@risingstack/react-easy-state'
import mqtt from 'mqtt'
import HubPage from "./zigbee2mqtt-hub.jsx"
import DevicePage from "./zigbee2mqtt-device.jsx"
import DeviceStats from "./zigbee2mqtt-device-stats.jsx"
import DeviceControls from './zigbee2mqtt-device-controls.jsx'
import objectHash from 'object-hash'

function imageUrl(device) {
    var url = null
    if (device && device.definition && device.definition.model && device.supported) {
        const model = device.definition.model.replace('/', '-')
        url = 'https://www.zigbee2mqtt.io/images/devices/' + model + '.jpg'
    }
    return url
}

function create({hub}) {
    var client = null

    const self = store({
        searching: false,

        device: {},
        group: {},
        payloads: {},
        options: {},

        groupDevices(groupId) {
            return self.group[groupId].map(group => ({
                ...group,
                devices: group.members.filter(member => self.device[member]).map(member => self.device[member]),
            }))
        },

        get deviceIds() {
            return Object.keys(self.device)
        },

        get devices() {
            return Object.values(self.device)
                .filter(device => device.supported)
        },

        get groups() {
            return Object.values(self.group)
        },

        deviceActions(device) {
            const baseTopic = hub().connectionInfo.baseTopic
            //const topic = baseTopic + '/' + device.friendly_name + '/set'
            return {
                toggleState: () => console.log("toggle state", device.friendly_name),
                setState: (state) => console.log("set state", device.friendly_name, state),
                remove: () => client.publish(baseTopic + '/bridge/request/device/remove', JSON.stringify({id: device.ieee_address, force: false})),
                forceRemove: () => client.publish(baseTopic + '/bridge/request/device/remove', JSON.stringify({id: device.ieee_address, force: true})),
                //rename: (name) => console.log("rename", device.friendly_name, name),
                //retain: (retain) => console.log("retain", device.friendly_name, retain),
                rename: (name) => {
                    console.log(`Renaming ${device.ieee_address} to ${name}`)
                    hub().notify({text: `Renaming ${device.ieee_address} to ${name}`})
                    client.publish(baseTopic + '/bridge/request/device/rename', JSON.stringify({from: device.ieee_address, to: name}))
                },
                retain: (retain) => {
                    hub().notify({text: (retain ? 'Retaining' : 'Stop retaining') + ` messages for ${device.ieee_address}`})
                    client.publish(baseTopic + '/bridge/request/device/options', JSON.stringify({id: device.ieee_address, options: { retain }}))
                },
            }
            /*
            return {
                toggleState: () => client.publish(topic, JSON.stringify({state: "TOGGLE"})),
                setState: (state) => client.publish(topic, JSON.stringify({state: state ? 'ON' : 'OFF'})),
                remove: () => client.publish('zigbee2mqtt/bridge/request/device/remove', JSON.stringify({id: device.ieee_address, force: false})),
                forceRemove: () => client.publish('zigbee2mqtt/bridge/request/device/remove', JSON.stringify({id: device.ieee_address, force: true})),
                rename: (name) => {
                    hub().notify({text: `Renaming ${id} to ${name}`})
                    client.publish('zigbee2mqtt/bridge/request/device/rename', JSON.stringify({from: device.ieee_address, to: name}))
                },
                retain: (retain) => {
                    hub().notify({text: `Retaining messages for ${id}`})
                    client.publish('zigbee2mqtt/bridge/request/device/options', JSON.stringify({id: device.ieee_address, options: { retain }}))
                },
            }
            */
        },


        prepareDevice(z2mDevice) {
            return {
                // Basic info
                id: z2mDevice.ieee_address,
                name: z2mDevice.friendly_name,
                isNew: z2mDevice.ieee_address === z2mDevice.friendly_name,
                imageUrl: imageUrl(z2mDevice),
                group: () => Object.values(self.group).find(group => group.members.includes(z2mDevice.ieee_address)),

                // Components
                //deviceItem: DeviceItem,
                editDevicePage: () => DevicePage,
                deviceStats: () => DeviceStats,
                deviceControls: () => DeviceControls,

                // Internal (private)
                //info: () => self.deviceInfo(z2mDevice),
                actions: () => self.deviceActions(z2mDevice),
                payload: () => self.payloads[z2mDevice.friendly_name] || null,
                options: () => self.options[z2mDevice.ieee_address],
                supported: z2mDevice.supported,
                hash: objectHash(z2mDevice),
            }
            prepared.deviceStats = () => DeviceStats
            prepared.deviceControls = () => DeviceControls

            return prepared
        },

        prepareGroup(group) {
            const baseTopic = hub().connectionInfo.baseTopic
            const prepared = {
                id: group.id,
                name: group.friendly_name,
                members: group.members.map(member => member.ieee_address),
                devices: group.members.filter(member => self.device[member.ieee_address]).map(member => self.device[member.ieee_address]),
                z2mGroup: group,

                removeDevice: (device) => client.publish(baseTopic + '/bridge/request/group/members/remove', JSON.stringify({group: group.friendly_name, device: device.name})),
                addDevice: (device) => client.publish(baseTopic + '/bridge/request/group/members/add', JSON.stringify({group: group.friendly_name, device: device.name})),
                //removeDevice: (device) => console.log(JSON.stringify({group: group.friendly_name, device: device.name})),
            }
            return prepared
        },

        hasChanged(device) {
            return objectHash(device) !== objectHash(self.device[device.id] || {})
        },

        subscribe() {
            const baseTopic = hub().connectionInfo.baseTopic
            client.on("message", async (topic, payload, packet) => {
                if (topic === baseTopic + '/bridge/info') {
                    const msg = JSON.parse(payload)
                    //console.log(topic, msg)
                    self.searching = msg.permit_join

                    const options = {}
                    Object.entries(msg.config.devices).map(([id, opt]) => {
                        options[id] = {
                            retain: null,
                            transition: null,
                            ...opt,
                        }
                    })
                    self.options = options
                    return
                }
                if (topic === baseTopic + '/bridge/devices') {
                    const msg = JSON.parse(payload)
                    const existingDevices = Object.keys(self.device)
                    const newDevices = msg.map(device => device.ieee_address)
                    const devices = {}
                    Object.values(msg).forEach(device => {
                        devices[device.ieee_address] = self.prepareDevice(device)
                    })

                    const removed = existingDevices.filter(id => !newDevices.includes(id))
                    const added = newDevices.filter(id => !existingDevices.includes(id))
                    const updated = newDevices.filter(id => !removed.includes(id) && !added.includes(id))

                    //console.log("removed", removed)
                    //console.log("added", added)
                    //console.log("updated", updated)

                    if (removed.length == 0 && updated.length == 0) {
                        // fresh
                        self.device = devices
                        console.log("Fresh devices")
                    } else {
                        for (const id of removed) {
                            delete self.device[id]
                        }
                        for (const id of added) {
                            self.device[id] = devices[id]
                        }
                        for (const id of updated) {
                            if (self.device[id].hash !== devices[id].hash) {
                                self.device[id] = devices[id]
                            }
                        }
                        console.log("Updated devices")
                    }
                    return

                    //const devices = {}
                    //Object.values(msg).forEach(device => devices[device.ieee_address] = self.prepareDevice(device))
                    if (Object.values(self.device).length == 0) {
                        const devices = {}
                        Object.values(msg).forEach(device => devices[device.ieee_address] = self.prepareDevice(device))
                        console.log("Loaded fresh devices", devices)
                        self.device = devices
                    } else {
                        Object.values(msg)
                            .map(device => self.prepareDevice(device))
                            .filter(device => self.hasChanged(device))
                            .forEach(device => {
                                console.log("UPDATING DEVICE", device)
                                self.device[device.id] = device
                            })
                        console.log("Updated devices")
                    }
                    //console.log(topic, msg)
                    //self.device = devices

                    const groups = Object.keys(self.group)
                    const updatedGroups = {}
                    for (const groupId of groups) {
                        updatedGroups[groupId] = self.prepareGroup(self.group[groupId].z2mGroup)
                    }
                    self.group = updatedGroups
                    console.log("updated groups")

                    return
                }
                if (topic === baseTopic + '/bridge/groups') {
                    const msg = JSON.parse(payload)
                    const groups = {}
                    Object.values(msg).forEach(group => groups[group.id] = self.prepareGroup(group))
                    console.log("Loaded groups", groups)
                    //console.log(topic, msg)
                    self.group = groups
                    return
                }
                if (topic === baseTopic + '/bridge/event') {
                    const msg = JSON.parse(payload)
                    //console.log(topic, msg)
                    if (msg.type && msg.type == 'device_leave') {
                        hub().notify({subtitle: `${msg.data.ieee_address} left the network`, level: 'warn'})
                        return
                    }
                    if (msg.type && msg.type == 'device_joined') {
                        hub().notify({subtitle: `${msg.data.ieee_address} joined the network`})
                        return
                    }
                    if (msg.type && msg.type == 'device_interview') {
                        if (msg.data.status == 'started') {
                            hub().notify({subtitle: `${msg.data.ieee_address} started interview`})
                            return
                        }
                        if (msg.data.status == 'successful') {
                            hub().notify({
                                subtitle: `${msg.data.ieee_address} finished interview`,
                                text: `${msg.data.definition.vendor} - ${msg.data.definition.model} - ${msg.data.definition.description}`,
                                level: 'success',
                            })
                            return
                        }
                        if (msg.data.status == 'failed') {
                            hub().notify({subtitle: `${msg.data.ieee_address} failed interview`, level: 'error'})
                            return
                        }
                    }
                }
                if (topic === baseTopic + '/bridge/response/device/remove') {
                    const msg = JSON.parse(payload)
                    //console.log(topic, msg)
                    if (msg.status == 'error') {
                        hub().notify({subtitle: msg.error, level: 'error'})
                        return
                    }
                    if (msg.status == 'ok') {
                        hub().notify({subtitle: `${msg.data.id} was removed`, level: 'warn'})
                        return
                    }
                    return
                }
                if (topic === baseTopic + '/bridge/response/device/rename') {
                    const msg = JSON.parse(payload)
                    if (msg.status == 'error') {
                        hub().notify({subtitle: msg.error, level: 'error'})
                        return
                    }
                    if (msg.status == 'ok') {
                        hub().notify({subtitle: `Renamed ${msg.data.from} to ${msg.data.to}`, level: 'success'})
                        return
                    }
                    return
                }
                if (topic === baseTopic + '/bridge/response/device/options') {
                    const msg = JSON.parse(payload)
                    if (msg.status == 'error') {
                        hub().notify({subtitle: msg.error, level: 'error'})
                        return
                    }
                    if (msg.status == 'ok') {
                        const from = JSON.stringify(msg.data.from)
                        const to = JSON.stringify(msg.data.to)
                        hub().notify({
                            subtitle: `${msg.data.id} - device options changed`,
                            text: `from: ${from} to: ${to}`,
                            level: 'success',
                        })
                        return
                    }
                    return
                }
                const matches = topic.match(/^zigbee2mqtt\/([^\/]+)$/)
                if (matches && matches.length > 0) {
                    const friendly_name = matches[1]
                    try {
                        const msg = JSON.parse(payload)
                        //console.log("Setting payload", topic, matches, friendly_name, msg)
                        self.payloads[friendly_name] = msg
                    } catch(error) {
                        console.log(topic, payload.toString(), packet)
                        console.log(topic, packet.payload.toString())
                    }
                    return
                }
            })

            console.log("Base topic", baseTopic)
            client.subscribe(baseTopic + '/bridge/+')
            client.subscribe(baseTopic + '/bridge/response/device/remove')
            client.subscribe(baseTopic + '/bridge/response/device/rename')
            client.subscribe(baseTopic + '/bridge/response/device/options')
            client.subscribe(baseTopic + '/+')
        },

        async connect() {
            const address = hub().connectionInfo.address

            const asyncConnect = new Promise((resolve, reject) => {
                try {
                    client = mqtt.connect(address, {rejectUnauthorized: false})
                } catch (error) {
                    reject(error)
                }

                // Handle reconnection attempts
                var connecting = true
                var reconnect = 0

                client.on("reconnect", (a) => {
                    if (connecting) {
                        //console.log("reconnecting ...", reconnect)
                        reconnect++
                        if (reconnect > 3) {
                            if (client) {
                                try {
                                    client.end()
                                } catch (error) {
                                    reject(error)
                                } finally {
                                    console.log("RESETTING CLIENT!")
                                    client = null
                                }
                            }
                            reject("Error connecting!")
                        }
                    }
                })
                client.on("error", (a) => {
                    if (connecting) {
                        //console.log("a", a)
                        client = null
                        reject("Error connecting!")
                    }
                })
                client.on("connect", () => {
                    connecting = false
                    resolve()
                    self.subscribe()
                })
            })

            return asyncConnect
        },

        async disconnect() {
            //console.log("z2m disconnect")
            if (!client) {
                return
            }
            var disconnecting = true

            const asyncDisconnect = new Promise((resolve, reject) => {
                client.on("close", () => {
                    if (disconnecting) {
                        disconnecting = false
                        client = null
                        self.device = {}
                        self.group = {}
                        resolve()
                    }
                })
                client.on("error", () => {
                    if (disconnecting) {
                        disconnecting = false
                        client = null
                        reject("Error disconnecting!")
                    }
                })
            })

            client.end();

            return asyncDisconnect
        },

        startSearch() {
            if (!client) return
            const baseTopic = hub().connectionInfo.baseTopic
            client.publish(baseTopic + '/bridge/request/permit_join', JSON.stringify({value: true}))
        },
        stopSearch() {
            if (!client) return
            const baseTopic = hub().connectionInfo.baseTopic
            client.publish(baseTopic + '/bridge/request/permit_join', JSON.stringify({value: false}))
        },

    })

    return self
}

function label() {
    return 'Zigbee2Mqtt'
}

export default {
    create,
    label,
    hubPage: () => HubPage,
    connectionInfo: () => ({
        address: '',
        baseTopic: 'zigbee2mqtt',
    })
}
