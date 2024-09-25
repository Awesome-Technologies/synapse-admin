import React from "react";

import { createRoot } from "react-dom/client";

import App from "./App";
import { AppContext } from "./AppContext";
import storage from "./storage";

fetch("config.json")
  .then(res => res.json())
  .then(props => {
    storage.setItem("as_managed_users", JSON.stringify(props.asManagedUsers));
    storage.setItem("support_url", props.supportURL);
    return createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <AppContext.Provider value={props}>
          <App />
        </AppContext.Provider>
      </React.StrictMode>
    )
  });
