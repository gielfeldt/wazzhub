import React, { useCallback, useMemo } from 'react';
import { view } from '@risingstack/react-easy-state';
import { Page, Navbar, List, Link, Icon, Preloader, ListItem } from 'framework7-react';
import DeviceItem from '../components/device'
import wazzhub from '../lib/hubs'
import './devices.css'
import device from '../components/device';
import uuid from 'uuid';

const TestSubItem = view(({info}) => {
  const payload = info.payload()
  //const device = info.device()
  const options = info.options()
  console.log("Rendering device really", info)
  // {JSON.stringify(device)}
  return (<pre>
    {JSON.stringify(options)}
    {JSON.stringify(payload)}
  </pre>)
})

const TestItem = view(({device}) => {
  console.log("Rendering device")
  //const info = device.info()
  return (
    <React.Fragment>
      zxczxc
      <div slot="title">{device.id}</div>
      <div slot="subtitle">{device.name}</div>
    </React.Fragment>
  )
  //return useMemo(() => (<TestSubItem info={info} />), [info.payload(), info.options()])
})

export default view(({ f7router }) => {
  console.log("Rendering devices")

  function toggleSearch() {
    if (!wazzhub.connected) return
    if (!wazzhub.searching) {
      wazzhub.startSearch()
    } else {
      wazzhub.stopSearch()
    }
  }

  function byName(a, b) {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }

  const newDevices = wazzhub.devices.filter(device => device.isNew).sort(byName)
  const oldDevices = wazzhub.devices.filter(device => !device.isNew).sort(byName)

  return (
    <Page name="devices">
    <Navbar title="Devices" subtitle={wazzhub.devices.length + " devices found"}>
      <Link slot="right" onClick={toggleSearch}>
        {wazzhub.connected && !wazzhub.searching && (<Icon ios="f7:search_circle" aurora="f7:search_circle" md="f7:search_circle" color="blue" />)}
        {wazzhub.connected && wazzhub.searching && (<Icon ios="f7:search_circle" aurora="f7:search_circle" md="f7:search_circle" color="red" />)}
        {!wazzhub.connected && (<Icon ios="f7:search_circle" aurora="f7:search_circle" md="f7:search_circle" color="gray" />)}
      </Link>
      {wazzhub.searching && (<Preloader slot="left" size={28} color="blue" />)}
    </Navbar>
    <List>
      {newDevices.map(device => (
        <DeviceItem key={device.hub().type + '_' + device.id} device={device} f7router={f7router} slot="list" />
      ))}
    </List>
    <List>
      {oldDevices.map(device => (
        <DeviceItem key={device.hub().type + '_' + device.id} device={device} f7router={f7router} slot="list" />
      ))}
    </List>
  </Page>
  )
});
