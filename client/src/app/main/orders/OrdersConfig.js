import { authRoles } from "app/auth";
import Orders from "./Orders";

export const OrdersConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path: "/orders",
            component: Orders
        }
    ]
};
