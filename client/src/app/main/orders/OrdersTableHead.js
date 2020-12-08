import React, { useState } from "react";
import {
    TableHead,
    TableSortLabel,
    TableCell,
    TableRow,
    Checkbox,
    Tooltip,
    IconButton,
    Icon,
    Menu,
    MenuList,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Select,
} from "@material-ui/core";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";

const rows = [
    {
        id: "createdDate",
        align: "left",
        disablePadding: false,
        label: "Details",
        sort: true
    },
    {
        id: "customerFullName",
        align: "left",
        disablePadding: false,
        label: "Customer",
        sort: true,
    },
    {
        id: "numProd",
        align: "left",
        disablePadding: false,
        label: "Products",
        sort: true
    },
    {
        id: "status",
        align: "left",
        disablePadding: false,
        label: "Status",
        sort: true
    },
    {
        id: "tracking",
        align: "left",
        disablePadding: false,
        label: "Tracking",
        sort: true
    },
    {
        id: "controls",
        align: "left",
        disablePadding: false,
        label: "Controls",
        sort: true
    }
];

const useStyles = makeStyles(theme => ({
    actionsButtonWrapper: {
        background: theme.palette.background.paper
    }
}));

function OrdersTableHead(props) {
    const classes = useStyles(props);
    const status = useSelector(({ orders }) => orders.status);
    const tracking = useSelector(({ orders }) => orders.tracking);
    const [selectedOrdersMenu, setSelectedOrdersMenu] = useState(null);
    const [trackingOrder, setTrackingOrder] = useState(tracking || 1);
    const [statusOrder, setStatusOrder] = useState(status || 1);
    const [ordersDirection, setOrdersDirections] = useState('asc');
    const dispatch = useDispatch();

    const changeFilter = (event, filter) => {
        if (filter === 'status') {
            setStatusOrder(event.target.value);
            dispatch(Actions.setFilter('status', event.target.value));
        } else if (filter === 'tracking') {
            setTrackingOrder(event.target.value);
            dispatch(Actions.setFilter('tracking', event.target.value));
        }
    }

    const createSortHandler = property => event => {
        if (property === 'createdDate') {
            props.onRequestSort(event, property);
            if (ordersDirection === 'asc') {
                setOrdersDirections('dsc');
            } else {
                setOrdersDirections('asc');
            }
            dispatch(Actions.setDirection(ordersDirection));
        }
    };

    function openSelectedOrdersMenu(event) {
        setSelectedOrdersMenu(event.currentTarget);
    }

    function closeSelectedOrdersMenu() {
        setSelectedOrdersMenu(null);
    }

    // const {onSelectAllClick, order, orderBy, numSelected, rowCount} = props;

    return (
        <TableHead>
            <TableRow className="h-64">
                <TableCell
                    padding="checkbox"
                    className="pl-4 sm:pl-12 p8"
                >
                    <Checkbox
                        indeterminate={
                            props.numSelected > 0 &&
                            props.numSelected < props.rowCount
                        }
                        checked={props.numSelected === props.rowCount}
                        onChange={props.onSelectAllClick}
                    />
                    {props.numSelected > 0 && (
                        <div
                            className={clsx(
                                "flex items-center justify-center absolute w-64 top-0 left-0 ml-68 h-64 z-10",
                                classes.actionsButtonWrapper
                            )}
                        >
                            <IconButton
                                aria-owns={
                                    selectedOrdersMenu
                                        ? "selectedOrdersMenu"
                                        : null
                                }
                                aria-haspopup="true"
                                onClick={openSelectedOrdersMenu}
                            >
                                <Icon>more_horiz</Icon>
                            </IconButton>
                            <Menu
                                id="selectedOrdersMenu"
                                anchorEl={selectedOrdersMenu}
                                open={Boolean(selectedOrdersMenu)}
                                onClose={closeSelectedOrdersMenu}
                            >
                                <MenuList>
                                    <MenuItem
                                        onClick={() => {
                                            closeSelectedOrdersMenu();
                                        }}
                                    >
                                        <ListItemIcon className="min-w-40">
                                            <Icon>delete</Icon>
                                        </ListItemIcon>
                                        <ListItemText primary="Remove" />
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </div>
                    )}
                </TableCell>
                {rows.map(row => {
                    if (row.id === 'tracking') {
                        return (<TableCell key={2} className="p8">
                                    <Select
                                        className="w-full"
                                        value={trackingOrder}
                                        displayEmpty
                                        onChange={(event) => changeFilter(event, 'tracking')}
                                    >
                                        <MenuItem value={1}> All Trackings</MenuItem>
                                        <MenuItem value={'delivered'}>Delivered</MenuItem>
                                        <MenuItem value={'shipping'}>Shipping</MenuItem>
                                        <MenuItem value={'error'}>Error</MenuItem>
                                        <MenuItem value={'no'}>No Tracking</MenuItem>
                                    </Select>
                                </TableCell>)
                    }
                    else if (row.id === 'status') {
                        return (<TableCell key={3} className="p8">
                                    <Select
                                        className="w-full"
                                        value={statusOrder}
                                        displayEmpty
                                        onChange={(event) => changeFilter(event, 'status')}
                                    >
                                        <MenuItem value={1}>All Status</MenuItem>
                                        <MenuItem value={"open"}>Open</MenuItem>
                                        <MenuItem value={"complete"}>Complete</MenuItem>
                                        <MenuItem value={"error"}>Error</MenuItem>
                                    </Select>
                                </TableCell>)
                    }
                    else {
                        return (
                            <TableCell
                                key={row.id}
                                align={row.align}
                                // padding={row.disablePadding ? "none" : "default"}
                                className="p8"
                                sortDirection={
                                    props.order.id === row.id
                                        ? props.order.direction
                                        : false
                                }
                            >
                                {row.sort && (
                                    <Tooltip
                                        title="Sort"
                                        placement={
                                            row.align === "right"
                                                ? "bottom-end"
                                                : "bottom-start"
                                        }
                                        enterDelay={300}
                                    >
                                        <TableSortLabel
                                            active={props.order.id === row.id}
                                            direction={props.order.direction}
                                            onClick={createSortHandler(row.id)}
                                        >
                                            {row.label}
                                        </TableSortLabel>
                                    </Tooltip>
                                )}
                            </TableCell>
                        );
                    }
                }, this)}
            </TableRow>
        </TableHead>
    );
}

export default OrdersTableHead;
