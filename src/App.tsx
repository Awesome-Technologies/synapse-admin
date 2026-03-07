import { merge } from "lodash";
import polyglotI18nProvider from "ra-i18n-polyglot";

import { QueryClient } from "@tanstack/react-query";
import { Admin, Authenticated, CustomRoutes, Resource, reactRouterProvider, resolveBrowserLocale } from "react-admin";
import { Route as ReactRouterDomRoute } from "react-router-dom";

import { ImportFeature } from "./components/ImportFeature";
import germanMessages from "./i18n/de";
import englishMessages from "./i18n/en";
import farsiMessages from "./i18n/fa";
import frenchMessages from "./i18n/fr";
import italianMessages from "./i18n/it";
import russianMessages from "./i18n/ru";
import chineseMessages from "./i18n/zh";
import LoginPage from "./pages/LoginPage";
import destinations from "./resources/destinations";
import registrationToken from "./resources/registration_tokens";
import reports from "./resources/reports";
import roomDirectory from "./resources/room_directory";
import rooms from "./resources/rooms";
import userMediaStats from "./resources/user_media_statistics";
import users from "./resources/users";
import authProvider from "./synapse/authProvider";
import dataProvider from "./synapse/dataProvider";

// TODO: Can we use lazy loading together with browser locale?
const messages = {
  de: germanMessages,
  en: englishMessages,
  fa: farsiMessages,
  fr: frenchMessages,
  it: italianMessages,
  ru: russianMessages,
  zh: chineseMessages,
};
const availableLocales = [
  { locale: "en", name: "English" },
  { locale: "de", name: "Deutsch" },
  { locale: "fr", name: "Français" },
  { locale: "it", name: "Italiano" },
  { locale: "fa", name: "Persian(فارسی)" },
  { locale: "ru", name: "Russian(Русский)" },
  { locale: "zh", name: "简体中文" },
];
const i18nProvider = polyglotI18nProvider(
  locale => (messages[locale] ? merge({}, messages.en, messages[locale]) : messages.en),
  resolveBrowserLocale(),
  availableLocales
);

const queryClient = new QueryClient();
const Route = import.meta.env.MODE === "test" ? reactRouterProvider.Route : ReactRouterDomRoute;

const App = () => (
  <Admin
    disableTelemetry
    requireAuth
    loginPage={LoginPage}
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
    queryClient={queryClient}
  >
    <CustomRoutes>
      <Route
        path="/import_users"
        element={
          <Authenticated>
            <ImportFeature />
          </Authenticated>
        }
      />
    </CustomRoutes>
    <Resource {...users} />
    <Resource {...rooms} />
    <Resource {...userMediaStats} />
    <Resource {...reports} />
    <Resource {...roomDirectory} />
    <Resource {...destinations} />
    <Resource {...registrationToken} />
    <Resource name="connections" />
    <Resource name="devices" />
    <Resource name="room_members" />
    <Resource name="users_media" />
    <Resource name="joined_rooms" />
    <Resource name="pushers" />
    <Resource name="servernotices" />
    <Resource name="forward_extremities" />
    <Resource name="room_state" />
    <Resource name="destination_rooms" />
  </Admin>
);

export default App;
