import {authRoles} from 'app/auth';
import EmailSettingsPage from './EmailSettingsPage';

export const EmailSettingsPageConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path     : '/email-settings',
            component: EmailSettingsPage
        }
    ]
};
