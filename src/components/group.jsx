import React, { useState } from 'react';
import { view } from '@risingstack/react-easy-state';
import { List, ListItem, NavLeft, AccordionContent, Badge, Icon, ListButton, Popup, Page, Navbar, NavRight, Link, Block } from 'framework7-react';
import GroupMembers from './group-members'

import './group.css'
import device from './device';

export default view(({ group, f7router }) => {
  const hub = group.hub()

  const [popupOpened, setPopupOpened] = useState(false);

  console.log("Rendering group", group, hub)

  const devices = group.devices

  const allDevices = hub.connection().device
  const groups = hub.connection().groups
  const members = groups.map(group => group.members).flat()
  const addableDevices = hub.connection().devices.filter(device => !members.includes(device.id))

  const [addDevices, setAddDevices] = useState({});

  const onAddDeviceChange = (e) => {
    const deviceId = e.target.value;
    //console.log(allDevices)
    if (e.target.checked) {
      addDevices[deviceId] = allDevices[deviceId]
    } else {
      delete addDevices[deviceId]
    }
    //console.log(addDevices)
    setAddDevices({ ...addDevices });
  };


  function addCheckedDevices() {
    const devices = Object.values(addDevices)
    if (devices.length > 0) {
      for (const device of devices) {
        group.addDevice(device)
      }
    }
    setPopupOpened(false)
    setAddDevices([])
  }

  function addDevice(device)
  {
    f7router.app.dialog.confirm(`Are you sure you want to add ${device.name} to group ${group.name}?`, 'Add to group', () => {
      group.addDevice(device)
      setPopupOpened(false)
    })
  }

  function popupClosed() {
    setPopupOpened(false)
    setAddDevices([])
  }

  return (
    <ListItem
      badgeColor={hub.color()}
      badge={hub.name}
      accordionItem
      key={group.id}
      slot="list"
    >
      <div slot="title"><Badge style={{width: "28px"}}>{group.members.length}</Badge> {group.name}</div>
      <AccordionContent>
        {devices && (<GroupMembers group={group} f7router={f7router} />)}
          <List inset>
          <ListButton onClick={() => setPopupOpened(true)} className="group-add-device">
            <Icon ios="f7:plus_circle" aurora="f7:plus_circle" md="f7:plus_circle" />  Add device
          </ListButton>
        </List>
      </AccordionContent>
      <Popup opened={popupOpened} onPopupClose={popupClosed} closeOnEscape>
        <Page>
          <Navbar title="Add device" backLink="Cancel" onBackClick={popupClosed}>
            <NavRight>
              <Link onClick={addCheckedDevices}>Add</Link>
            </NavRight>
          </Navbar>
          <List>
            {addableDevices.map(device => (
              <ListItem
                checkbox
                key={`add-device-${group.id}-${device.id}`}
                title={device.name}
                value={device.id}
                onChange={onAddDeviceChange}
                checked={addDevices[device.id] ? true : false}
                mediaItem
              >
                {device.imageUrl && (<img className="device-image-group-member" src={device.imageUrl} slot="media"/>)}
              </ListItem>
            ))}
          </List>
        </Page>
      </Popup>
    </ListItem>
  )
})