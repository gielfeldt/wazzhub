import React, { useMemo } from 'react';
import { view } from '@risingstack/react-easy-state';
import { ListItem } from 'framework7-react';

export default view(({ device }) => {
    console.log("Device item", device)
    const payload = device.payload()
    console.log("Device payload", payload)
    /*
    const Payload = useMemo(() => {
        return (
            <pre>{JSON.stringify(device.payload)}</pre>
        )
    }, [device.payload])
    */
    return (
        <ListItem
            mediaItem
            title={device.id}
            subtitle={device.name}
        >
            {device.imageUrl && (<img className="device-image" slot="media" src={device.imageUrl} />)}
            <div slot="after">{JSON.stringify(payload)}</div>
        </ListItem>
    )
})
