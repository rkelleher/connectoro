import React from "react";
import { Typography, Button, Select, MenuItem } from "@material-ui/core";
import { FuseAnimate } from "@fuse";
import * as Actions from "app/store/actions";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
  } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import { useDispatch } from "react-redux";

function OrdersHeader(props) {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = React.useState(moment().format('YYYY-MM-DD'));
    const [range, setRange] = React.useState(0);

    

    const currentDate = moment().format('YYYY-MM-DD');
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

    const resetRanges = () => {
        setStartDate(moment().format('YYYY-MM-DD'));
        setEndDate(moment().format('YYYY-MM-DD'));
    }

    if (rangeDate) {
        dispatch(Actions.getOrders(rangeDate));
        rangeDate = null;
    }

    const getOrders = () => {
        let correctRange = moment(endDate).add(1, 'days');
        dispatch(Actions.getOrders(null, startDate, correctRange));
        rangeDate = null;
    }

    const setStart = (date) => {
        const time = moment(date).format('YYYY-MM-DD');
        setStartDate(time);
        getOrders();
        setRange(0);
    }

    const setEnd = (date) => {
        const time = moment(date).format('YYYY-MM-DD');
        setEndDate(time);
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
            <div>
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
                    disableToolbar
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Start Rang"
                    value={startDate}
                    onChange={setStart}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                    />
                    <KeyboardDatePicker
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
