import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { Page, Navbar, List, ListButton, Actions, ActionsGroup, ActionsLabel, ActionsButton, Icon } from 'framework7-react';
import GroupItem from '../components/group'
import wazzhub from '../lib/hubs'

export default view(({ f7router }) => {
  console.log("Rendering groups")

  function byName(a, b) {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }

  function addGroup(type) {
    const hub =  wazzhub.newHub(type)
    f7router.navigate(`/hubs/${hub.id}/edit`, {props: { isNew: true, hub: { ...hub }}})
  }

  const groups = wazzhub.groups.filter(i => true).sort(byName)
  console.log(groups)

  return (
    <Page name="groups">
      <Navbar title="Groups" subtitle={wazzhub.groups.length + " groups found"}>
      </Navbar>
      <List>
        {groups.map(group => (
          <GroupItem key={group.id} group={group} f7router={f7router} slot="list" />
        ))}
      </List>
      <List inset>
        {wazzhub.hubTypes.length > 1 && (
          <ListButton actionsOpen="#actions-select-type-group">
            <Icon ios="f7:plus_circle" aurora="f7:plus_circle" md="f7:plus_circle" />  Add group
          </ListButton>
        )}
        {wazzhub.hubTypes.length == 1 && (
          <ListButton onClick={() => addHub(wazzhub.hubTypes[0][0])}>
            <Icon ios="f7:plus_circle" aurora="f7:plus_circle" md="f7:plus_circle" />  Add group
          </ListButton>
        )}
      </List>
      {wazzhub.hubTypes.length > 1 && (<Actions id="actions-select-type-group">
        <ActionsGroup>
          <ActionsLabel>Add group to hub ...</ActionsLabel>
          {wazzhub.hubTypes.map(([hubTypeKey, hubType]) => (
            <ActionsButton key={hubTypeKey} onClick={() => addGroup(hubTypeKey)}>{hubType.label()}</ActionsButton>
          ))}
          <ActionsButton color="red">Cancel</ActionsButton>
        </ActionsGroup>
      </Actions>)}
    </Page>
  )
});
