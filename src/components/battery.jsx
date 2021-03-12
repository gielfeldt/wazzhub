import React from 'react';

import './battery.scss'

export default ({ percentage }) => {
    var classes = 'battery-level'
    var pct = percentage || 0
    if (pct <= 0) pct = 0
    if (pct > 100) pct = 100
    if (pct < 10) {
        classes = classes + ' alert'
    } else if (pct < 20) {
        classes = classes + ' warn'
    }

    return (
        <div className="battery">
            <div className={classes} style={{height: pct + '%'}}></div>
        </div>
    )
}