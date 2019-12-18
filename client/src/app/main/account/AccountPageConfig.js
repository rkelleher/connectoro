import {authRoles} from 'app/auth';
import AccountPage from './AccountPage';

export const AccountPageConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path     : '/account',
            component: AccountPage
        }
    ]
};
