import _ from "lodash";
import React, { useEffect, useState } from "react";
import JSONPretty from "react-json-pretty";
import { Icon, Tab, Tabs, Tooltip, Typography } from "@material-ui/core";
import { FuseAnimate, FusePageCarded } from "@fuse";
import { Link } from "react-router-dom";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";
import SimpleTable from "app/components/SimpleTable";
import EasyncProductOptions from "../integrations/easync/EasyncProductOptions";

const ProductHeader = ({id}) => {
    return (
        <div className="flex flex-1 w-full items-center justify-between">
            <div className="flex flex-1 flex-col items-center sm:items-start">
                <FuseAnimate animation="transition.slideRightIn" delay={300}>
                    <Typography
                        className="normal-case flex items-center sm:mb-12"
                        component={Link}
                        role="button"
                        to="/products"
                        color="inherit"
                    >
                        <Icon className="mr-4 text-20">arrow_back</Icon>
                        Products
                    </Typography>
                </FuseAnimate>

                <div className="flex flex-col min-w-0 items-center sm:items-start">
                    <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                        <Typography className="text-16 sm:text-20 truncate">
                            {"Product " + id}
                        </Typography>
                    </FuseAnimate>
                </div>
            </div>
        </div>
    );
};

const ProductData = product => {
    return (
        <div>
            <div className="pb-48">
                <div className="pb-16 flex items-center">
                    <Typography className="h2" color="textSecondary">
                        Product Data
                    </Typography>
                </div>
                <JSONPretty
                    id="json-pretty"
                    data={product}
                ></JSONPretty>
            </div>
        </div>
    );
};

const ProductDetails = ({ product }) => {
    const isSaving = useSelector(({product}) => product.isSavingEasyncSelectionCriteria)
    return (
        <div>
            <div className="pb-48">
                <div className="pb-16 flex items-center">
                    <Typography className="h2" color="textSecondary">
                        Details
                    </Typography>
                </div>
            </div>
            <div className="pb-48">
                <div className="pb-16 flex items-center">
                    <Typography className="h2" color="textSecondary">
                        Easync S
                    </Typography>
                </div>
                <EasyncProductOptions
                    data={product["integrationData"]["EASYNC"]["orderProductData"]}
                    isSaving={isSaving}
                    saveAction={Actions.saveProductEasyncSelectionCriteriaOptions}
                    saveActionParam={product._id}
                />
            </div>
        </div>
    );
};

function Product(props) {
    const dispatch = useDispatch();
    const product = useSelector(({ product }) => product.activeProduct);

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        dispatch(Actions.getProduct(props.match.params));
    }, [dispatch, props.match.params]);

    function handleChangeTab(event, tabValue) {
        setTabValue(tabValue);
    }

    return (
        <FusePageCarded
            classes={{
                content: "flex",
                header: "min-h-72 h-72 sm:h-136 sm:min-h-136"
            }}
            header={product && <ProductHeader id={product._id} />}
            contentToolbar={
                <Tabs
                    value={tabValue}
                    onChange={handleChangeTab}
                    indicatorColor="secondary"
                    textColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                    classes={{ root: "w-full h-64" }}
                >
                    <Tab className="h-64 normal-case" label="Product" />
                    <Tab className="h-64 normal-case" label="Data" />
                </Tabs>
            }
            content={
                product && (
                    <div className="p-16 sm:p-24 max-w-2xl w-full">
                        {tabValue === 0 && <ProductDetails product={product} />}
                        {tabValue === 1 && <ProductData product={product} />}
                    </div>
                )
            }
            innerScroll
        />
    );
}

export default Product;
