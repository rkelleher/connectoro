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
    CardContent,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
} from "@material-ui/core";
import {
    closeDialog,
    openDialog
} from "app/store/actions";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {Refresh, VpnKey} from "@material-ui/icons";
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
        <Tooltip title="Send Order Via Easync">
            <Button
                className='mr-8 h-50'
                variant="contained"
                onClick={() => dispatch(Actions.testSendOrder(order._id))}
                {...isLoading ? {disabled: true} : ''}
                {... !['open', 'error'].includes(_status) ? {hidden: true} : {}}
            >
                <Icon>shopping_cart</Icon>
            </Button>
        </Tooltip>
    );
    const key = true;

    const buttonVariantKey = (_status) => (
        <Tooltip title="Create New Key">
            <Button
                className='mr-8'
                variant="contained"
                {...isLoading ? {disabled: true} : ''}
                {... !['open', 'error'].includes(_status) ? {hidden: true} : {}}
                onClick={()=> dispatch(openDialog({
                children: (
                    <React.Fragment>
                        <DialogTitle id="alert-dialog-title" className="text-red-500">Warning</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description" className="font-bold text-black text-base">
                            This may result in a duplicate order. Are you sure you want to continue?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={()=> dispatch(closeDialog())} color="primary" className='text-green-500'>
                                Exit
                            </Button>
                            <Button onClick={() => dispatch(Actions.testSendOrder(order._id, key))} color="primary" autoFocus startIcon={<VpnKey />} className="text-orange-400">
                                Create New Key
                            </Button>
                        </DialogActions>
                    </React.Fragment>
                     )
                 }))}
        >
            <Icon>vpn_key</Icon>
            </Button>
        </Tooltip>
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
                    {buttonVariantKey(_status)}
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
        <Refresh fontSize="inherit" />
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

function orderData(order) {
    const { EASYNC, LINNW} = order.integrationData;
    const { request } = order.easyncOrderStatus;

    const data = {
        orderSource: 'Manually', // change logic for more sources
        dropshipper: 'Manually', // change logic for more dropshippers
        processedOnSource: 'False',
        trackerObtained: 'False',
        trackingStatus: null,
        trackingNumber: null,
        trackingURL: null,
        orderSourceID: null,
        retailer: null,
        totalPaid: null, 
        dropshipperAccount: null,
        dropshipDate: null,
        retailerOrderID: null
    };

    if (order.processedOnSource) {
        data.processedOnSource = 'True';
    }

    if (LINNW) {
        data.orderSource = 'Linnworks'; // change logic for more sources
        data.orderSourceID = LINNW.numOrderId; // change logic for more sources
    }

    if (EASYNC) {
        data.dropshipper = 'Easync'; // change logic for more dropshippers

        if (EASYNC.retailerCode) {
            data.retailer = EASYNC.retailerCode.replace("_", " ");
        }
    }

    if (order.easyncTracking) {
        if (order.easyncTracking.isObtained) {
            data.trackerObtained = 'True';
        }

        if (order.easyncTracking.status) {
            data.trackingStatus = order.easyncTracking.status;
        }

        if (order.easyncTracking.trackingNumber) {
            data.trackingNumber = order.easyncTracking.trackingNumber;
            data.trackingURL = `https://aquiline-tracking.com/data/TrackPackage${order.easyncTracking.trackingNumber}`;
        }
    }

    if (request) {
        if (request.price_components && request.price_components.subtotal) {
            data.totalPaid =  request.price_components.subtotal;
        }

        if (request.tracking) {
            data.trackerObtained = 'True';
        }

        if (request.merchant_order_ids && request.merchant_order_ids.length) {
            data.dropshipperAccount = request.merchant_order_ids[0].account;
            data.dropshipDate = moment(request.merchant_order_ids[0].placed_at).format('DD MM YYYY');
            data.retailerOrderID = request.merchant_order_ids[0].merchant_order_id;
        }
    }

    return data;
}

function OrderStatus({ order }) {
    const { message, status, requestId, idempotencyKey } = order.easyncOrderStatus;

    const {
        orderSource, 
        orderSourceID, 
        processedOnSource,
        dropshipper, 
        retailer, 
        totalPaid, 
        trackerObtained,
        trackingStatus,
        trackingNumber,
        trackingURL,
        dropshipperAccount,
        dropshipDate,
        retailerOrderID
    } = orderData(order);

    return (
        <Card className="orderStatus">
            <CardContent className="orderStatus-content">
                <Typography className="orderStatus-header pb-12" variant="h4" component="h2">
                    Order Status
                </Typography>
                <Typography className="flex pb-24">
                    <Icon className="orderStatus-icon">local_shipping</Icon>
                    <Typography variant="subtitle1">
                        <Typography variant="h6" className="block orderStatus-tracker" >{status.replace("_", " ")}</Typography>
                        <span class="font-bold">Message: </span> {message}
                    </Typography>
                </Typography>
                <Typography variant="subtitle1" className="orderStatus-paragraph">
                    <p><span class="font-bold">Order Source:</span> {orderSource}</p>
                    <p><span class="font-bold">Order Source ID: </span> {orderSourceID}</p>
                    <p><span class="font-bold">Processed On Source: </span> {processedOnSource.toString()}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                    <p><span class="font-bold">Dropshipper: </span> {dropshipper}</p>
                    <p><span class="font-bold">Dropshipper Account: </span> {dropshipperAccount}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                    <p><span class="font-bold">Request ID: </span> {requestId}</p>
                    <p><span class="font-bold">Indempotency Key:</span> {idempotencyKey}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                    <p><span class="font-bold">Dropship Date: </span> {dropshipDate}</p>
                    <p><span class="font-bold">Retailer: </span>{retailer}</p>
                    <p><span class="font-bold">Retailer Order ID: </span> {retailerOrderID}</p>
                    <p><span class="font-bold">Total Paid: </span>{totalPaid}</p>
                </Typography>
                <Typography variant="body1" className="orderStatus-paragraph">
                    <p><span class="font-bold">Tracker Obtained: </span>{trackerObtained}</p>
                    <p><span class="font-bold">Tracking Status: </span>{trackingStatus}</p>
                    <p><span class="font-bold">Tracking Number: </span>{trackingNumber}</p>
                    <p>
                        <span class="font-bold">Tracking URL: </span>
                        <a href={trackingURL}>{trackingURL}</a>
                    </p>
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
        <div className="p-16 sm:p-24 w-full">
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
