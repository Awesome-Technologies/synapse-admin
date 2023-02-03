// in src/Menu.js
import * as React from "react";
import { useMediaQuery } from "@mui/material";
import {
  MenuItemLink,
  useResourceDefinitions,
  useSidebarState,
} from "react-admin";
import DefaultIcon from "@mui/icons-material/ViewList";

const Menu = ({ onMenuClick, logout }) => {
  const isXSmall = useMediaQuery(theme => theme.breakpoints.down("xs"));
  const [open] = useSidebarState();
  const resourcesDefinitions = useResourceDefinitions();
  const resources = Object.keys(resourcesDefinitions).map(
    name => resourcesDefinitions[name]
  );
  return (
    <div>
      {resources.map(resource => (
        <MenuItemLink
          key={resource.name}
          to={`/${resource.name}`}
          primaryText={
            (resource.options && resource.options.label) || resource.name
          }
          leftIcon={resource.icon ? <resource.icon /> : <DefaultIcon />}
          onClick={onMenuClick}
          sidebarIsOpen={open}
        />
      ))}
      {isXSmall && logout}
    </div>
  );
};

export default Menu;
