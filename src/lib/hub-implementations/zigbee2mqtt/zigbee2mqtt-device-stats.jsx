import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { Icon, Badge } from 'framework7-react';
import './zigbee2mqtt-device-stats.css'

export default view(({ device }) => {
    const payload = device.payload()

    const linkquality = (payload && 'linkquality' in payload) ? payload.linkquality : null
    const battery = (payload && 'battery' in payload) ? payload.battery : null
    const contact = (payload && 'contact' in payload) ? payload.contact : null
    const state = (payload && 'state' in payload) ? (payload.state == 'ON') : null
    const action = (payload && 'action' in payload) ? payload.action : null

    return (
        <>
            <span></span>
            {linkquality !== null && (<span className="device-stats"><Icon ios="f7:wifi" aurora="f7:wifi" md="f7:wifi" color="blue" /></span>)}
            {battery !== null && (<span className="device-stats"><Icon ios="f7:battery_100" aurora="f7:battery_100" md="f7:battery_100" color="blue" /></span>)}
            {state !== null && (<span className="device-stats">
                {state && (<Icon ios="f7:lightbulb_fill" aurora="f7:lightbulb_fill" md="f7:lightbulb_fill" color="yellow" />)}
                {!state && (<Icon ios="f7:lightbulb_slash" aurora="f7:lightbulb_slash" md="f7:lightbulb_slash" color="gray" />)}
            </span>)}
            {contact !== null && (<span className="device-stats">
                {contact && (<Icon ios="f7:lock" aurora="f7:lock" md="f7:lock" color="blue" />)}
                {!contact && (<Icon ios="f7:lock_open" aurora="f7:lock_open" md="f7:lock_open" color="blue" />)}
            </span>)}
            <span className="device-stats">
                <Icon ios="f7:info_circle" aurora="f7:info_circle" md="f7:info_circle" color="blue" tooltip={JSON.stringify(payload)}/>
            </span>
            {action && (<span className="device-stats">
                <Badge>{action}</Badge>
            </span>)}
        </>
    )
})