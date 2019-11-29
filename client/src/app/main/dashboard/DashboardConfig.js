import {authRoles} from 'app/auth';
import Dashboard from './Dashboard';

export const DashboardConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth: authRoles.admin,
    routes: [
        {
            path     : '/dashboard',
            component: Dashboard
        }
    ]
};
