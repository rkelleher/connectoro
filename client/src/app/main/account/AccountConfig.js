import {authRoles} from 'app/auth';
import Account from './Account';

export const AccountConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    auth: authRoles.admin,
    routes: [
        {
            path     : '/account',
            component: Account
        }
    ]
};
