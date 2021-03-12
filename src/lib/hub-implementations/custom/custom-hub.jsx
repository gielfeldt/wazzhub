import React, { useState } from 'react';
import { view } from '@risingstack/react-easy-state';
import { List, ListInput } from 'framework7-react';

export default view(({ connectionInfo, onChange }) => {
  const [address, setAddress] = useState(connectionInfo.address)

  function handleAddressChanged(e) {
    setAddress(e.target.value)
    connectionInfo.address = address
    onChange(connectionInfo)
  }

  return (
    <List>
      <ListInput
          type="text"
          value={address}
          placeholder="MQTT address (ws://user:pass@mqtt:1234/base-topic)"
          onChange={handleAddressChanged}
          onBlur={handleAddressChanged}
      />
    </List>
  )
});
