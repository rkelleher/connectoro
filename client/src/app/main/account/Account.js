import React, {useState} from 'react';
import Formsy from 'formsy-react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {Button, InputAdornment, Icon, CircularProgress, TextField, DialogTitle, DialogContent, DialogContentText, DialogActions, RadioGroup, FormControlLabel, Radio, Typography} from '@material-ui/core';
import {TextFieldFormsy, FusePageCarded} from '@fuse';
import {useDispatch, useSelector} from 'react-redux';
import { getAccountDetails, openDialog, closeDialog, addNewIntegration } from 'app/store/actions';
import { makeStyles } from '@material-ui/styles';
import {Tab, Tabs} from '@material-ui/core';

const integrationTypes = [
    {label: 'Linnworks', key: 'LINNW'},
    {label: 'Easync', key: 'EASYNC'}
];

// LINNWORKS OPTIONS
// 

// EASYNC OPTIONS
// condition_in: (selection see easync api)
// handling_days_max: (int)
// max_item_price: (int)
// prime: (boolean, true/false)
// max_price: (int)
// is_gift:(boolean, true/false)
// shipping_method: (selection from api values)
// fbe: (boolean, true/false)
// client_notes: (i add some internal order id to this field)

function Credential() {
  // type dropdown
  // string input
}

function Credentials() {
  // add-new button
  // credential list w/ remove button
  return null;
}

function Integration({integration}) {
    const { integrationType } = integration;
    const typeDetails = integrationTypes.find(t => t.key === integrationType);
    return (
        <Card key={integrationType} style={{marginTop: 25}}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    {typeDetails && typeDetails.label}
                </Typography>
            </CardContent>
        </Card>
    );
}

function NewIntegrationDialog({submit}) {
    const dispatch = useDispatch();
    const [chosenType, setChosenType] = useState(integrationTypes[0].key);
    const handleChange = event => {
        setChosenType(event.target.value);
    };
    return (
        <>
            <DialogTitle>New Integration</DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    Some description about integrations?
                </DialogContentText>
                <RadioGroup
                    name="integrationType"
                    value={chosenType}
                    onChange={handleChange}
                    >
                    {integrationTypes.map(option => (
                        <FormControlLabel
                            value={option.key}
                            key={option.key}
                            control={<Radio />}
                            label={option.label} />
                    ))}
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => dispatch(closeDialog())}
                    color="primary"
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => submit(chosenType)}
                    color="secondary"
                >
                    Add Integration
                </Button>
            </DialogActions>
        </>
    )
}

function IntegrationsTab() {
    const dispatch = useDispatch();
    const integrations = useSelector(({account}) => account.integrations);
    const submit = (type) => {
        dispatch(addNewIntegration(type));
        dispatch(closeDialog());
    }
    return (
        <div>
            <div>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => dispatch(openDialog({
                        children: <NewIntegrationDialog submit={submit} />,
                        disableBackdropClick: true,
                        disableEscapeKeyDown: true
                    }))}
                >
                    Add New Integration
                </Button>
            </div>
            <div>
                {integrations.length === 0 ? <p>No Active Integrations Found</p> : (
                    integrations.map(x => <Integration key={x.integrationType} integration={x} />)
                )}
            </div>
        </div>
    )
}
function SettingsTab() {
    const classes = useStyles();
    const email = useSelector(({account}) => account.email);
    return (
        <TextField
          disabled
          id="outlined-disabled"
          label="Email"
          defaultValue={email}
          className={classes.textField}
          margin="normal"
          variant="outlined"
        />
    )
}

const useStyles = makeStyles({
    layoutRoot: {}
});

function Account() {
    const dispatch = useDispatch();
    const classes = useStyles();

    const isFetching = useSelector(({account}) => account.isFetching);
    const needsRefresh = useSelector(({account}) => account.needsRefresh);

    if (needsRefresh) {
        dispatch(getAccountDetails());
    }

    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, value) => {
        setSelectedTab(value);
    };

    return (
        <FusePageCarded
            classes={{
                root   : classes.layoutRoot,
                toolbar: "p-0"
            }}
            header={
                <div className="py-24"><h1>Account Settings</h1></div>
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
                    <Tab className="h-64" label="Settings"/>
                    <Tab className="h-64" label="Integrations"/>
                </Tabs>
            }
            content={
                <div className="p-24">
                    {isFetching ? <CircularProgress color="secondary" /> : (
                        <>
                            {selectedTab === 0 && <SettingsTab />}
                            {selectedTab === 1 && <IntegrationsTab/>}
                        </>
                    )}
                </div>
            }
        />
    )
}

export default Account;
