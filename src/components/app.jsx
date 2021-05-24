import React, { useEffect } from 'react';
import { f7ready, App, Views, View, Toolbar, Link } from 'framework7-react';
import routes from '../lib/routes'
import wazzhub from '../lib/hubs'

const f7params = {
  name: 'WazzHub',
  id: 'dk.gielfeldt.wazzhub',
  theme: 'auto',
  routes,
};

export default () => {
  useEffect(() => {
    f7ready((f7) => {
      wazzhub.setApp(f7)
    })
  }, []);

  return (
    // Main Framework7 App component where we pass Framework7 params
    <App { ...f7params }>
      <Views tabs>
        <Toolbar tabbar bottom labels>
          <Link tabLink="#view-hubs" tabLinkActive iconIos="f7:house_fill" iconAurora="f7:house_fill" iconMd="material:home" text="Hubs" />
          <Link tabLink="#view-devices" iconIos="f7:gear" iconAurora="f7:gear" iconMd="material:settings" text="Devices" />
          <Link tabLink="#view-groups" iconIos="f7:person_3" iconAurora="f7:person_3" iconMd="f7:person_3" text="Groups" />
        </Toolbar>

        <View xhrCache={false} animate={true} id="view-hubs" main tab tabActive url="/hubs/" />
        <View xhrCache={false} animate={true} id="view-devices" tab url="/devices/" />
        <View xhrCache={false} animate={true} id="view-groups" tab url="/groups/" />
      </Views>
    </App>
  )
}