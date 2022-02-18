// in src/Menu.js
import * as React from "react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "@mui/material";
import { MenuItemLink, getResources } from "react-admin";
import DefaultIcon from "@mui/icons-material/ViewList";
import LabelIcon from "@mui/icons-material/Label";

const Menu = ({ onMenuClick, logout }) => {
  const isXSmall = useMediaQuery(theme => theme.breakpoints.down("xs"));
  const open = useSelector(state => state.admin.ui.sidebarOpen);
  const resources = useSelector(getResources);
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
      <MenuItemLink
        to="/custom-route"
        primaryText="Miscellaneous"
        leftIcon={<LabelIcon />}
        onClick={onMenuClick}
        sidebarIsOpen={open}
      />
      {isXSmall && logout}
    </div>
  );
};

export default Menu;
