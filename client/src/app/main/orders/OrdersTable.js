import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TablePagination,
    TableRow,
    Checkbox,
    Button,
    Icon,
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
import socket from "socket.io-client";
import { VpnKey,  CheckCircle, QueryBuilder, Warning } from "@material-ui/icons";
import { FuseScrollbars, FuseLoading } from "@fuse";
import { withRouter } from "react-router-dom";
import OrdersTableHead from "./OrdersTableHead";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";
import moment from 'moment';
import TextField from '@material-ui/core/TextField';
import delivered from "../../../app/assets/icons/delivered.svg"
import shipping from "../../../app/assets/icons/shipping.svg"
import './OrderTable.css';

function OrdersTable(props) {
    const isFetching = useSelector(({ orders }) => orders.isFetching);
    const dispatch = useDispatch();
    const count = useSelector(({ orders }) => orders.count);
    const orders = useSelector(({ orders }) => orders.data);
    const pageNumber = useSelector(({ orders }) => orders.page);
    const ordersNumber = useSelector(({ orders }) => orders.rowsPerPage);
    const [selected, setSelected] = useState([]);
    const [data, setData] = useState(orders);
    const [page, setPage] = useState((pageNumber-1) || 0);
    const [rowsPerPage, setRowsPerPage] = useState(ordersNumber || 100);
    const [order, setOrder] = useState({
        direction: "desc",
        id: 'createdDate'
    });

    // useEffect(() => {
    //     dispatch(Actions.getOrders());
    // }, [dispatch]);

    useEffect(() => {
        setData(orders);
    }, [orders]);

    useEffect(() => {
        const io = socket('https://stage.connectoro.io');
        io.on('news', function (data) {
            console.log(data);
        });
        io.on('newOrder' , function (order) {
            dispatch(Actions.newOrder(order))
        });
        io.on('updateOrderStatus' , function (id, status) {
            dispatch(Actions.updateStatus(id, status))
        });
        io.on('updateOrderTracking' , function (id, tracking) {
            dispatch(Actions.updateTracking(id, tracking))
        });
    }, []);

    function handleRequestSort(event, property) {
        const id = property;
        let direction = "desc";

        if (order.id === property && order.direction === "desc") {
            direction = "asc";
        }

        setOrder({
            direction,
            id
        });
    }

    function handleSelectAllClick(event) {
        if (event.target.checked) {
            setSelected(data.map(n => n._id));
            return;
        }
        setSelected([]);
    }

    function handleClick(item, event) {
        // if (event.target === event.currentTarget) {
        //     props.history.push(`/orders/${item._id}`);
        // }
        props.history.push(`/orders/${item._id}`);
        
    }

    function handleCheck(event, id) {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    }

    function handleChangePage(event, page) {
        dispatch(Actions.setPageNumber(page));
        setPage(page);
    }

    function handleChangeRowsPerPage(event) {
        dispatch(Actions.setRowsOnPage(event.target.value));
        setRowsPerPage(event.target.value);
    }

    return (
        <div className="w-full flex flex-col">
            <FuseScrollbars className="flex-grow overflow-x-auto">
                <Table className="min-w-xl order-table" aria-labelledby="tableTitle" stickyHeader aria-label="sticky table">
                    <OrdersTableHead
                        numSelected={selected.length}
                        order={order}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        rowCount={data.length}
                    />
                    
                    {isFetching ?  <FuseLoading/> :
                    (count === 0) ? <p className="flex absolute w-full h-full justify-center items-center text-7xl" style={{fontSize: "4.5rem"}}>Not found</p> :  
                    <TableBody>
                    {data 
                    // &&
                    //     _.orderBy(
                    //         data,
                    //         [
                    //             o => {
                    //                 switch (order.id) {
                    //                     case "id": {
                    //                         return parseInt(o.id, 10);
                    //                     }
                    //                     default: {
                    //                         return o[order.id];
                    //                     }
                    //                 }
                    //             }
                    //         ],
                    //         [order.direction]
                    //     )
                            // .slice(
                            //     page * rowsPerPage,
                            //     page * rowsPerPage + rowsPerPage
                            // )
                            .map(n => {
                                const isSelected =
                                    selected.indexOf(n._id) !== -1;
                                const data = {
                                    trackingStatus: null,
                                    trackingNumber: null,
                                    trackingURL: null,
                                    tarckingMessage: null,
                                    easyncOrderStatus: null,
                                    easyncOrderMessage: null,
                                    orderSource: 'Manually',
                                    orderSourceID: null,
                                    first_name: '',
                                    last_name :'',
                                    address_line1: '',
                                    address_line2: '',
                                    zip_code: '',
                                    country: '',
                                    total_price: '',
                                    retailerOrderID: null,
                                }

                                let iconTracking;
                                if (n.easyncTracking) {
                            
                                    if (n.easyncTracking.status) {
                                        data.trackingStatus = n.easyncTracking.status;
                                    }
                                    if (n.easyncTracking.message) {
                                        data.tarckingMessage = n.easyncTracking.message;
                                    }
                            
                                    if (n.easyncTracking.trackingNumber) {
                                        data.trackingNumber = n.easyncTracking.trackingNumber;
                                        data.trackingURL = `https://aquiline-tracking.com/data/TrackPackage${n.easyncTracking.trackingNumber}`;
                                    }

                                    switch (data.trackingStatus) {
                                        case 'shipping':
                                            iconTracking = <img src={shipping} alt="" className="mr-6 tracking-status text-orange-500"/>
                                            break;
                                        case 'delivered':
                                            iconTracking = <img src={delivered} alt="" className="mr-6 tracking-status text-green-700"/>
                                            break;
                                        case 'error':
                                            iconTracking = <Warning className="text-red-700 mr-6"/>
                                            break;
                                        default:
                                            iconTracking = null;
                                    }

                                }

                                let icon;
                                if (n.easyncOrderStatus) {
                                    data.easyncOrderStatus = n.easyncOrderStatus.status;
                                    data.easyncOrderMessage = n.easyncOrderStatus.message;
                                    if (n.easyncOrderStatus.request) {
                                        if (n.easyncOrderStatus.request.price_components && n.easyncOrderStatus.request.price_components.total) {
                                            data.total_price = n.easyncOrderStatus.request.price_components.total;
                                        }
                                    }
                                    switch (n.easyncOrderStatus.status) {
                                        case 'processing':
                                            icon = <QueryBuilder className="text-orange-500 mr-6"/>
                                            break;
                                        case 'complete':
                                            icon = <CheckCircle className="text-green-700 mr-6"/>
                                            break;
                                        case 'error':
                                            icon = <Warning className="text-red-700 mr-6"/>
                                            break;
                                        default:
                                            icon = null;
                                    }
                                    const { request } = n.easyncOrderStatus;
                                    if (request) {
                                    if (request.merchant_order_ids && request.merchant_order_ids.length) {
                                        data.retailerOrderID = request.merchant_order_ids[0].merchant_order_id;
                                    }
                                }
                                }
                                const { EASYNC, LINNW} = n.integrationData;
                                if (LINNW) {
                                    data.orderSource = 'Linnworks'; // change logic for more sources
                                    data.orderSourceID = LINNW.numOrderId; // change logic for more sources
                                }
                                if (n.shippingAddress) { 
                                    if (n.shippingAddress.firstName) {
                                        data.first_name = n.shippingAddress.firstName;
                                    }
                                    if (n.shippingAddress.lastName) {
                                        data.last_name = n.shippingAddress.lastName;
                                    }
                                    if (n.shippingAddress.addressLine1) {
                                        data.address_line1 = n.shippingAddress.addressLine1;
                                    }
                                    if (n.shippingAddress.addressLine2) {
                                        data.address_line2 = n.shippingAddress.addressLine2;
                                    }
                                    if (n.shippingAddress.zipCode) {
                                        data.zip_code = n.shippingAddress.zipCode;
                                    }
                                    if (n.shippingAddress.countryName) {
                                        data.country = n.shippingAddress.countryName;
                                    }
                                }
                                
                                const key = true;
                                return (
                                    <TableRow
                                        className="h-64 p8"
                                        hover
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        tabIndex={-1}
                                        key={n._id}
                                        selected={isSelected}
                                    >
                                        <TableCell
                                            className="w-48 pl-4 sm:pl-12 p8"
                                            padding="checkbox"
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onClick={event =>
                                                    event.stopPropagation()
                                                }
                                                onChange={event =>
                                                    handleCheck(event, n._id)
                                                }
                                            />
                                        </TableCell>

                                        <TableCell
                                            component="th"
                                            scope="row"
                                            className="details p8"
                                        >
                                            <div className="flex flex-col">
                                            <p>Date: <span className="font-medium">{moment(n.createdDate).format("DD/MM/YY h:mm A")}</span></p>
                                            <p>Channel: {data.orderSource}</p>
                                            <p>Order ID: {data.orderSourceID}</p>
                                            </div>
                                        </TableCell>

                                        <TableCell
                                            component="th"
                                            scope="row"
                                            className="customer p8"
                                        >
                                            <div className="flex flex-col">
                                            <p className="font-bold mb-1 capitalize">{data.first_name + ' ' + data.last_name}</p>
                                            <p className="capitalize">{data.address_line1 + ',  ' + data.address_line2}</p>
                                            <p><span className="uppercase">{data.zip_code}</span><span className="capitalize">{',  ' + data.country}</span></p>
                                            </div>
                                        </TableCell>

                                        <TableCell
                                            component="th"
                                            scope="row"
                                            className="products p8"
                                        >
                                            <div className="flex flex-col">
                                            <p>Total: {'£' + (data.total_price/100)}</p>
                                            <p>SKU: {(n.orderProducts[0] && n.orderProducts[0].product) ? n.orderProducts[0].product.SKU + ' QTY: ' + n.orderProducts[0].quantity : null}</p>
                                            </div>
                                            {}
                                        </TableCell>

                                        <TableCell
                                            style={{width : "220px"}}
                                            component="th"
                                            scope="row"
                                            className="status p8"
                                        >
                                            <div className="flex">{icon}
                                                <div className="flex flex-col">
                                                    <p className="capitalize font-semibold">{data.easyncOrderStatus}</p>
                                                    <p>{data.easyncOrderStatus === 'complete' ? data.retailerOrderID : data.easyncOrderMessage}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            style={{width : "220px"}}
                                            component="th"
                                            scope="row"
                                            className="p8"
                                        >
                                            <div className="flex">{iconTracking}
                                                <div className="flex flex-col">
                                                    <p className="capitalize font-semibold">{data.trackingStatus}</p>
                                                    <p><a href={data.trackingURL} target="_blank">{data.trackingNumber}</a></p>
                                                    {data.tarckingMessage}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell
                                            component="th"
                                            scope="row"
                                            className="p8"
                                            style={{width : "255px"}}
                                        >
                                            <div>
                                                <Tooltip title ="Send Order Via Easync">
                                                    <Button variant="contained" className="mr-8"
                                                        onClick={() => dispatch(Actions.testSendOrder(n._id))}
                                                    >
                                                        <Icon>shopping_cart</Icon>
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip title="Create New Key">
                                                    <Button
                                                        className='mr-8'
                                                        variant="contained"
                                                        // {...isLoading ? {disabled: true} : ''}
                                                        // {... !['open', 'error'].includes(_status) ? {hidden: true} : {}}
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
                                                                    <Button onClick={() => dispatch(Actions.testSendOrder(n._id, key))} color="primary" autoFocus startIcon={<VpnKey />} className="text-orange-400">
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
                                                <Button variant="contained" className="mr-8"
                                                    onClick={event =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <Icon>block</Icon>
                                                </Button>
                                                <Button variant="contained" className="mr-8"
                                                    onClick={event =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <Icon>local_shipping</Icon>
                                                </Button>
                                                <Button variant="contained" className="mr-8"
                                                    onClick={event =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <Icon>backspace</Icon>
                                                </Button>
                                                <Tooltip title ="View Order Details">
                                                    <Button variant="contained"
                                                        onClick={event => 
                                                            handleClick(n, event)
                                                        }
                                                    >
                                                        <Icon>format_list_bulleted</Icon>
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                            <form noValidate autoComplete="off">
                                                <TextField label="Notes" variant="outlined" size="small" className="w-full mt-8"/>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                </TableBody>
                    }
                    
                </Table>
            </FuseScrollbars>

            <TablePagination
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                backIconButtonProps={{
                    "aria-label": "Previous Page"
                }}
                nextIconButtonProps={{
                    "aria-label": "Next Page"
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    );
}

export default withRouter(OrdersTable);
