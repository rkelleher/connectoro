import React from "react";
import { FusePageCarded } from "@fuse";
import ProductsHeader from "./ProductsHeader";
import ProductsTable from "./ProductsTable";

function ProductsPage() {
    return (
        <FusePageCarded
            classes={{
                content: "flex",
                header: "min-h-72 h-72 sm:h-136 sm:min-h-136"
            }}
            header={<ProductsHeader />}
            content={<ProductsTable />}
            innerScroll
        />
    );
}

export default ProductsPage;
