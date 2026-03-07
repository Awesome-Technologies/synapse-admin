import React from "react";

import { createRoot } from "react-dom/client";

import { Bootstrap } from "./bootstrap";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);
