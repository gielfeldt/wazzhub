import React from 'react';
import { Gauge } from 'framework7-react';

export default (props) => {
    var brightness = props.brightness || 0
    if (brightness <= 0) brightness = 0
    if (brightness > 254) brightness = 254
    const value = brightness / 254

    var color = '#FCE04F'
    return (
        <Gauge type="circle" size={28} value={value} borderWidth={4} borderBgColor="#999" borderColor={color}/>
    )
}