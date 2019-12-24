import { authRoles } from "app/auth";
import ProductsPage from "./ProductsPage";

export const ProductsConfig = {
    auth: authRoles.admin,
    routes: [
        {
            path: "/products",
            component: ProductsPage
        }
    ]
};
