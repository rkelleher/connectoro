import React, { useEffect, useState } from "react";
import JSONPretty from "react-json-pretty";
import { Icon, Tab, Tabs, Typography } from "@material-ui/core";
import { FuseAnimate, FusePageCarded, FuseLoading } from "@fuse";
import { Link } from "react-router-dom";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";
import EasyncProductOptions from "../integrations/easync/EasyncProductOptions";
import { Options } from "app/components/Options";
import { ProductIdentifierTable } from "./ProductExternalIdsTable";

const ProductHeader = ({ title }) => {
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
                            {"Product Details: " + (title || "Untitled Product")}
                        </Typography>
                    </FuseAnimate>
                </div>
            </div>
        </div>
    );
};

const ProductData = ({ product }) => {
    return (
        <div className="pb-48">
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Product Data
                </Typography>
            </div>
            <JSONPretty id="json-pretty" data={product}></JSONPretty>
        </div>
    );
};

const ProductEasyncOptions = ({ product }) => {
    const isSavingEasync = useSelector(
        ({ product }) => product.isSavingEasyncSelectionCriteria
    );
    return (
        <div className="pb-48">
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Default Order Options
                </Typography>
            </div>
            <EasyncProductOptions
                data={product["integrationData"]["EASYNC"]["orderProductData"]}
                isSaving={isSavingEasync}
                saveAction={Actions.saveProductEasyncSelectionCriteriaOptions}
                saveActionParam={product._id}
            />
        </div>
    );
};

const ProductDetails = ({ product }) => {
    const isSavingDetails = useSelector(
        ({ product }) => product.isSavingDetails
    );
    return (
        <div>
            <div className="pb-48">
                <Options
                    id={product._id}
                    data={{
                        SKU: product.SKU || "",
                        title: product.title || ""
                    }}
                    isSaving={isSavingDetails}
                    saveAction={Actions.saveProductDetails}
                    saveActionParam={product._id}
                />
            </div>
        </div>
    );
};

function Product(props) {
    const dispatch = useDispatch();
    const product = useSelector(({ product }) => product.activeProduct);
    const isFetching = useSelector(({ product }) => product.isFetching)

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        dispatch(Actions.getProduct(props.match.params));
    }, [dispatch, props.match.params]);

    function handleChangeTab(event, tabValue) {
        setTabValue(tabValue);
    }

    return isFetching ? (
        <FuseLoading />
    ) : (
        <FusePageCarded
            classes={{
                content: "flex",
                header: "min-h-72 h-72 sm:h-136 sm:min-h-136"
            }}
            header={product && <ProductHeader {...product} />}
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
                    <Tab className="h-64 normal-case" label="General" />
                    <Tab className="h-64 normal-case" label="Identifiers" />
                    <Tab className="h-64 normal-case" label="Easync" />
                    <Tab className="h-64 normal-case" label="Data" />
                </Tabs>
            }
            content={
                product && (
                    <div className="p-16 sm:p-24 max-w-2xl w-full">
                        {tabValue === 0 && <ProductDetails product={product} />}
                        {tabValue === 1 && (
                            <ProductIdentifierTable product={product} />
                        )}
                        {tabValue === 2 && (
                            <ProductEasyncOptions product={product} />
                        )}
                        {tabValue === 3 && <ProductData product={product} />}
                    </div>
                )
            }
            innerScroll
        />
    );
}

export default Product;
