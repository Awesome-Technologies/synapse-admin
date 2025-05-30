import React from "react";

import { createRoot } from "react-dom/client";

import App from "./App";
import { AppContext } from "./AppContext";

const baseUrl = import.meta.env.BASE_URL;
const configJSON = "config.json";
// if import.meta.env.BASE_URL have a trailing slash, remove it
// load config.json from relative path if import.meta.env.BASE_URL is None or empty
const configJSONUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/${configJSON}` : configJSON;

fetch(configJSONUrl)
  .then(res => res.json())
  .then(props =>
    createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <AppContext.Provider value={props}>
          <App />
        </AppContext.Provider>
      </React.StrictMode>
    )
  );
