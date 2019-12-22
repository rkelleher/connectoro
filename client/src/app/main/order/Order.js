import _ from "lodash";
import React, { useEffect, useState } from "react";
import JSONPretty from "react-json-pretty";
import { Icon, Tab, Tabs, Tooltip, Typography } from "@material-ui/core";
import { FuseAnimate, FusePageCarded } from "@fuse";
import { Link } from "react-router-dom";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";
import SimpleTable from "../SimpleTable";

const OrderHeader = order => {
    return (
        <div className="flex flex-1 w-full items-center justify-between">
            <div className="flex flex-1 flex-col items-center sm:items-start">
                <FuseAnimate animation="transition.slideRightIn" delay={300}>
                    <Typography
                        className="normal-case flex items-center sm:mb-12"
                        component={Link}
                        role="button"
                        to="/orders"
                        color="inherit"
                    >
                        <Icon className="mr-4 text-20">arrow_back</Icon>
                        Orders
                    </Typography>
                </FuseAnimate>

                <div className="flex flex-col min-w-0 items-center sm:items-start">
                    <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                        <Typography className="text-16 sm:text-20 truncate">
                            {"Order " + order._id}
                        </Typography>
                    </FuseAnimate>

                    <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                        <Typography variant="caption">
                            {order.inputIntegrationType
                                ? `From ${order.inputIntegrationType}`
                                : "Manual Order"}
                        </Typography>
                    </FuseAnimate>
                </div>
            </div>
        </div>
    );
};

const OrderData = order => {
    return (
        <div>
            <div className="pb-48">
                <div className="pb-16 flex items-center">
                    <Typography className="h2" color="textSecondary">
                        Order Data
                    </Typography>
                </div>
                <JSONPretty
                    id="json-pretty"
                    data={_.omit(order, ["inputOrder"])}
                ></JSONPretty>
            </div>

            <div className="pb-48">
                <div className="pb-16 flex items-center">
                    <Typography className="h2" color="textSecondary">
                        Linnworks Input Order
                    </Typography>
                </div>
                <JSONPretty
                    id="json-pretty"
                    data={order.inputOrder}
                ></JSONPretty>
            </div>
        </div>
    );
};

const ProductLink = id => (
    <Typography
        component={Link}
        to={"/products/" + id}
        className="truncate"
        style={{
            color: "inherit",
            textDecoration: "underline"
        }}
    >
        {id}
    </Typography>
);

const ProductsTable = ({ orderProducts }) => {
    const tableOptions = {
        head: ["ID", "Quantity"]
    };
    const tableData = orderProducts
        ? orderProducts.map(orderProduct => [
              <ProductLink product={orderProduct.id} />,
              <span>{orderProduct.quantity}</span>
          ])
        : [];
    return (
        <div className="pb-48">
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Products
                </Typography>
            </div>
            <SimpleTable data={tableData} options={tableOptions} />
        </div>
    );
};

const OrderDetails = (props) => {
    return (
        <div>
            <ProductsTable {...props} />

            <div className="pb-48">
                <div className="pb-16 flex items-center">
                    <Typography className="h2" color="textSecondary">
                        Customer
                    </Typography>
                </div>
            </div>
        </div>
    );
};

function Order(props) {
    const dispatch = useDispatch();
    const order = useSelector(({ order }) => order.activeOrder);

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        dispatch(Actions.getOrder(props.match.params));
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
            header={order && <OrderHeader order={order} />}
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
                    <Tab className="h-64 normal-case" label="Order" />
                    <Tab className="h-64 normal-case" label="Data" />
                </Tabs>
            }
            content={
                order && (
                    <div className="p-16 sm:p-24 max-w-2xl w-full">
                        {tabValue === 0 && <OrderDetails order={order} />}
                        {tabValue === 1 && <OrderData order={order} />}
                    </div>
                )
            }
            innerScroll
        />
    );
}

export default Order;
