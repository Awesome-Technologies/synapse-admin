import { merge } from "lodash";
import polyglotI18nProvider from "ra-i18n-polyglot";

import { Admin, CustomRoutes, Resource, resolveBrowserLocale } from "react-admin";
import { Route } from "react-router-dom";

import { AdminLayout } from "./components/AdminLayout";
import { ImportFeature } from "./components/ImportFeature";
import germanMessages from "./i18n/de";
import englishMessages from "./i18n/en";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer from "./components/Footer";

// TODO: Can we use lazy loading together with browser locale?
const messages = {
  de: germanMessages,
  en: englishMessages,
  fr: frenchMessages,
  it: italianMessages,
  ru: russianMessages,
  zh: chineseMessages,
};
const i18nProvider = polyglotI18nProvider(
  locale => (messages[locale] ? merge({}, messages.en, messages[locale]) : messages.en),
  resolveBrowserLocale(),
  [
    { locale: "en", name: "English" },
    { locale: "de", name: "Deutsch" },
    { locale: "fr", name: "Français" },
    { locale: "it", name: "Italiano" },
    { locale: "fa", name: "Persian(فارسی)" },
    { locale: "ru", name: "Russian(Русский)" },
    { locale: "zh", name: "简体中文" },
  ]
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Admin
      disableTelemetry
      requireAuth
      layout={AdminLayout}
      loginPage={LoginPage}
      authProvider={authProvider}
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}
    >
      <CustomRoutes>
        <Route path="/import_users" element={<ImportFeature />} />
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
    <Footer />
  </QueryClientProvider>
);

export default App;
