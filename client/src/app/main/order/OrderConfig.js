import { authRoles } from "app/auth";
import Order from "./Order";

export const OrderConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path: "/orders/:orderId",
            component: Order    
        }
    ]
};
