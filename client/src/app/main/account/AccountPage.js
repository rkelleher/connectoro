import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import * as Actions from "app/store/actions";
import {
    TextField,
    Typography,
    Tabs,
    Tab
} from "@material-ui/core";
import { FusePageCarded, FuseLoading } from "@fuse";
import "./AccountPage.css";

const useStyles = makeStyles(theme => {
    return {
        layoutRoot: {}
    };
});

function SettingsTab() {
    const classes = useStyles();
    const email = useSelector(({ account }) => account.email);

    return (
        <div style={{margin: 10}}>
            <TextField
                disabled
                id="outlined-disabled"
                label="Account Email"
                defaultValue={email}
                className={classes.textField}
                margin="normal"
                variant="outlined"
            />
        </div>
    );
}

function UsersTab() {
    const account = useSelector(({ account }) => account);

    return (
        <div style={{margin: 10}}>
            <div className="pb-16 flex items-center">
                <Typography className="h2" color="textSecondary">
                    Users
                </Typography>
            </div>
            <ul>
                {account.users.map(user => (
                    <li key={user}>{user}</li>
                ))}
            </ul>
        </div>
    );
}

function AccountPage() {
    const dispatch = useDispatch();
    const classes = useStyles();

    const isFetching = useSelector(({ account }) => account.isFetching);

    useEffect(() => {
        dispatch(Actions.getAccountDetails());
    }, [dispatch]);

    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, value) => {
        setSelectedTab(value);
    };

    return isFetching ? (
        <FuseLoading />
    ) : (
        <FusePageCarded
            classes={{
                root: classes.layoutRoot,
                toolbar: "p-0"
            }}
            header={
                <div className="py-24">
                    <h1>Account Settings</h1>
                </div>
            }
            contentToolbar={
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="off"
                    className="w-full h-64"
                >
                    <Tab className="h-64" label="General Settings" />
                    <Tab className="h-64" label="Users" />
                </Tabs>
            }
            content={
                <div className="p-24">
                    {selectedTab === 0 && <SettingsTab />}
                    {selectedTab === 1 && <UsersTab />}
                </div>
            }
        />
    );
}

export default AccountPage;
