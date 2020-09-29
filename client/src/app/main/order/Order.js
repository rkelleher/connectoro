import _ from "lodash";
import React, { useEffect, useState } from "react";
import moment from 'moment';
import JSONPretty from "react-json-pretty";
import {
    Icon,
    IconButton,
    Tab,
    Tabs,
    Typography,
    Button,
    TextField,
    Divider,
    Card,
    CardContent
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/core/styles";
import { FuseAnimate, FusePageCarded, FuseLoading } from "@fuse";
import { Link } from "react-router-dom";
import * as Actions from "app/store/actions";
import { DataDialog } from "app/store/actions/order.actions";
import { useDispatch, useSelector } from "react-redux";
import { Options } from "app/components/Options";
import { InlineOptions } from "app/components/InlineOptions";
import EasyncProductOptions from "../integrations/easync/EasyncProductOptions";
import EasyncOrderOptions from "../integrations/easync/EasyncOrderOptions";
import './Order.css';

const OrderHeader = ({ order }) => {
    const dispatch = useDispatch();
    const isLoading = useSelector(({ order }) => order.isLoading);
    let _status = useSelector(({order}) => order.status);

    if(!_status){
        if (order.hasOwnProperty('easyncOrderStatus')) {

            dispatch(Actions.changeStatus(order.easyncOrderStatus.status))
        } else {
            dispatch(Actions.changeStatus('undefined'))
        }
    }

    const buttonVariant = (_status) => (
        <Button
            className='SendOrderButton mr-8'
            variant="contained"
            onClick={() => dispatch(Actions.testSendOrder(order._id))}
            {...isLoading ? {disabled: true} : ''}
            {... !['open', 'error'].includes(_status) ? {hidden: true} : {}}
        >
            <Icon className="mr-4 text-20">shopping_cart</Icon>
            Send Order Via Easync
        </Button>
    );

    return (
        <div className="flex flex-1 flex-col sm:flex-row w-full items-center justify-between">
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
                        <Typography className={`text-16 sm:text-20 truncate OrderId`}>
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
                <div className="order-page-header">
                    {buttonVariant(_status)}
                    <Button variant="contained" className="mr-8">
                        <Icon>block</Icon>
                    </Button>
                    <Button variant="contained" className="mr-8">
                        <Icon>local_shipping</Icon>
                    </Button>
                    <Button variant="contained" className="mr-8">
                        <Icon>backspace</Icon>
                    </Button>
                    <Button variant="contained">
                        <Icon>refresh</Icon>
                    </Button>
                </div>
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

const useProductFormStyles = makeStyles({
    option: {
        fontSize: 15,
        "& > span": {
            marginRight: 10,
            fontSize: 18
        }
    }
});

const AddProductForm = ({ order }) => {
    const dispatch = useDispatch();
    const classes = useProductFormStyles();
    const products = useSelector(({ products }) =>
        products.data.map(({ SKU, title, _id }) => ({
            productId: _id,
            SKU,
            title
        }))
    );
    const orderId = order._id;
    const isAddingProduct = useSelector(({ order }) => order.isAddingProduct);
    const [product, setProduct] = useState("");
    const onRefreshBtnClick = () => dispatch(Actions.getProducts());
    return (
        <div style={{ display: "flex" }}>
<IconButton onClick={onRefreshBtnClick}>
        <RefreshIcon fontSize="inherit" />
        </IconButton>
        <Autocomplete
    style={{ width: 300 }}
    options={products}
    classes={{
        option: classes.option
    }}
    value={product}
    onChange={(e, value) => setProduct(value)}
    autoHighlight
    getOptionLabel={option => option && option.SKU}
    renderOption={option => (
    <>{`SKU${option.SKU}: ${option.title}`}</>
)}
    renderInput={params => (
    <TextField
    {...params}
    label="Choose a product"
    variant="outlined"
    fullWidth
    inputProps={{
    ...params.inputProps,
            autoComplete: "disabled"
    }}
    />
)}
    />
    <Button
    style={{ margin: 10 }}
    variant="contained"
    disabled={isAddingProduct}
    onClick={() =>
    dispatch(
        Actions.addProductToOrder(orderId, product.productId)
    )
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
    actionParam={{
        orderId: order._id,
            orderProductId: orderProduct._id
    }}
    saveAction={Actions.saveOrderProductQuantity}
    editAction={Actions.editOrderProductQuantity}
    cancelEditAction={Actions.cancelEditOrderProductQuantity}
    isEditing={isEditingQty}
    isSaving={isSavingQty}
    />
    </td>
    <td>
    <ProductLink productId={orderProduct.productId}>
        {_.get(orderProduct, ["product", "SKU"])}
        </ProductLink>
        </td>
        <td>
        <div>{`Product Title: ${orderProduct.product.title}`}</div>
    <br />
    <div>
    {`ASIN: ${orderProduct.integrationData.EASYNC.externalId}`}
</div>
    <br />
    <EasyncProductOptions
    isInline
    id={orderProduct._id}
    data={orderProduct["integrationData"]["EASYNC"]}
    isSaving={isSavingEasync}
    saveAction={
        Actions.saveOrderProductEasyncSelectionCriteriaOptions
    }
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
        <div className="pb-16 flex items-center">
        <Typography className="h2" color="textSecondary">
        Order Products
    </Typography>
    </div>

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
        Customer Details
    </Typography>
    </div>
    <Options
    id={order._id}
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

            <EasyncOrderOptions
                optionSource={order}
                optionKeys={[
                    "shippingMethod",
                    "isGift",
                    "isFBE",
                    "maxOrderPrice"
                ]}
                saveAction={Actions.saveOrderEasyncOptions}
                saveActionParam={order._id}
                isSaving={isSaving}
                smCol={2}
            />
        </div>
    );
};

function OrderEasyncDetails({ order }) {
    const dispatch = useDispatch();

    const { retailerCode, countryCode } = _.get(order, [
        "integrationData",
        "EASYNC"
    ]);
    let status, message, request, tracking;
    if(order.hasOwnProperty('easyncOrderStatus')){
        status = order.easyncOrderStatus.status;
        message = order.easyncOrderStatus.message;
        request = order.easyncOrderStatus.request;
        tracking = order.easyncOrderStatus.tracking;
    }else{
        status = 'undefined';
        message = '';
    }
    return (
        <div className="pb-48">
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Easync Details
                </Typography>
            </div>
            <div>{`Site: ${retailerCode}`}</div>
            <div>{`Country: ${countryCode}`}</div>
            <div>{`Status: ${status}`}</div>
            {
                status !== 'open' &&
                <div>
                    {`Message: ${message}`}
                    {
                        request && 
                        <Button
                            variant="contained"
                            style={{ marginLeft: 10 }}
                            onClick={() => dispatch(
                                Actions.openDialog({
                                    children: <DataDialog data={request}/>
                                }),
                            )}
                        >
                            <Icon style={{ marginRight: 10 }}>description</Icon>
                            Info
                        </Button>
                    }
                    {
                        tracking && 
                        <Button
                            variant="contained"
                            style={{ marginLeft: 10 }}
                            onClick={() => dispatch(
                                Actions.openDialog({
                                    children: <DataDialog data={tracking}/>
                                }),
                            )}
                        >
                            <Icon style={{ marginRight: 10 }}>description</Icon>
                            Tracking
                        </Button>
                    }
                </div>
            }
        </div>
    );
}

function OrderStatus({ order }) {
    return (
        <Card className="orderStatus">
            <CardContent className="orderStatus-content">
                <Typography className="orderStatus-header pb-12" variant="h5" component="h2">
                    Order Status
                </Typography>
                <Typography className="flex pb-24">
                    <Icon className="orderStatus-icon">local_shipping</Icon>
                    <Typography color="textSecondary"  variant="body1" gutterBottom>
                        <Typography variant="h6" className="block orderStatus-tracker" >{order.easyncOrderStatus.status.replace("_", " ")}</Typography>
                        Message: {order.easyncOrderStatus.message}
                    </Typography>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                <p>Order Source: {order.integrationData.LINNW ? 'Linnworks' : 'Manually'}</p>
                {/* change logic for more sources */}
                <p>Order Source ID: {order.integrationData.LINNW.numOrderId ? order.integrationData.LINNW.numOrderId : null}</p>
                <p>Processed On Source: {order.easyncOrderStatus.processedOnSource.toString()}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                <p>Dropshipper: {order.integrationData.EASYNC ? 'Easync' : 'Manually'}</p>
                {/* change logic for more sources */}
                <p>Dropshipper Account: {(order.easyncOrderStatus.request && order.easyncOrderStatus.request.merchant_order_ids[0].account) ? order.easyncOrderStatus.request.merchant_order_ids[0].account : null}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                <p>Request ID: {order.easyncOrderStatus.requestId}</p>
                <p>Indempotency Key: {order.easyncOrderStatus.idempotencyKey}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                <p>Dropship Date: {(order.easyncOrderStatus.request && order.easyncOrderStatus.request.merchant_order_ids[0].placed_at) ? moment(order.easyncOrderStatus.request.merchant_order_ids[0].placed_at).format('DD MM YYYY') : null}</p>
                <p>Retailer: {order.integrationData.EASYNC.retailerCode ? order.integrationData.EASYNC.retailerCode.replace("_", " ") : null}</p>
                <p>Retailer Order ID: {(order.easyncOrderStatus.request && order.easyncOrderStatus.request.merchant_order_ids[0].merchant_order_id) ? order.easyncOrderStatus.request.merchant_order_ids[0].merchant_order_id : null}</p>
                <p>Total Paid: {(order.easyncOrderStatus.request && order.easyncOrderStatus.request.price_components.subtotal) ? order.easyncOrderStatus.request.price_components.subtotal : null}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                <p>Tracker Obtained: {(order.easyncOrderStatus.request && order.easyncOrderStatus.request.tracking) ? 'True' : 'False'}</p>
                </Typography>
            </CardContent>
        </Card>
    );
}

function GeneralTab({ order }) {
    return (
        <>
            <div style={{ display: 'flex' }}>
                <OrderCustomer order={order}/>
                <OrderStatus order={order} />
            </div>
            <OrderOptions order={order} />
            <OrderEasyncDetails order={order} />
            <Divider />
            <OrderProducts order={order} />
        </>
    );
}

function Order(props) {
    const dispatch = useDispatch();
    const order = useSelector(({ order }) => order.activeOrder);
    const isFetching = useSelector(({ order }) => order.isFetching);

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        dispatch(Actions.getOrder(props.match.params));
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
            header: "min-h-136 my-20 sm:my-0"
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
        {tabValue === 0 && <GeneralTab order={order} />}
    {tabValue === 1 && <OrderData order={order} />}
    </div>
    )
}
    innerScroll
    />
);
}

export default Order;
