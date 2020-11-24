import React, { useEffect } from "react";
import { Typography, Button, Select, MenuItem, Paper, Input, Icon } from "@material-ui/core";
import { ThemeProvider } from '@material-ui/styles';
import { FuseAnimate } from "@fuse";
import * as Actions from "app/store/actions";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
  } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { usePrevious } from "@fuse/hooks";
import { useDispatch, useSelector } from "react-redux";

function OrdersHeader(props) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [range, setRange] = React.useState(1);
    const [searchText, setSearchText] = React.useState('');
    const mainTheme = useSelector(({fuse}) => fuse.settings.mainTheme);
    const statusOrder = useSelector(({ orders }) => orders.status);
    const trackingOrder = useSelector(({ orders }) => orders.tracking);
    const direction = useSelector(({ orders }) => orders.direction);
    const page = useSelector(({ orders }) => orders.page);
    const rowsPerPage = useSelector(({ orders }) => orders.rowsPerPage);
    const params = {
        rangeDate : null, 
        startDate: null, 
        endDate: null,
        search: searchText,
        status: statusOrder,
        tracking: trackingOrder,
        direction: direction || 'dsc',
        page: page,
        limit: rowsPerPage,
    };

    useEffect(() => {
        if (searchText.length> 2) {
        const timeOutId = setTimeout(() => {
            params.rangeDate = null;
            params.startDate = null;
            params.endDate = null;
            params.status = null;
            params.tracking = null;
            params.page = null;
            params.limit = null;
            dispatch(Actions.getOrders(params));
            }, 500);
        return () => clearTimeout(timeOutId);
        } else {
            if (searchText.length === 0) {
                dispatch(Actions.getOrders(params));
            }
        }
    }, [searchText]);

    const prevStatus = usePrevious(statusOrder);
    const prevTracking = usePrevious(trackingOrder);
    const prevDirection = usePrevious(direction);
    const prevRowsPerPage = usePrevious(rowsPerPage);
    const prevPage = usePrevious(page);

    useEffect(() => {
        if (prevStatus !== statusOrder) {
            if (range !== 0) {
                params.rangeDate = range;
            } else {
                params.rangeDate = null;
            }
            dispatch(Actions.getOrders(params));
        }
        
    }, [statusOrder]);

    useEffect(() => {
        if (prevTracking !== trackingOrder) {
            if ((range !== 0 ) && (range !== 1)) {
                params.rangeDate = range;
            } else {
                params.rangeDate = null;
            }
            dispatch(Actions.getOrders(params));
        }
    }, [trackingOrder]);

    useEffect(() => {
        if (prevDirection !== direction) {
            params.direction = direction;
            dispatch(Actions.getOrders(params));
        }
    }, [direction]);

    useEffect(() => {
        if (prevRowsPerPage !== rowsPerPage) {
            params.limit = rowsPerPage;
            dispatch(Actions.getOrders(params));
        }
    }, [rowsPerPage]);

    useEffect(() => {
        if (prevPage !== page) {
            params.page = page;
            dispatch(Actions.getOrders(params));
        }
    }, [page]);

    const selectRange = (event) => {
        params.rangeDate = event.target.value;
        if (params.rangeDate !== 0) {
            dispatch(Actions.getOrders(params));
        }
        setRange(event.target.value);
    }

    const setStart = (date) => {
        params.rangeDate = null;
        const time = moment(date).format('YYYY-MM-DD');
        params.startDate = time;
        params.endDate = endDate;
        dispatch(Actions.getOrders(params));
        setStartDate(time);
    }

    const setEnd = (date) => {
        params.rangeDate = null;
        const time = moment(date).format('YYYY-MM-DD');
        params.endDate = time;
        params.startDate = startDate;
        dispatch(Actions.getOrders(params));
        setEndDate(time);
    }

    return (
        <div className="flex flex-1 w-full items-center">
            <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                <Typography className="hidden sm:flex" variant="h6">
                    Orders
                </Typography>
            </FuseAnimate>
            <ThemeProvider theme={mainTheme}>
                    <FuseAnimate animation="transition.slideDownIn" delay={300}>
                        <Paper className="flex items-center w-full max-w-512 px-8 py-4 rounded-8 mx-20" elevation={1}>

                            <Icon className="mr-8" color="action">search</Icon>

                            <Input
                                placeholder="Search"
                                className="flex flex-1"
                                disableUnderline
                                fullWidth
                                value={searchText}
                                inputProps={{
                                    'aria-label': 'Search'
                                }}
                                onChange={(event) => setSearchText(event.target.value)}
                            />
                        </Paper>
                    </FuseAnimate>
                </ThemeProvider>
            <div style={{width: "465px"}} className="flex justify-between items-center">
                <Select
                    value={range}
                    onChange={selectRange}
                    >
                    <MenuItem value={1}>All Dates</MenuItem>
                    <MenuItem value={moment().format('YYYY-MM-DD')}>Last Day</MenuItem>
                    <MenuItem value={moment().subtract(2, 'days').format('YYYY-MM-DD')}>Last 3 Days</MenuItem>
                    <MenuItem value={moment().subtract(6, 'days').format('YYYY-MM-DD')}>Last 7 Days</MenuItem>
                    <MenuItem value={moment().subtract(13, 'days').format('YYYY-MM-DD')}>Last 14 Days</MenuItem>
                    <MenuItem value={moment().subtract(29, 'days').format('YYYY-MM-DD')}>Last 30 Days</MenuItem>
                    <MenuItem value={moment().subtract(89, 'days').format('YYYY-MM-DD')}>Last 90 Days</MenuItem>
                    <MenuItem value={moment().subtract(179, 'days').format('YYYY-MM-DD')}>Last 180 Days</MenuItem>
                    <MenuItem value={moment().subtract(359, 'days').format('YYYY-MM-DD')}>Last 360 Days</MenuItem>
                    <MenuItem value={0}>Custom Range</MenuItem>
                </Select>
                {(range === 0) ?
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                        style={{margin: "0 0 16px 0", width: "145px"}}
                        disableToolbar
                        variant="inline"
                        margin="none"
                        format="dd/MM/yyyy"
                        id="date-picker-inline"
                        label="Start Rang"
                        value={startDate}
                        onChange={setStart}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        />
                        <KeyboardDatePicker
                        style={{margin: "0 0 16px 0", width : "145px"}}
                        disableToolbar
                        variant="inline"
                        margin="normal"
                        id="date-picker"
                        label="End Range"
                        format="dd/MM/yyyy"
                        value={endDate}
                        onChange={setEnd}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        />
                </MuiPickersUtilsProvider>
                    : null}
            </div>
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button
                    variant="contained"
                    onClick={() => dispatch(Actions.createOrder())}
                    className="ml-auto"
                >
                    Create Order
                </Button>
            </FuseAnimate>
        </div>
    );
}

export default OrdersHeader;
