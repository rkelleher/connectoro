import React from "react";
import { Typography } from "@material-ui/core";
import { FuseAnimate } from "@fuse";

function OrdersHeader(props) {
    return (
        <div className="flex flex-1 w-full items-center justify-between">
            <div className="flex items-center">
                <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                    <Typography className="hidden sm:flex" variant="h6">
                        Orders
                    </Typography>
                </FuseAnimate>
            </div>
        </div>
    );
}

export default OrdersHeader;
