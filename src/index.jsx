import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const REACT_APP_SERVER = import.meta.env.VITE_APP_SERVER;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
