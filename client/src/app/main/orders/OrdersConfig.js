import { authRoles } from "app/auth";
import OrdersPage from "./OrdersPage";

export const OrdersConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path: "/orders",
            component: OrdersPage
        }
    ]
};
