import React from "react";
import { Admin, Resource } from "react-admin";
import dataProvider from "./dataProvider";

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="data" />
  </Admin>
);

export default App;
