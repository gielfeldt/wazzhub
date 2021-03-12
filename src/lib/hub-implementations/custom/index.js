
import { store } from '@risingstack/react-easy-state'
import HubPage from "./custom-hub.jsx"
import DevicePage from "./custom-device.jsx"
import DeviceStats from "./custom-device-stats.jsx"
import awaitSleep from 'await-sleep'

function create({hub}) {
    const self = store({
        searching: false,

        customDevices: {},

        get devices() {
            return Object.values(self.customDevices)
        },

        async connect() {
            await awaitSleep(3000)
        },
        async disconnect() {
            await awaitSleep(2000)
        },
        startSearch() {
            self.searching = true
        },
        stopSearch() {
            self.searching = false
        }
    })

    return self
}

function label() {
    return 'Custom'
}

export default {
    create,
    label,
    devicePage: () => DevicePage,
    deviceStats: () => DeviceStats,
    hubPage: () => HubPage,
    connectionInfo: () => ({
        address: '',
    })
}
