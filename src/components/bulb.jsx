import React from 'react';

import './bulb.css'

export default (props) => {
    var brightness = props.brightness || 0
    if (brightness <= 0) brightness = 0
    if (brightness > 254) brightness = 254
    brightness = brightness * 100 / 254

    return (
        <div className="battery">
            <div className='battery-level warn' style={{height: brightness + '%'}}></div>
        </div>
    )
}