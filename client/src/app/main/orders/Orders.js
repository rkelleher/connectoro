import React from "react";
import { FusePageCarded } from "@fuse";
import OrdersHeader from "./OrdersHeader";
import OrdersTable from "./OrdersTable";

function Orders() {
    return (
        <FusePageCarded
            classes={{
                content: "flex",
                header: "min-h-72 h-72 sm:h-136 sm:min-h-136"
            }}
            header={<OrdersHeader />}
            content={<OrdersTable />}
            innerScroll
        />
    );
}

export default Orders;
