import { createContext, useContext } from "react";

interface AppContextType {
  restrictBaseUrl: string | string[];
  asManagedUsers: string[];
  supportURL: string;
}

export const AppContext = createContext({});

export const useAppContext = () => useContext(AppContext) as AppContextType;
