import { AppBar, Confirm, Layout, Logout, Menu, useLogout, UserMenu } from "react-admin";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import { LoginMethod } from "../pages/LoginPage";
import { useState } from "react";

const DEFAULT_SUPPORT_LINK = "https://github.com/etkecc/synapse-admin/issues";
const supportLink = (): string => {
  try {
    new URL(localStorage.getItem("support_url") || ""); // Check if the URL is valid
    return localStorage.getItem("support_url") || DEFAULT_SUPPORT_LINK;
  } catch (e) {
    return DEFAULT_SUPPORT_LINK;
  }
};

const AdminUserMenu = () => {
  const [open, setOpen] = useState(false);
  const logout = useLogout();
  const checkLoginType = (ev: React.MouseEvent<HTMLDivElement>) => {
    const loginType: LoginMethod = (localStorage.getItem("login_type") || "credentials") as LoginMethod;
    if (loginType === "accessToken") {
      ev.stopPropagation();
      setOpen(true);
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    logout();
  };

  const handleDialogClose = () => {
    setOpen(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("login_type");
    window.location.reload();
  };

  return (
    <UserMenu>
      <div onClickCapture={checkLoginType}>
        <Logout />
      </div>
      <Confirm
        isOpen={open}
        title="synapseadmin.auth.logout_acces_token_dialog.title"
        content="synapseadmin.auth.logout_acces_token_dialog.content"
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        confirm="synapseadmin.auth.logout_acces_token_dialog.confirm"
        cancel="synapseadmin.auth.logout_acces_token_dialog.cancel"
      />
    </UserMenu>
  );
};

const AdminAppBar = () => <AppBar userMenu={<AdminUserMenu />} />;

const AdminMenu = () => (
  <Menu>
    <Menu.ResourceItems />
    <Menu.Item to={supportLink()} target="_blank" primaryText="Contact support" leftIcon={<LiveHelpIcon />} />
  </Menu>
);

export const AdminLayout = ({ children }) => (
  <Layout appBar={AdminAppBar} menu={AdminMenu}>
    {children}
  </Layout>
);
