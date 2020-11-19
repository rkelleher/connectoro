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
import { useDispatch, useSelector } from "react-redux";

function OrdersHeader(props) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [range, setRange] = React.useState(0);
    const [searchText, setSearchText] = React.useState('');
    const mainTheme = useSelector(({fuse}) => fuse.settings.mainTheme);
    const params = {
        rangeDate : null, 
        startDate: null, 
        endDate: endDate,
        search: searchText,
    };

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            getOrders();
            console.log('search');
            }, 500);
        return () => clearTimeout(timeOutId);
    }, [searchText]);
    
    let rangeDate;

    switch (range) {
        case 10:
            rangeDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
            break;
        case 20:
            rangeDate = moment().subtract(3, 'days').format('YYYY-MM-DD');
            break;
        case 30:
            rangeDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
            break;
        case 40:
            rangeDate = moment().subtract(14, 'days').format('YYYY-MM-DD');
            break;
        case 50:
            rangeDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
            break;
        default:
            rangeDate = null;
            break;
    }

    if (rangeDate) {
        params.rangeDate = rangeDate;
        params.startDate = null;
        params.endDate = null;
        dispatch(Actions.getOrders(params));
        params.rangeDate = null;
    }

    const getOrders = () => {
        let correctRange = moment(endDate).add(1, 'days');
        params.endDate = correctRange
        dispatch(Actions.getOrders(params));
        rangeDate = null;
    }

    const setStart = (date) => {
        const time = moment(date).format('YYYY-MM-DD');
        setStartDate(time);
        params.startDate = time;
        getOrders();
        setRange(0);
    }

    const setEnd = (date) => {
        const time = moment(date).format('YYYY-MM-DD');
        setEndDate(time);
        params.startDate = startDate;
        getOrders();
        setRange(0);
    }

    return (
        <div className="flex flex-1 w-full items-center justify-between">
            <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                <Typography className="hidden sm:flex" variant="h6">
                    Orders
                </Typography>
            </FuseAnimate>
            <ThemeProvider theme={mainTheme}>
                    <FuseAnimate animation="transition.slideDownIn" delay={300}>
                        <Paper className="flex items-center w-full max-w-512 px-8 py-4 rounded-8" elevation={1}>

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
            <div style={{width: "500px"}} className="flex justify-between items-center">
                <Select
                    value={range}
                    onChange={(event) => setRange(event.target.value)}
                    >
                    <MenuItem value={10}>Last Day</MenuItem>
                    <MenuItem value={20}>Last 3 days</MenuItem>
                    <MenuItem value={30}>Last 7 Days</MenuItem>
                    <MenuItem value={40}>Last 14 Days</MenuItem>
                    <MenuItem value={50}>Last 30 Days</MenuItem>
                    <MenuItem value={0}>Custom Range</MenuItem>
                </Select>
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
                    id="date-picker-inline"
                    label="End Range"
                    format="dd/MM/yyyy"
                    value={endDate}
                    onChange={setEnd}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                    />
                </MuiPickersUtilsProvider>
            </div>
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button
                    variant="contained"
                    onClick={() => dispatch(Actions.createOrder())}
                >
                    Create Order
                </Button>
            </FuseAnimate>
        </div>
    );
}

export default OrdersHeader;
