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
    const paramsState = useSelector(({ orders }) => orders.paramsState);
    const [startDate, setStartDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [range, setRange] = React.useState(0);
    const [searchText, setSearchText] = React.useState();
    const mainTheme = useSelector(({fuse}) => fuse.settings.mainTheme);
    const statusOrder = useSelector(({ orders }) => orders.status);
    const trackingOrder = useSelector(({ orders }) => orders.tracking);
    const direction = useSelector(({ orders }) => orders.direction);
    const page = useSelector(({ orders }) => orders.page);
    const rowsPerPage = useSelector(({ orders }) => orders.rowsPerPage);

    const prevStatus = usePrevious(statusOrder);
    const prevTracking = usePrevious(trackingOrder);
    const prevDirection = usePrevious(direction);
    const prevRowsPerPage = usePrevious(rowsPerPage);
    const prevPage = usePrevious(page);
    const prevSearch = usePrevious(searchText);
    const prevStartDate = usePrevious(startDate);

    let params = {
        rangeDate : range || null, 
        startDate: startDate || null, 
        endDate: endDate || null,
        search: searchText || null,
        status: statusOrder || null,
        tracking: trackingOrder || null,
        direction: direction || 'dsc',
        page: page-1 || null,
        limit: rowsPerPage || null,
    };

    useEffect(() => {
        if (Object.keys(paramsState).length === 0 && paramsState.constructor === Object) {
            params.startDate = null;
            params.endDate = null;
            params.status = null;
            params.tracking = null;
            dispatch(Actions.getOrders(params));
        } else {
            if (paramsState.rangeDate) {
                setRange(paramsState.rangeDate);
            }
            if (paramsState.endDate) {
                setEndDate(paramsState.endDate);
            }
            if (paramsState.startDate) {
                setStart(paramsState.startDate);
            }
            setSearchText(paramsState.search);
            params = paramsState;
        };
    }, []);

    useEffect(() => {
        if (searchText && searchText.length> 2 && prevSearch) {
        const timeOutId = setTimeout(() => {
            if (range !== 1) {
                params.startDate = null;
                params.endDate = null;
            }
            if (statusOrder === 1) {
                params.status = null;
            }
            if (trackingOrder === 1) {
                params.tracking = null;
            }
            params.page = 0;
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
            }, 500);
        return () => clearTimeout(timeOutId);
        } else {
            if (searchText === '' && (prevSearch !== searchText)) {
                params.startDate = null;
                params.endDate = null;
                if (statusOrder === 1) {
                    params.status = null;
                }
                if (trackingOrder === 1) {
                    params.tracking = null;
                }
                dispatch(Actions.saveParams(params));
                dispatch(Actions.getOrders(params));
            }
        }
    }, [searchText]);

    useEffect(() => {
        if (prevStatus) {
            if (range !== 1) {
                params.rangeDate = range;
                params.startDate = null;
                params.endDate = null;
            } else {
                params.rangeDate = null;
            }
            if (trackingOrder === 1) {
                params.tracking = null;
            }
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
        }
    }, [statusOrder]);

    useEffect(() => {
        if (prevTracking) {
            if ((range !== 1 )) {
                params.rangeDate = range;
                params.startDate = null;
                params.endDate = null;
            } else {
                params.rangeDate = null;
            }
            if (statusOrder === 1) {
                params.status = null;
            }
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
        }
    }, [trackingOrder]);

    useEffect(() => {
        if (prevDirection) {
            if (statusOrder === 1) {
                params.status = null;
            }
            if (trackingOrder === 1) {
                params.tracking = null;
            }
            params.direction = direction;
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
        }
    }, [direction]);

    useEffect(() => {
        if (prevRowsPerPage) {
            params.limit = rowsPerPage;
            if (range !==1 ) {
                params.startDate = null;
                params.endDate = null;
            }
            if (statusOrder === 1) {
                params.status = null;
            }
            if (trackingOrder === 1) {
                params.tracking = null;
            }
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
        }
    }, [rowsPerPage]);

    useEffect(() => {
        if (prevPage) {
            params.page = page-1;
            if (range !== 1 ) {
                params.startDate = null;
                params.endDate = null;
            }
            if (statusOrder === 1) {
                params.status = null;
            }
            if (trackingOrder === 1) {
                params.tracking = null;
            }
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
        }
    }, [page]);

    const selectRange = (event) => {
        setRange(event.target.value);
        params.rangeDate = event.target.value;
        params.startDate = null;
        params.endDate = null;
        if (statusOrder === 1) {
            params.status = null;
        }
        if (trackingOrder === 1) {
            params.tracking = null;
        }
        if (params.rangeDate !== 1) {
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
        }
    }

    const setStart = (date) => {
        params.rangeDate = null;
        const time = moment(date).format('YYYY-MM-DD');
        params.endDate = endDate;
        params.startDate = time;
        if (statusOrder === 1) {
            params.status = null;
        }
        if (trackingOrder === 1) {
            params.tracking = null;
        }
        if (prevStartDate) {
            console.log(prevStartDate, time);
            dispatch(Actions.saveParams(params));
            dispatch(Actions.getOrders(params));
        }
        params.rangeDate = 1;
        setStartDate(time);
    }

    const setEnd = (date) => {
        params.rangeDate = null;
        const time = moment(date).format('YYYY-MM-DD');
        params.endDate = time;
        params.startDate = startDate;
        if (statusOrder === 1) {
            params.status = null;
        }
        if (trackingOrder === 1) {
            params.tracking = null;
        }
        dispatch(Actions.saveParams(params));
        dispatch(Actions.getOrders(params));
        params.rangeDate = 1;
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
                    <MenuItem value={0}>All Dates</MenuItem>
                    <MenuItem value={moment().format('YYYY-MM-DD')}>Last Day</MenuItem>
                    <MenuItem value={moment().subtract(2, 'days').format('YYYY-MM-DD')}>Last 3 Days</MenuItem>
                    <MenuItem value={moment().subtract(6, 'days').format('YYYY-MM-DD')}>Last 7 Days</MenuItem>
                    <MenuItem value={moment().subtract(13, 'days').format('YYYY-MM-DD')}>Last 14 Days</MenuItem>
                    <MenuItem value={moment().subtract(29, 'days').format('YYYY-MM-DD')}>Last 30 Days</MenuItem>
                    <MenuItem value={moment().subtract(89, 'days').format('YYYY-MM-DD')}>Last 90 Days</MenuItem>
                    <MenuItem value={moment().subtract(179, 'days').format('YYYY-MM-DD')}>Last 180 Days</MenuItem>
                    <MenuItem value={moment().subtract(359, 'days').format('YYYY-MM-DD')}>Last 360 Days</MenuItem>
                    <MenuItem value={1}>Custom Range</MenuItem>
                </Select>
                {(range === 1) ?
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
