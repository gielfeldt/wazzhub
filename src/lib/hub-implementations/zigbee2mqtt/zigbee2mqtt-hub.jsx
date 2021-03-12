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

  const address = connectionInfo.address || ''

  return (
    <List>
      <ListInput
          type="text"
          value={address}
          placeholder="MQTT address (ws://user:pass@mqtt:1234/base-topic)"
          onInput={handleAddressChanged}
          onChange={handleAddressChanged}
      />
    </List>
  )
});
