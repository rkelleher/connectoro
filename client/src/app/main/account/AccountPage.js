import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import * as Actions from "app/store/actions";
import {
    TextField,
    Typography,
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
    const users = useSelector(({ account }) => account.users);

    return (
        <>
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
            <div style={{margin: 10}}>
                <div className="pb-16 flex items-center">
                    <Typography className="h2" color="textSecondary">
                        Users
                    </Typography>
                </div>
                <ul>
                    {users.map(user => (
                        <li key={user}>{user}</li>
                    ))}
                </ul>
            </div>
        </>
    );
}

function AccountPage() {
    const dispatch = useDispatch();
    const classes = useStyles();

    const isFetching = useSelector(({ account }) => account.isFetching);

    useEffect(() => {
        dispatch(Actions.getAccountDetails());
    }, [dispatch]);

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
            content={
                <div className="p-24">
                    <SettingsTab />
                </div>
            }
        />
    );
}

export default AccountPage;
