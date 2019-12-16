import React from 'react';
import {Redirect} from 'react-router-dom';
import {FuseUtils} from '@fuse';
import {DashboardConfig} from 'app/main/dashboard/DashboardConfig';
import {LoginConfig} from 'app/main/login/LoginConfig';
import {LogoutConfig} from 'app/main/logout/LogoutConfig';
import {RegisterConfig} from 'app/main/register/RegisterConfig';
import { AccountConfig } from 'app/main/account/AccountConfig';

const routeConfigs = [
    DashboardConfig,
    AccountConfig,
    LoginConfig,
    LogoutConfig,
    RegisterConfig
];

const routes = [
    ...FuseUtils.generateRoutesFromConfigs(routeConfigs),
    {
        path     : '/',
        component: () => <Redirect to="/dashboard"/>
    }
];

export default routes;
