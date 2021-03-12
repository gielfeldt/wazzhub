import React from 'react';
import { view } from '@risingstack/react-easy-state';
import './linkquality.css'

const strenghts = ['first', 'second', 'third', 'fourth']

export default view(({ min, max, value }) => {
    const size = max + 1 - min
    const divisor = size / 4

    const strengthIndex = Math.floor(value / divisor)
    const strength = strenghts[strengthIndex]
    console.log(value, strengthIndex, strength)
    return (
        <div className={'wifi_group xss ' + strength}>
            <div className="wifi_top"></div>
            <div className="wifi_bottom"></div>
        </div>
    )
})
