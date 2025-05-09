import React from "react";

import { createRoot } from "react-dom/client";

import App from "./App";
import { AppContext } from "./AppContext";

fetch(`${import.meta.env.BASE_URL}/config.json`)
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
