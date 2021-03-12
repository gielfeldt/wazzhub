
import Hubs from '../pages/hubs.jsx';
import Devices from '../pages/devices.jsx';
import Groups from '../pages/groups.jsx';
import Device from '../pages/device.jsx';
import EditHub from '../pages/edithub.jsx';

var routes = [
  {
    path: '/hubs/',
    component: Hubs,
  },
  {
    path: '/hubs/:id/edit',
    component: EditHub,
  },
  {
    path: '/devices/',
    component: Devices,
  },
  {
    path: '/groups/',
    component: Groups,
  },
  {
    path: '/device/',
    component: Device,
  },
]

export default routes;
