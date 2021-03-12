import React, { useState, useCallback, useEffect } from 'react';
import { view } from '@risingstack/react-easy-state';
import { Page, Navbar, List, ListItem, Toggle, ListButton, Actions, ActionsButton, ActionsLabel, ActionsGroup, Icon, Badge, Preloader } from 'framework7-react';
import wazzhub from '../lib/hubs'

export default view(({ f7router }) => {

  //const [quickConnectHub, setQuickConnectHub] = useState(null)

  const checkHash = (hash) => {
    console.log("Checking", hash)
    if (hash.startsWith('#quick-connect=')) {
      const wantHub = JSON.parse(atob(hash.replace(/^#quick-connect=/, '')))
      const hub = { ...wazzhub.newHub(wantHub.type), ...wantHub }
      console.log("new hub is", hub)
      window.location.hash = ''
      wazzhub.saveHub(hub)
    }
  }

  const onLocationChange = useCallback(
    () => {
      console.log("ADDING LISTENER")
      window.addEventListener('popstate', () => {
        console.log("Received update", window.location.hash)
        checkHash(window.location.hash)
        //setHash(window.location.hash)
      })
    },
    [],
  );

  function addHub(type) {
    const hub =  wazzhub.newHub(type)
    f7router.navigate(`/hubs/${hub.id}/edit`, {props: { isNew: true, hub: { ...hub }}})
  }

  function handleToggle(hub, on) {
    //console.log(hub, on)
    if (on) {
      wazzhub.enable(hub.id)
    } else {
      wazzhub.disable(hub.id)
    }
  }

  useEffect(() => {
    console.log("Mounting")
    checkHash(window.location.hash)
    onLocationChange()
  }, [])


  return (
    <Page name="hubs">
      <Navbar title="Hubs" subtitle={wazzhub.all.length + " hubs found"}>
      </Navbar>
      <List>
      {wazzhub.all.map((hub) => (
        <ListItem
          mediaItem
          key={hub.id}
          subtitle={hub.label()}
          link
          onClick={() => f7router.navigate(`/hubs/${hub.id}/edit`, {props: { hub: { ...hub }}})}
        >
          <Badge slot="title" color={hub.color()}>{hub.name}</Badge>
          {/*<Badge slot="after-title">{hub.connection.connected ? 'connected' : 'not connected'}</Badge>*/}
          {hub.connecting() === 'ready' && (
            <Icon
              slot="media"
              ios="f7:power" md="f7:power" aurora="f7:power"
              color={hub.connected ? 'green' : 'red'}/>
          )}
          {hub.connecting() !== 'ready' && (
            <Preloader slot="media" size={28} color="blue" />
          )}
          <Toggle slot="after" checked={hub.enabled} onToggleChange={(on) => handleToggle(hub, on)}></Toggle>
        </ListItem>
      ))}
      </List>
      <List inset>
        {wazzhub.hubTypes.length > 1 && (
          <ListButton actionsOpen="#actions-select-type">
            <Icon ios="f7:plus_circle" aurora="f7:plus_circle" md="f7:plus_circle" />  Add hub
          </ListButton>
        )}
        {wazzhub.hubTypes.length == 1 && (
          <ListButton onClick={() => addHub(wazzhub.hubTypes[0][0])}>
            <Icon ios="f7:plus_circle" aurora="f7:plus_circle" md="f7:plus_circle" />  Add hub
          </ListButton>
        )}
      </List>
      {wazzhub.hubTypes.length > 1 && (<Actions id="actions-select-type">
        <ActionsGroup>
          <ActionsLabel>Select hub type</ActionsLabel>
          {wazzhub.hubTypes.map(([hubTypeKey, hubType]) => (
            <ActionsButton key={hubTypeKey} onClick={() => addHub(hubTypeKey)}>{hubType.label()}</ActionsButton>
          ))}
          <ActionsButton color="red">Cancel</ActionsButton>
        </ActionsGroup>
      </Actions>)}
    </Page>
  )
});
