import { Layout, Menu } from 'react-admin';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';

const DEFAULT_SUPPORT_LINK = "https://github.com/etkecc/synapse-admin/issues";
const supportLink = (): string => {
    try {
        new URL(localStorage.getItem("support_url") || ''); // Check if the URL is valid
        return localStorage.getItem("support_url") || DEFAULT_SUPPORT_LINK;
    } catch (e) {
        return DEFAULT_SUPPORT_LINK;
    }
};


const AdminMenu = () => (
    <Menu>
        <Menu.ResourceItems />
        <Menu.Item to={supportLink()} target="_blank" primaryText="Contact support" leftIcon={<LiveHelpIcon />} />
    </Menu>
);

export const AdminLayout = ({ children }) => (
    <Layout menu={AdminMenu}>
        {children}
    </Layout>
);
