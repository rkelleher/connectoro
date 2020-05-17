import _ from "lodash";
import React, { useEffect, useState } from "react";
import JSONPretty from "react-json-pretty";
import {
    Icon,
    IconButton,
    Tab,
    Tabs,
    Typography,
    Button,
    TextField,
    Divider
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/core/styles";
import { FuseAnimate, FusePageCarded, FuseLoading } from "@fuse";
import { Link } from "react-router-dom";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";
import { Options } from "app/components/Options";
import { InlineOptions } from "app/components/InlineOptions";
import EasyncProductOptions from "../integrations/easync/EasyncProductOptions";
import EasyncOrderOptions from "../integrations/easync/EasyncOrderOptions";

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
                    Send Order Via Easync
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
    />
    </div>
);
};

function OrderEasyncDetails({ order }) {
    const { retailerCode, countryCode } = _.get(order, [
        "integrationData",
        "EASYNC"
    ]);
    let status, message;
    if(order.hasOwnProperty('easyncOrderStatus')){
        status = order.easyncOrderStatus.status;
        message = order.easyncOrderStatus.message;
    }else{
        status = 'undefined';
        message = '';
    }
    return (
        <div className="pb-48">
<<<<<<< HEAD
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Easync Details
                </Typography>
            </div>
            <div>{`Site: ${retailerCode}`}</div>
            <div>{`Country: ${countryCode}`}</div>
            <div>{`Status: ${status}`}</div>
                { status !== 'order_response' && status !== 'undefined'
                    ? <div>{`Message: ${message}`}</div>
                    : ''
                }
        </div>
    );
=======
        <div className="pb-16 flex items-center">
        <Typography className="h2" color="textSecondary">
        Easync Details
    </Typography>
    </div>
    <div>{`Site: ${retailerCode}`}</div>
    <div>{`Country: ${countryCode}`}</div>
    <div>{`Status: ${status}`}</div>
    {status!=='order_response' && status!=='undefined'
        ? <div>{`Message: ${message}`}</div>
    : ''
    }
</div>
);
>>>>>>> 75acc00a6e5ffd9a1820d69d7678950d02913765
}

function GeneralTab({ order }) {
    return (
        <>
        <table>
        <tbody>
        <tr>
        <td>
        <OrderCustomer order={order} />
    </td>
    <td style={{ verticalAlign: "top" }}>
<OrderOptions order={order} />
    <OrderEasyncDetails order={order} />
    </td>
    </tr>
    </tbody>
    </table>
    <Divider />
    <br />
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
