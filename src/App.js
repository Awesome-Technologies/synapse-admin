import React from "react";
import { Admin, Resource, resolveBrowserLocale } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import authProvider from "./synapse/authProvider";
import dataProvider from "./synapse/dataProvider";
import { UserList, UserCreate, UserEdit } from "./components/users";
import { RoomList, RoomCreate } from "./components/rooms";
import LoginPage from "./components/LoginPage";
import UserIcon from "@material-ui/icons/Group";
import { ViewListIcon as RoomIcon } from "@material-ui/icons/ViewList";
import germanMessages from "./i18n/de";
import englishMessages from "./i18n/en";
import ShowUserPdf from "./components/ShowUserPdf";
import { Route } from "react-router-dom";

// TODO: Can we use lazy loading together with browser locale?
const messages = {
  de: germanMessages,
  en: englishMessages,
};
const i18nProvider = polyglotI18nProvider(
  locale => (messages[locale] ? messages[locale] : messages.en),
  resolveBrowserLocale()
);

const App = () => (
  <Admin
    loginPage={LoginPage}
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
    customRoutes={[
      <Route key="showpdf" path="/showpdf" component={ShowUserPdf} />,
    ]}
  >
    <Resource
      name="users"
      list={UserList}
      create={UserCreate}
      edit={UserEdit}
      icon={UserIcon}
    />
    <Resource
      name="rooms"
      list={RoomList}
      create={RoomCreate}
      icon={RoomIcon}
    />
    <Resource name="connections" />
  </Admin>
);

export default App;
