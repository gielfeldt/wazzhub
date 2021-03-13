import React, { useState, useMemo } from 'react';
import { view } from '@risingstack/react-easy-state';
import { Page, Navbar, List, ListButton, ListInput, ListItem, Link, Icon } from 'framework7-react';
import wazzhub from '../lib/hubs'
import HubQr from '../components/hub-qr'

function generateUrlFromHub(hub) {
  const baseUrl = window.location.href.split('#')[0]
  const connectUrl = baseUrl + '#quick-connect=' + btoa(JSON.stringify(hub))
  return connectUrl
}

export default view(({ f7router, hub, isNew }) => {
  const [name, setName] = useState(hub.name)
  const [connectionInfo, setConnectionInfo] = useState({ ...hub.connectionInfo })

  function generateUrl() {
    return generateUrlFromHub({
      id: hub.id,
      name,
      type: hub.type,
      enabled: true,
      connectionInfo: {...connectionInfo},
    })
  }

  function handleNameChange(e) {
    setName(e.target.value)
  }

  function handleConnectionInfoChange(connectionInfo) {
    setConnectionInfo({ ...connectionInfo })
  }

  function saveHub() {
    console.log(hub.id, name, connectionInfo)
    wazzhub.saveHub({
      id: hub.id,
      type: hub.type,
      name: name,
      enabled: hub.enabled,
      connectionInfo: connectionInfo,
    })
    f7router.back({transition: 'f7-dive'})
  }

  function deleteHub() {
    const app = f7router.app
    app.dialog.confirm(`Are you sure you want to delete ${name}?`, 'Delete', () => {
      wazzhub.deleteHub(hub.id)
      f7router.back({transition: 'f7-dive'})
    })
  }

  const url = useMemo(() => {
    return generateUrl()
  }, [name, connectionInfo, hub])

  const EditHubPage = hub.hubPage()

  return (
    <Page name="editHub">
      <Navbar title={isNew ? "Add hub" : name} subtitle={hub.type} backLink="Cancel">
        <Link onClick={saveHub} slot="right">Save</Link>
      </Navbar>
      <List>
        <ListInput
          type="text"
          value={name}
          placeholder="Name (My hub)"
          onInput={handleNameChange}
          onChange={handleNameChange}
        />
      </List>
      <EditHubPage connectionInfo={connectionInfo} onChange={handleConnectionInfoChange}/>
      <List>
        <ListItem>
          <HubQr url={url} size={300} />
        </ListItem>
        <ListItem divider />
        {!isNew && (<ListButton color="white" bgColor="red" onClick={deleteHub}>
          <Icon ios="f7:trash" aurora="f7:trash" md="f7:trash" />
        </ListButton>)}
      </List>
    </Page>
  )
});
