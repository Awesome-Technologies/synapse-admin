import React from "react";

import { createRoot } from "react-dom/client";

import App from "./App";
import { AppContext } from "./AppContext";

const baseUrl = import.meta.env.BASE_URL;
const configJSON = "config.json";
// if import.meta.env.BASE_URL have a trailing slash, remove it
// load config.json from relative path if import.meta.env.BASE_URL is None or empty
const configJSONUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/${configJSON}` : configJSON;

const root = document.getElementById("root");
if(!root)
  throw new Error('Failed to find document root');
fetch(configJSONUrl)
  .then(res => res.json())
  .then(props =>
    createRoot(root).render(
      <React.StrictMode>
        <AppContext.Provider value={props}>
          <App />
        </AppContext.Provider>
      </React.StrictMode>
    )
  );
