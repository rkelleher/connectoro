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
import { VpnKey,  CheckCircle, QueryBuilder, Warning } from "@material-ui/icons";
import { FuseScrollbars } from "@fuse";
import { withRouter } from "react-router-dom";
import _ from "@lodash";
import OrdersTableHead from "./OrdersTableHead";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";
import moment from 'moment';

function OrdersTable(props) {
    const dispatch = useDispatch();
    const orders = useSelector(({ orders }) => orders.data);

    const [selected, setSelected] = useState([]);
    const [data, setData] = useState(orders);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [order, setOrder] = useState({
        direction: "desc",
        id: 'createdDate'
    });

    useEffect(() => {
        dispatch(Actions.getOrders());
    }, [dispatch]);

    useEffect(() => {
        setData(orders);
    }, [orders]);

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
        setPage(page);
    }

    function handleChangeRowsPerPage(event) {
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

                    <TableBody>
                        {data &&
                            _.orderBy(
                                data,
                                [
                                    o => {
                                        switch (order.id) {
                                            case "id": {
                                                return parseInt(o.id, 10);
                                            }
                                            default: {
                                                return o[order.id];
                                            }
                                        }
                                    }
                                ],
                                [order.direction]
                            )
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map(n => {
                                    const isSelected =
                                        selected.indexOf(n._id) !== -1;
                                    const data = {
                                        trackingStatus: null,
                                        trackingNumber: null,
                                        trackingURL: null,
                                        easyncOrderStatus: null,
                                        easyncOrderMessage: null,
                                        orderSource: 'Manually',
                                        orderSourceID: null,
                                    }
                                    if (n.easyncTracking) {
                                
                                        if (n.easyncTracking.status) {
                                            data.trackingStatus = n.easyncTracking.status;
                                        }
                                
                                        if (n.easyncTracking.trackingNumber) {
                                            data.trackingNumber = n.easyncTracking.trackingNumber;
                                            data.trackingURL = `https://aquiline-tracking.com/data/TrackPackage${n.easyncTracking.trackingNumber}`;
                                        }
                                    }
                                    let icon;
                                    if (n.easyncOrderStatus) {
                                        data.easyncOrderStatus = n.easyncOrderStatus.status;
                                        data.easyncOrderMessage = n.easyncOrderStatus.message;
                                        switch (n.easyncOrderStatus.status) {
                                            case 'proccesing':
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
                                    }
                                    const { EASYNC, LINNW} = n.integrationData;
                                    if (LINNW) {
                                        data.orderSource = 'Linnworks'; // change logic for more sources
                                        data.orderSourceID = LINNW.numOrderId; // change logic for more sources
                                    }
                                    
                                    return (
                                        <TableRow
                                            className="h-64 cursor-pointer"
                                            hover
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={n._id}
                                            selected={isSelected}
                                            onClick={event => handleClick(n, event)}
                                        >
                                            <TableCell
                                                className="w-48 pl-4 sm:pl-12"
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
                                            >
                                                <div className="flex flex-col">
                                                {/* <p>{moment(n.createdDate).format('DD', 'MM', 'YY', 'HH', 'mm', 'A')}</p> */}
                                                <p>Date :<span className="font-medium">{moment(n.createdDate).format('L LT')}</span></p>
                                                <p>Channel :{data.orderSource}</p>
                                                <p>Order ID :{data.orderSourceID}</p>
                                                </div>
                                            </TableCell>

                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {`${n.shippingAddress.firstName} ${n.shippingAddress.lastName}`}
                                            </TableCell>

                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {n.orderProducts.length}
                                            </TableCell>

                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                <div className="flex">{icon}
                                                    <div className="flex flex-col">
                                                        <p className="capitalize font-semibold">{data.easyncOrderStatus}</p>
                                                        <p>{data.easyncOrderMessage}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                <div className="flex"><QueryBuilder  style={{color : 'yellow'}}/>
                                                    <div className="flex flex-col">
                                                        <p>{data.trackingStatus}</p>
                                                        <p><a href={data.trackingURL} target="_blank">{data.trackingNumber}</a></p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                <Tooltip title ="Send Order Via Easync">
                                                    <Button variant="contained" className="mr-8"
                                                        onClick={event =>
                                                            event.stopPropagation()
                                                        }
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
                                                                    <Button onClick={()=> dispatch(closeDialog())} color="primary" autoFocus startIcon={<VpnKey />} className="text-orange-400">
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
                                                <Button variant="contained"
                                                    onClick={event =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <Icon>format_list_bulleted</Icon>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                    </TableBody>
                </Table>
            </FuseScrollbars>

            <TablePagination
                component="div"
                count={data.length}
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
