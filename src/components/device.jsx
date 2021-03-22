import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { ListItem,Badge } from 'framework7-react';

export default view(({ device, f7router }) => {
  //console.log("Rendering", device)
  const hub = device.hub()

  const DeviceStats = 'deviceStats' in device ? device.deviceStats() : null

  const noImageUrl = null
  const groupColor = 'grey'
  const groupName = null

  return (
    <ListItem
      chevronCenter
      badgeColor={groupColor}
      badge={groupName}
      mediaItem
      key={device.id}
      slot="list"
      link="#"
      onClick={() => f7router.navigate('/device/', {props: {device}})}
    >
      <div slot="media">
        <Badge className="badge-overlay" color={hub.color()}>{hub.name}</Badge>
        <img className="device-image" src={device.imageUrl || noImageUrl} />
      </div>
      <div slot="title">{device.id}</div>
      <div slot="subtitle">{device.name}</div>
      {DeviceStats && (<DeviceStats device={device} f7router={f7router} slot="text"/>)}
    </ListItem>
  )
})