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

  function addGroup(hub) {
    console.log(hub)
    // f7router.navigate(`/hubs/${hub.id}/edit`, {props: { isNew: true, hub: { ...hub }}})
  }

  const groups = wazzhub.groups.filter(i => true).sort(byName)
  console.log(groups)

  const hubs = wazzhub.all

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
        {hubs.length > 1 && (
          <ListButton actionsOpen="#actions-select-type-group">
            <Icon ios="f7:plus_circle" aurora="f7:plus_circle" md="f7:plus_circle" />  Add group
          </ListButton>
        )}
        {hubs.length == 1 && (
          <ListButton onClick={() => addGroup(hubs[0])}>
            <Icon ios="f7:plus_circle" aurora="f7:plus_circle" md="f7:plus_circle" />  Add group
          </ListButton>
        )}
      </List>
      {hubs.length > 1 && (<Actions id="actions-select-type-group">
        <ActionsGroup>
          <ActionsLabel>Add group to hub ...</ActionsLabel>
          {hubs.map((hub) => (
            <ActionsButton key={hub.id} onClick={() => addGroup(hub)}>{hub.name}</ActionsButton>
          ))}
          <ActionsButton color="red">Cancel</ActionsButton>
        </ActionsGroup>
      </Actions>)}
    </Page>
  )
});
