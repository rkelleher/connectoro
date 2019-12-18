import React from "react";
import { Redirect } from "react-router-dom";
import { FuseUtils } from "@fuse";
import { DashboardConfig } from "app/main/dashboard/DashboardConfig";
import { LoginConfig } from "app/main/login/LoginConfig";
import { LogoutConfig } from "app/main/logout/LogoutConfig";
import { RegisterConfig } from "app/main/register/RegisterConfig";
import { AccountPageConfig } from "app/main/account/AccountPageConfig";

const routeConfigs = [
    DashboardConfig,
    AccountPageConfig,
    LoginConfig,
    LogoutConfig,
    RegisterConfig
];

const routes = [
    ...FuseUtils.generateRoutesFromConfigs(routeConfigs),
    {
        path: "/",
        component: () => <Redirect to="/dashboard" />
    }
];

export default routes;
