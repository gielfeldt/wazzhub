import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { List, ListItem, SwipeoutActions, SwipeoutButton, Icon } from 'framework7-react';
import './group-members.css'

export default view(({ group, f7router }) => {
  const devices = group.devices

  function removeDevice(device) {
    f7router.app.dialog.confirm(`Are you sure you want to remove ${device.name} from ${group.name}?`, 'Remove', () => {
      group.removeDevice(device)
    })
  }

  return (
    <List inset>
      {devices.map(device => (
        <ListItem
          noChevron
          mediaItem
          swipeout
          key={device.id}
          title={device.name}
        >
          {device.imageUrl && (<img className="device-image-group-member" src={device.imageUrl} slot="media"/>)}
          <SwipeoutActions right>
            <SwipeoutButton color="red" onClick={() => removeDevice(device)}>
              <Icon ios="f7:trash" aurora="f7:trash" md="f7:trash" />
            </SwipeoutButton>
          </SwipeoutActions>
        </ListItem>
      ))}
    </List>
  )
})