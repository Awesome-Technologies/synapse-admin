import { useEffect, useState } from "react";

import App from "./App";
import { AppContext } from "./AppContext";

const baseUrl = import.meta.env.BASE_URL;
const configJSON = "config.json";
// if import.meta.env.BASE_URL have a trailing slash, remove it
// load config.json from relative path if import.meta.env.BASE_URL is None or empty
const configJSONUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/${configJSON}` : configJSON;

export type BootstrapState =
  | { status: "loading" }
  | { status: "loaded"; config: object }
  | { status: "error"; error: string };

export const Bootstrap = () => {
  const [state, setState] = useState<BootstrapState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    const loadConfig = async () => {
      try {
        const response = await fetch(configJSONUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const config = (await response.json()) as object;

        if (active) {
          setState({ status: "loaded", config });
        }
      } catch (error) {
        if (active) {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    };

    void loadConfig();

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <div>Loading configuration...</div>;
  }

  if (state.status === "error") {
    return <div>Failed to load configuration: {state.error}</div>;
  }

  return (
    <AppContext.Provider value={state.config}>
      <App />
    </AppContext.Provider>
  );
};
