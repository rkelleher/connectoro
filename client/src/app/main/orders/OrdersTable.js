import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TablePagination,
    TableRow,
    Checkbox,
    Button,
    Icon
} from "@material-ui/core";
import { FuseScrollbars } from "@fuse";
import { withRouter } from "react-router-dom";
import _ from "@lodash";
import OrdersTableHead from "./OrdersTableHead";
import * as Actions from "app/store/actions";
import { useDispatch, useSelector } from "react-redux";

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

    function handleClick(item) {
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
                <Table className="min-w-xl order-table" aria-labelledby="tableTitle">
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
                                    return (
                                        <TableRow
                                            className="h-64 cursor-pointer"
                                            hover
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={n._id}
                                            selected={isSelected}
                                            onClick={event => handleClick(n)}
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
                                                {new Date(n.createdDate).toUTCString()}
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
                                                {n.easyncOrderStatus && n.easyncOrderStatus.status}
                                            </TableCell>

                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                <Button variant="contained" className="mr-8"
                                                    onClick={event =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <Icon>shopping_cart</Icon>
                                                </Button>
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
