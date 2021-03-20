import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { List, ListInput } from 'framework7-react';

export default view(({ connectionInfo, onChange }) => {
  function handleAddressChanged(e) {
    onChange({
      ...connectionInfo,
      address: e.target.value
    })
  }

  function handleTopicChanged(e) {
    onChange({
      ...connectionInfo,
      baseTopic: e.target.value
    })
  }

  const address = connectionInfo.address ?? ''
  const baseTopic = connectionInfo.baseTopic ?? 'zigbee2mqtt'

  return (
    <List>
      <ListInput
          type="text"
          value={address}
          placeholder="ws://user:pass@mqtt:1234/base-topic"
          label="MQTT address"
          floatingLabel
          onInput={handleAddressChanged}
          onChange={handleAddressChanged}
      />
      <ListInput
          type="text"
          value={baseTopic}
          placeholder="zigbee2mqtt"
          label="Base topic"
          floatingLabel
          onInput={handleTopicChanged}
          onChange={handleTopicChanged}
      />
    </List>
  )
});
