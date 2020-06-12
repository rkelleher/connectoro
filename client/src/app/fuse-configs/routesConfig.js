import React from "react";
import { Redirect } from "react-router-dom";
import { FuseUtils } from "@fuse";
import { DashboardConfig } from "app/main/dashboard/DashboardConfig";
import { LoginConfig } from "app/main/login/LoginConfig";
import { LogoutConfig } from "app/main/logout/LogoutConfig";
import { RegisterConfig } from "app/main/register/RegisterConfig";
import { AccountPageConfig } from "app/main/account/AccountPageConfig";
import { IntegrationPageConfig } from "app/main/integrations/IntegrationPageConfig";
import { EmailSettingsPageConfig } from "app/main/email/EmailSettingsPageConfig";
import { OrdersConfig } from "app/main/orders/OrdersConfig";
import { OrderConfig } from "app/main/order/OrderConfig";
import { ProductConfig } from "app/main/product/ProductConfig";
import { ProductsConfig } from "app/main/products/ProductsConfig";

const routeConfigs = [
    ProductConfig,
    ProductsConfig,
    OrderConfig,
    OrdersConfig,
    DashboardConfig,
    AccountPageConfig,
    IntegrationPageConfig,
    EmailSettingsPageConfig, 
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
