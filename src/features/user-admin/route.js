// This is the JSON way to define React Router rules in a Rekit app.
// Learn more from: http://rekit.js.org/docs/routing.html

import {
  List,
} from './';
import { Layout } from '../common';

export default {
  path: 'user-admin',
  name: 'User admin',
  component: Layout,
  childRoutes: [
    { path: 'list', name: 'List', component: List, isIndex: true },
  ],
};
