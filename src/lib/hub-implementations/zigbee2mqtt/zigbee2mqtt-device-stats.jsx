import React, { useEffect, useRef, useState } from 'react';
import { view } from '@risingstack/react-easy-state';
import { Icon, Badge } from 'framework7-react';
import './zigbee2mqtt-device-stats.css'

const FadeOut = ({children}) => {
    const actionEl = useRef(null);

    //console.log("Action changed")

    useEffect(() => {
        actionEl.current.className = "show"
        const timeout = setTimeout(() => {
            actionEl.current.className = "hide"
        }, 5000)
        return () => clearTimeout(timeout)
    })

    return (<span ref={actionEl}>{children}</span>)
}

export default view(({ device }) => {
    //console.log("device stats", device)
    const payload = device.payload()

    const linkquality = (payload && 'linkquality' in payload) ? payload.linkquality : null
    const battery = (payload && 'battery' in payload) ? payload.battery : null
    const brightness = (payload && 'brightness' in payload) ? payload.brightness : null
    const contact = (payload && 'contact' in payload) ? payload.contact : null
    const state = (payload && 'state' in payload) ? (payload.state == 'ON') : null
    const action = (payload && 'action' in payload) ? payload.action : null
    const occupied_heating_setpoint = (payload && 'occupied_heating_setpoint' in payload) ? payload.occupied_heating_setpoint : null
    const water_leak = (payload && 'water_leak' in payload) ? payload.water_leak : null

    const local_temperature = (payload && 'local_temperature' in payload) ? payload.local_temperature : null
    const temperature = (payload && 'temperature' in payload) ? payload.temperature : null
    const best_temperature = local_temperature || temperature || null

    const battery_icon = battery >= 50 ? 'f7:battery_100' : battery >= 25 ? 'f7:battery_25' : 'f7:battery_0'

    return (
        <>
            <span></span>
            {linkquality !== null && (<span className="device-stats">
                <Icon ios="f7:wifi" aurora="f7:wifi" md="f7:wifi" color="blue" />
                <div className="value-subscript">{linkquality}</div>
            </span>)}
            {battery !== null && (<span className="device-stats">
                <Icon ios={battery_icon} aurora={battery_icon} md={battery_icon} color="blue" />
                <div className="value-subscript">{battery}</div>
            </span>)}
            {state !== null && (<span className="device-stats">
                {state && (<Icon ios="f7:lightbulb_fill" aurora="f7:lightbulb_fill" md="f7:lightbulb_fill" color="yellow" />)}
                {!state && (<Icon ios="f7:lightbulb_slash" aurora="f7:lightbulb_slash" md="f7:lightbulb_slash" color="gray" />)}
                {brightness && (<div className="value-subscript">{Math.round(brightness)}</div>)}
            </span>)}
            {contact !== null && (<span className="device-stats">
                {contact && (<Icon ios="f7:lock" aurora="f7:lock" md="f7:lock" color="blue" />)}
                {!contact && (<Icon ios="f7:lock_open" aurora="f7:lock_open" md="f7:lock_open" color="blue" />)}
            </span>)}
            {best_temperature !== null && (<span className="device-stats">
                <Icon ios="f7:thermometer" aurora="f7:thermometer" md="f7:thermometer" color="blue" />
                <div className="value-subscript">{best_temperature.toFixed(1)}</div>
            </span>)}
            {occupied_heating_setpoint !== null && (<span className="device-stats">
                <Icon ios="f7:thermometer_sun" aurora="f7:thermometer_sun" md="f7:thermometer_sun" color="blue" />
                <div className="value-subscript">{occupied_heating_setpoint.toFixed(1)}</div>
            </span>)}
            {water_leak !== null && (<span className="device-stats">
                {water_leak && (<Icon ios="f7:drop_fill" aurora="f7:drop_fill" md="f7:drop_fill" color="red" />)}
                {!water_leak && (<Icon ios="f7:drop" aurora="f7:drop" md="f7:drop" color="gray" />)}
            </span>)}
            {/*}
            <span className="device-stats">
                <Icon ios="f7:info_circle" aurora="f7:info_circle" md="f7:info_circle" color="blue" tooltip={JSON.stringify(payload)}/>
            </span>
            */}
            {action && (<FadeOut className="device-stats">
                <Badge>{action}</Badge>
            </FadeOut>)}
        </>
    )
})