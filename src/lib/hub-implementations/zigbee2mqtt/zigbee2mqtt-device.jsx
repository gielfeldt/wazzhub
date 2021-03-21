import React, { useState } from 'react';
import { view } from '@risingstack/react-easy-state';
import { List, Page, Navbar, Link, ListInput, ListItem, ListButton, Icon } from 'framework7-react';

export default view(({ device, hub, f7router }) => {
  const options = device.options()
  console.log("options", options)

  const [name, setName] = useState(device.name)
  const [retain, setRetain] = useState(options.retain || false)

  function save() {
    console.log(device.name, name)
    if (device.name !== name) {
      device.actions().rename(name)
    }
    if (!!options.retain != retain) {
      device.actions().retain(retain)
    }
    f7router.back({transition: 'f7-dive'})
  }

  function removeDevice() {
    const app = f7router.app
    app.dialog.confirm(`Are you sure you want to remove ${name}?`, 'Remove', () => {
      device.actions().remove()
      f7router.back({transition: 'f7-dive'})
    })
  }

  function forceRemoveDevice() {
    const app = f7router.app
    app.dialog.confirm(`Are you sure you want to forcefully remove ${name}?`, 'Remove', () => {
      device.actions().forceRemove()
      f7router.back({transition: 'f7-dive'})
    })
  }

  return (
    <Page name="editDevice">
      <Navbar title={device.name} subtitle={device.id} backLink="Back">
        <Link slot="right" onClick={save}>Save</Link>
      </Navbar>
      <List>
        <ListInput
          label="Friendly name"
          floatlingLabel
          value={name}
          type="text"
          placeholder="Friendly name of device"
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => setName(e.target.value)}
        />
        <ListItem
          checkbox
          checked={retain}
          title="Retain"
          onChange={(e) => setRetain(e.target.checked)}
        />
        <ListItem divider />
        <ListButton color="white" bgColor="red" onClick={removeDevice}>
          Remove
        </ListButton>
        <ListButton color="white" bgColor="red" onClick={forceRemoveDevice}>
          Force remove
        </ListButton>
      </List>
    </Page>
  )
});
