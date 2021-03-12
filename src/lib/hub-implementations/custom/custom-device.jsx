import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { Page, Navbar, Link } from 'framework7-react';

export default view(({ device }) => {

  return (
    <Page name="editHub">
      <Navbar title={device.id} subtitle={device.name} backLink="Back">
      </Navbar>
      A Custom device!
    </Page>
  )
});
