import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { ListItem, Icon, SwipeoutActions, SwipeoutButton, AccordionContent } from 'framework7-react';

export default view(({ device, f7router }) => {
  console.log("Rendering", device)
  const hub = device.hub()

  function editPage(device) {
    f7router.navigate('/device/', {props: {device, hub: hub}})
  }

  function removeDevice() {
    f7router.app.dialog.confirm(`Are you sure you want to remove ${name}?`, 'Remove', () => {
      device.actions.remove()
    })
  }

  const DeviceStats = 'deviceStats' in device ? device.deviceStats() : null
  const DeviceControls = 'deviceControls' in device ? device.deviceControls() : null

  return (
    <ListItem
      noChevron
      badgeColor={hub.color()}
      badge={hub.name}
      swipeout
      mediaItem
      accordionItem
      key={device.id}
      slot="list"
    >
      {device.imageUrl && (<img className="device-image" src={device.imageUrl} slot="media"/>)}
      <div slot="title">{device.id}</div>
      <div slot="subtitle">{device.name}</div>
      {DeviceStats && (<DeviceStats device={device} f7router={f7router} slot="text"/>)}
      <SwipeoutActions right>
        <SwipeoutButton color="blue" onClick={() => editPage(device)}>
          <Icon ios="f7:square_pencil" aurora="f7:square_pencil" md="f7:square_pencil" />
        </SwipeoutButton>
        {('remove' in device.actions) && (
        <SwipeoutButton color="red" onClick={() => removeDevice()}>
          <Icon ios="f7:trash" aurora="f7:trash" md="f7:trash" />
        </SwipeoutButton>
        )}
      </SwipeoutActions>
      {DeviceControls && (<AccordionContent>
          <DeviceControls device={device} />
      </AccordionContent>)}
    </ListItem>
  )
})