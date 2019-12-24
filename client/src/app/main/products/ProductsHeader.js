import React from "react";
import { Typography, Button } from "@material-ui/core";
import { FuseAnimate } from "@fuse";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";

function ProductsHeader(props) {
    const dispatch = useDispatch();
    return (
        <div className="flex flex-1 w-full items-center justify-between">
            <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                <Typography className="hidden sm:flex" variant="h6">
                    Products
                </Typography>
            </FuseAnimate>
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button
                    variant="contained"
                    onClick={() => dispatch(Actions.createProduct())}
                >
                    Create Product
                </Button>
            </FuseAnimate>
        </div>
    );
}

export default ProductsHeader;
