import React from 'react';
import {Redirect} from 'react-router-dom';
import {FuseUtils} from '@fuse';
import {DashboardConfig} from 'app/main/dashboard/DashboardConfig';
import {LoginConfig} from 'app/main/login/LoginConfig';

const routeConfigs = [
    DashboardConfig,
    LoginConfig
];

const routes = [
    ...FuseUtils.generateRoutesFromConfigs(routeConfigs, ),
    {
        path     : '/',
        component: () => <Redirect to="/dashboard"/>
    }
];

export default routes;
