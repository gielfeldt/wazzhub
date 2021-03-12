import React from 'react';
import { view } from '@risingstack/react-easy-state';

export default view(({ device, f7router }) => {
  console.log("Rendering device", device)

  const EditDevicePage = device.editDevicePage()

  return (
    <EditDevicePage device={device} f7router={f7router} />
  )
});
