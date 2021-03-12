import { store } from '@risingstack/react-easy-state';
import { v4 as uuidv4 } from 'uuid'
import hubTypes from './hub-types'

const hubColors = [
  'blue',
  'teal',
  'orange',
  'purple',
]

const levelColor = {
  success: 'green',
  info: 'blue',
  warn: 'yellow',
  error: 'red',
}

const levelIcon = {
  success: 'checkmark_circle_fill',
  info: 'exclamationmark_bubble_fill',
  warn: 'exclamationmark_triangle_fill',
  error: 'exclamationmark_circle_fill',
}

var app

function notify(hubId, {title, subtitle, text, level = 'info'}) {
  if (!app) {
    console.log("App not initialized")
    return
  }
  const hub = self.hubs[hubId]
  if (!hub) {
    console.log("Hub not found", hubId)
  }

  const color = hub.color()
  const icon = levelIcon[level]
  const iconColor = levelColor[level]

  //console.log("Notification for hub", hub)
  app.notification.create({
    icon: `<i class="icon f7-icons color-${iconColor}">${icon}</i>`,
    title: `<span class="badge color-${color}">${hub.name}</span>`,
    text,
    //title,
    subtitle,
    closeTimeout: 3000,
  }).open()
}


function sanitizeHub(hub) {
  return {
    id: hub.id,
    name: hub.name,
    type: hub.type,
    enabled: hub.enabled ? true : false,
    connected: false,
    connectionInfo: hub.connectionInfo,
    test: false,
  }
}

const self = store({
  hubs: {},
  app: null,
  connections: {},
  connecting: {},

  get all() {
    return Object.values(self.hubs)
  },

  get hubTypes() {
    return Object.entries(hubTypes)
  },

  get deviceIds() {
    return Object.values(self.hubs)
    .filter(hub => hub.connected)
    .map(hub => hub.connection().deviceIds)
    .flat()
  },

  get devices() {
    return Object.values(self.hubs)
    .map(hub => ({
      hub: () => hub,
      devices: hub.connection().devices,
    }))
    .filter(hubDevices => hubDevices.hub().connected)
    .map(hubDevices => {
      return Object.values(hubDevices.devices).map(device => ({
        ...device,
        hub: hubDevices.hub,
      }))
    })
    .flat()
  },

  get groups() {
    return Object.values(self.hubs)
    .map(hub => ({
      hub: () => hub,
      groups: hub.connection().groups,
    }))
    .filter(hubGroups => hubGroups.hub().connected)
    .map(hubGroups => {
      return Object.values(hubGroups.groups).map(group => ({
        ...group,
        hub: hubGroups.hub,
      }))
    })
    .flat()
  },

  get connected() {
    return Object.values(self.hubs)
      .filter(hub => hub.connected)
      .length > 0
  },

  get searching() {
    return Object.values(self.hubs)
      .filter(hub => hub.connected)
      .filter(hub => hub.connection().searching)
      .length > 0
  },

  startSearch() {
    Object.values(self.hubs).map(hub => hub.connection().startSearch())
  },

  stopSearch() {
    Object.values(self.hubs).map(hub => hub.connection().stopSearch())
  },

  newHub(type) {
    console.log(type, hubTypes)
    const hub = sanitizeHub({
      id: uuidv4(),
      name: '',
      type,
      connected: false,
      enabled: true,
      connectionInfo: hubTypes[type].connectionInfo(),
    })
    hub.hubPage = () => hubTypes[hub.type].hubPage()
    return hub
  },

  addHub(hub) {
    var index
    if (!self.hubs[hub.id]) {
      // create
      index = Object.keys(self.hubs).length
      //console.log("add hub", hub)
      self.connections[hub.id] = hubTypes[hub.type].create({
        hub: () => self.hubs[hub.id],
        notify: (args) => notify(hub.id, args || {})
      })
      self.hubs = {...self.hubs, [hub.id]: self.functionalHub({...hub, index}, self.connections[hub.id]) }
    } else {
      // update
      index = self.hubs[hub.id].index
      self.hubs[hub.id] = self.functionalHub({...hub, index}, self.connections[hub.id])
    }
    return self.hubs[hub.id]
  },

  saveHub(hub) {
    const oldHub = self.hubs[hub.id]
    const enabled = (oldHub && oldHub.enabled) ? true : false

    if (enabled) {
      oldHub.enabled = false
      self.ensureConnection(hub.id)
    }
    const newHub = self.addHub(sanitizeHub(hub))
    self.saveHubs()
    self.ensureConnection(hub.id)
  },

  async deleteHub(hubId) {
    self.hubs[hubId].enabled = false
    await self.ensureConnection(hubId)
    delete self.hubs[hubId]
    self.saveHubs()
  },

  saveHubs() {
    console.log("Saving to localstore", self.hubs)
    const hubs = {}
    for(const hubId in self.hubs) {
      hubs[hubId] = sanitizeHub(self.hubs[hubId])
    }
    localStorage.setItem('hubs', JSON.stringify(hubs))
  },

  disable(hubId) {
    self.hubs[hubId].enabled = false
    self.saveHubs()
    self.ensureConnection(hubId)
  },

  enable(hubId) {
    self.hubs[hubId].enabled = true
    self.saveHubs()
    self.ensureConnection(hubId)
  },

  async ensureConnection(hubId) {
    const hub = self.hubs[hubId]
    //console.log("[ensureConnection] Ensuring", hub, self.connecting)
    if (!hub) {
      //console.log("[ensureConnection] NO HUB", hubId)
      return
    }

    if (!self.connecting[hub.id]) {
      //console.log("[ensureConnection] initital ready", hubId)
      self.connecting[hub.id] = 'ready'
    }

    if (self.connecting[hub.id] !== 'ready') {
      //console.log("[ensureConnection] NOT READY")
      return
    }

    //console.log("[ensureConnection] SETTING READY")
    //self.connecting[hub.id] = 'xcvxcvcxv'
    //self.connecting[hub.id] = 'ready'

    //console.log("[ensureConnection] hub", hub)

    if (!hub.connected && hub.enabled) {
      //hub.connected = null
      //console.log("[ensureConnection]  Ensuring connect")
      self.connecting[hub.id] = 'connecting'
      try {
        await hub.connection().connect()
        hub.notify({text: 'Connected!', level: 'success'})
        hub.connected = true
        //console.log("[ensureConnection]  NOW CONNECTED")
      } catch (error) {
        hub.connected = false
        self.disable(hub.id)
        hub.notify({text: error, level: 'error'})
        //console.log("[ensureConnection]  ERROR CONNECTED")
      }
      //console.log("[ensureConnection] READY [connect]", hub.id)
      self.connecting[hub.id] = 'ready'
      await self.ensureConnection(hubId)
      return
    }

    if (hub.connected && !hub.enabled) {
      //hub.connected = null
      //console.log("[ensureConnection] Ensuring disconnect")
      self.connecting[hub.id] = 'disconnecting'
      try {
        await hub.connection().disconnect()
        hub.connected = false
        hub.notify({text: 'Disconnected!', level: 'success'})
        //console.log("[ensureConnection] NOW DISCONNECTED")
      } catch (error) {
        self.enable(hub.id)
        hub.connected = true
        //console.log("[ensureConnection] ERROR DISCONNECTING")
        hub.notify({text: error, level: 'error'})
      }
      //console.log("[ensureConnection] READY [disconnect]")
      self.connecting[hub.id] = 'ready'
      await self.ensureConnection(hubId)
      return
    }
  },

  setApp(f7app) {
    app = f7app
  },

  functionalHub(hub, connection) {
    //console.log(hub.id, hub.index)
    return {
      ...hub,

      label: () => hubTypes[hub.type].label(),
      color: () => hubColors[hub.index % 4],
      connection: () => connection,
      hubPage: () => hubTypes[hub.type].hubPage(),
      //devicePage: (device) => hubTypes[hub.type].devicePage(device),
      //deviceStats: (device) => hubTypes[hub.type].deviceStats(device),
      connecting: () => self.connecting[hub.id] || 'ready',
      notify: (args) => notify(hub.id, args)
    }
  }
})


const loadedHubs = localStorage.getItem('hubs')
if (loadedHubs) {
  const hubs = JSON.parse(loadedHubs)
  for(const hubId in hubs) {
    const hub = sanitizeHub(hubs[hubId])
    if (!hub) continue;
    self.addHub(hub)
    self.ensureConnection(hub.id)
  }
}

export default self;
