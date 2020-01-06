import _ from "lodash";
import React, { useEffect, useState } from "react";
import JSONPretty from "react-json-pretty";
import {
    Icon,
    Tab,
    Tabs,
    Typography,
    Button,
    TextField
} from "@material-ui/core";
import { FuseAnimate, FusePageCarded } from "@fuse";
import { Link } from "react-router-dom";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";
import { Options } from "app/components/Options";
import { InlineOptions } from "app/components/InlineOptions";
import EasyncProductOptions from "../integrations/easync/EasyncProductOptions";

const OrderHeader = ({ order }) => {
    const dispatch = useDispatch();
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
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button
                    variant="contained"
                    onClick={() => dispatch(Actions.testSendOrder(order._id))}
                >
                    Test Send Via Easync
                </Button>
            </FuseAnimate>
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

const ProductLink = ({ productId, children }) => (
    <Typography
        component={Link}
        to={"/products/" + productId}
        className="truncate"
        style={{
            color: "inherit",
            textDecoration: "underline"
        }}
    >
        {children}
    </Typography>
);

const ProductActionButton = props => {
    const { label } = props;
    return (
        <Button variant="contained" style={{ marginRight: 5 }} {...props}>
            {label}
        </Button>
    );
};

const AddProductForm = ({ order }) => {
    const orderId = order._id;
    const dispatch = useDispatch();
    const isAddingProduct = useSelector(({ order }) => order.isAddingProduct);
    const [productId, setProductId] = useState("");
    return (
        <div>
            <TextField
                label="Product ID"
                value={productId}
                onChange={e => setProductId(e.target.value)}
                variant="outlined"
            />
            <Button
                style={{margin: 10}}
                variant="contained"
                disabled={isAddingProduct}
                onClick={() =>
                    dispatch(Actions.addProductToOrder(orderId, productId))
                }
            >
                {isAddingProduct ? "..." : "add product to order"}
            </Button>
        </div>
    );
};

const OrderProductRow = ({ order, orderProduct }) => {
    const dispatch = useDispatch();
    const isRemoving = useSelector(
        ({ order }) => order.removingOrderProducts[orderProduct._id]
    );
    const isSavingEasync = useSelector(
        ({ order }) => order.savingOrderProductsEasync[orderProduct._id]
    );
    const isEditingQty = useSelector(
        ({ order }) => order.editingOrderProductQtys[orderProduct._id]
    );
    const isSavingQty = useSelector(
        ({ order }) => order.savingOrderProductQtys[orderProduct._id]
    );
    return (
        <tr>
            <td>
                <InlineOptions
                    data={{
                        quantity: orderProduct.quantity
                    }}
                    actionParam={{orderId: order._id, orderProductId: orderProduct._id}}
                    saveAction={Actions.saveOrderProductQuantity}
                    editAction={Actions.editOrderProductQuantity}
                    cancelEditAction={Actions.cancelEditOrderProductQuantity}
                    isEditing={isEditingQty}
                    isSaving={isSavingQty}
                />
            </td>
            <td>
                <ProductLink productId={orderProduct.productId}>
                    {_.get(orderProduct, ["product", "externalIds", "SKU"])}
                </ProductLink>
            </td>
            <td>
                <EasyncProductOptions
                    data={orderProduct["integrationData"]["EASYNC"]}
                    isSaving={isSavingEasync}
                    saveAction={Actions.saveOrderProductEasyncSelectionCriteriaOptions}
                    saveActionParam={order._id}
                    saveActionParam2={orderProduct._id}
                />
            </td>
            <td>
                <ProductActionButton
                    label={isRemoving ? "..." : "remove"}
                    disabled={isRemoving}
                    onClick={() =>
                        dispatch(
                            Actions.removeProductFromOrder(
                                order._id,
                                orderProduct._id
                            )
                        )
                    }
                />
            </td>
        </tr>
    );
};

const OrderProducts = ({ order }) => {
    const { orderProducts } = order;
    return (
        orderProducts && (
            <div className="pb-48">
                <AddProductForm order={order} />

                <div className="table-responsive">
                    <table className="simple">
                        <thead>
                            <tr>
                                <th className="w-48">Quantity</th>
                                <th className="w-48">SKU</th>
                                <th>Easync</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderProducts.map(orderProduct => (
                                <OrderProductRow
                                    key={orderProduct._id}
                                    order={order}
                                    orderProduct={orderProduct}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    );
};

const OrderCustomer = ({ order }) => {
    const isSaving = useSelector(({ order }) => order.savingOrderCustomer);
    return (
        <div className="pb-48">
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Customer
                </Typography>
            </div>
            <Options
                data={_.omit(order.shippingAddress, ["_id"])}
                isSaving={isSaving}
                saveAction={Actions.saveOrderCustomer}
                saveActionParam={order._id}
            />
        </div>
    );
};

const OrderOptions = ({ order }) => {
    const isSaving = useSelector(({ order }) => order.easyncOptionsSaving);
    return (
        <div className="pb-48">
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Easync Options
                </Typography>
            </div>
            <Options
                data={order["integrationData"]["EASYNC"]}
                saveAction={Actions.saveOrderEasyncOptions}
                saveActionParam={order._id}
                isSaving={isSaving}
            />
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
                        {tabValue === 0 && (
                            <>
                                <OrderOptions order={order} />
                                <OrderCustomer order={order} />
                                <OrderProducts order={order} />
                            </>
                        )}
                        {tabValue === 1 && <OrderData order={order} />}
                    </div>
                )
            }
            innerScroll
        />
    );
}

export default Order;
