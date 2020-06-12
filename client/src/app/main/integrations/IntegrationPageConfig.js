import {authRoles} from 'app/auth';
import IntegrationPage from './IntegrationPage';

export const IntegrationPageConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path     : '/integrations',
            component: IntegrationPage
        }
    ]
};
