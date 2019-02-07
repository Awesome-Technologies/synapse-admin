import {
  Login,
} from './';

export default {
  path: '/',
  name: 'Home',
  childRoutes: [
    { path: 'login',
      name: 'Login',
      component: Login,
      isIndex: true,
    },
  ],
};
