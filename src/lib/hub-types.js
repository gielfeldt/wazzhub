import zigbee2mqtt from './hub-implementations/zigbee2mqtt'
import custom from './hub-implementations/custom'

const hubTypes = {
    zigbee2mqtt,
    custom,
}

export default hubTypes