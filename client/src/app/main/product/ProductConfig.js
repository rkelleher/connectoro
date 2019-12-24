import { authRoles } from "app/auth";
import Product from "./Product";

export const ProductConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path: "/products/:productId",
            component: Product    
        }
    ]
};
