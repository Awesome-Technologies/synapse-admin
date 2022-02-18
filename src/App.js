import React from "react";
import { Admin, Resource, resolveBrowserLocale } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import authProvider from "./synapse/authProvider";
import dataProvider from "./synapse/dataProvider";
import { UserList, UserCreate, UserEdit } from "./components/users";
import { RoomList, RoomCreate, RoomShow, RoomEdit } from "./components/rooms";
import { ReportList, ReportShow } from "./components/EventReports";
import LoginPage from "./components/LoginPage";
import UserIcon from "@material-ui/icons/Group";
import ConfirmationNumberIcon from "@material-ui/icons/ConfirmationNumber";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import { UserMediaStatsList } from "./components/statistics";
import RoomIcon from "@material-ui/icons/ViewList";
import ReportIcon from "@material-ui/icons/Warning";
import FolderSharedIcon from "@material-ui/icons/FolderShared";
import { ImportFeature } from "./components/ImportFeature";
import {
  RegistrationTokenCreate,
  RegistrationTokenEdit,
  RegistrationTokenList,
} from "./components/RegistrationTokens";
import { RoomDirectoryList } from "./components/RoomDirectory";
import { Route } from "react-router-dom";
import germanMessages from "./i18n/de";
import englishMessages from "./i18n/en";
import chineseMessages from "./i18n/zh";
import ShowUserPdf from "./components/ShowUserPdf";

// TODO: Can we use lazy loading together with browser locale?
const messages = {
  de: germanMessages,
  en: englishMessages,
  zh: chineseMessages,
};
const i18nProvider = polyglotI18nProvider(
  locale => (messages[locale] ? messages[locale] : messages.en),
  resolveBrowserLocale()
);

const App = () => (
  <Admin
    disableTelemetry
    loginPage={LoginPage}
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
    customRoutes={[
      <Route key="csvImport" path="/importcsv" component={ImportFeature} />,
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
      show={RoomShow}
      edit={RoomEdit}
      icon={RoomIcon}
    />
    <Resource
      name="user_media_statistics"
      list={UserMediaStatsList}
      icon={EqualizerIcon}
    />
    <Resource
      name="reports"
      list={ReportList}
      show={ReportShow}
      icon={ReportIcon}
    />
    <Resource
      name="room_directory"
      list={RoomDirectoryList}
      icon={FolderSharedIcon}
    />
    <Resource
      name="registration_tokens"
      list={RegistrationTokenList}
      create={RegistrationTokenCreate}
      edit={RegistrationTokenEdit}
      icon={ConfirmationNumberIcon}
    />
    <Resource name="connections" />
    <Resource name="devices" />
    <Resource name="room_members" />
    <Resource name="users_media" />
    <Resource name="joined_rooms" />
    <Resource name="pushers" />
    <Resource name="servernotices" />
    <Resource name="forward_extremities" />
    <Resource name="room_state" />
  </Admin>
);

export default App;
