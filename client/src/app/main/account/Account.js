import React, {useState, useEffect} from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {Button, TextField, DialogTitle, DialogContent, DialogContentText, DialogActions, RadioGroup, FormControlLabel, Radio, Typography, CardActions, CardActionArea, Link, Divider, Icon} from '@material-ui/core';
import {FusePageCarded, FuseLoading} from '@fuse';
import {useDispatch, useSelector} from 'react-redux';
import { getAccountDetails, openDialog, closeDialog, addNewIntegration } from 'app/store/actions';
import * as Actions from '../../store/actions';
import { makeStyles } from '@material-ui/styles';
import {Tab, Tabs} from '@material-ui/core';
import { useForm } from '@fuse/hooks';

const useStyles = makeStyles(theme => {
    return {
        integrationCard: {
            margin: '25px 25px 0 0',
            maxWidth: 250
        },
        activeIntegrationCard: {
            backgroundColor: theme.palette.secondary.main,
            margin: '25px 25px 0 0',
            maxWidth: 250
        },
        layoutRoot: {}
    }
});

const integrationTypes = [
    {label: 'Linnworks', key: 'LINNW', component: LinnworksIntegration},
    {label: 'Easync', key: 'EASYNC', component: EasyncIntegration}
];

function getTypeDetails(key) {
    return integrationTypes.find(t => t.key === key);
}

function ConfirmationDialog({submit, options, title, submitText}) {
    const dispatch = useDispatch();
    const [chosenOption, setChosenOption] = useState(options[0].key);
    const handleChange = event => {
        setChosenOption(event.target.value);
    };
    return (
        <>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <RadioGroup
                    name="integrationType"
                    value={chosenOption}
                    onChange={handleChange}
                    >
                    {options.map(option => (
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
                    onClick={() => submit(chosenOption)}
                    color="secondary"
                >
                    {submitText}
                </Button>
            </DialogActions>
        </>
    )
}

function AddCredentialDialog({submit, options, title, submitText}) {
    const dispatch = useDispatch();
    const [chosenOption, setChosenOption] = useState(options[0].key);
    const {form, handleChange} = useForm({content: ''});
    const handleChange2 = event => {
        setChosenOption(event.target.value);
    };
    return (
        <>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <RadioGroup
                    name="integrationType"
                    value={chosenOption}
                    onChange={handleChange2}
                    >
                    {options.map(option => (
                        <FormControlLabel
                            value={option.key}
                            key={option.key}
                            control={<Radio />}
                            label={option.label} />
                    ))}
                </RadioGroup>
                <TextField
                    required
                    autoFocus
                    label="Content"
                    error={form.content === ''}
                    variant="outlined"
                    value={form.content}
                    onChange={handleChange}
                    id="content"
                    name="content"
                >
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => dispatch(closeDialog())}
                    color="primary"
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => form.content !== '' && submit(chosenOption, form.content)}
                    color="secondary"
                >
                    {submitText}
                </Button>
            </DialogActions>
        </>
    )
}

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
function EasyncIntegration({integration}) {
    return (
        <span>{integration._id}</span>
    );
}

function LinnworksIntegration({integration}) {
    const dispatch = useDispatch();
    const {form, handleChange, setForm} = useForm(null);
    const { integrationType, credentials } = integration;
    const typeDetails = getTypeDetails(integrationType);
    useEffect(() => {
        if (integration && !form) {
            setForm(integration)
        }
    }, [form, integration])

    const addCredential = (type, content) => {
        dispatch(Actions.closeDialog());
        dispatch(Actions.addCredential(integration._id, type, content));
    };

    const credentialTypes = [{
        label: 'App Install Token',
        key: 'INSTALL_TOKEN'
    }];

    const openAddCredentialDialog = () => {
        dispatch(openDialog({
            children: (
                <AddCredentialDialog
                    submit={addCredential}
                    options={credentialTypes}
                    title="Set a Credential"
                    submitText="Set Credential"
                />
            )
        }));
    };
    const deleteIntegration = () => {
        dispatch(closeDialog());
        dispatch(Actions.deleteIntegration(integration._id));
    };
    const openDeleteDialog = () => {
        dispatch(openDialog({
            children: (
                <ConfirmationDialog
                    submit={(k) => k === 'y' ? deleteIntegration() : dispatch(closeDialog())}
                    options={[{key: 'n', label: 'No'}, {key: 'y', label: 'Yes'}]}
                    title={`Delete ${typeDetails.label} Integration?`}
                    submitText="Submit"
                />
            )
        }));
    };
    const deleteCredential = (k) => {
        dispatch(closeDialog());
        dispatch(Actions.deleteCredential(integration._id, k));
    }
    const openRemoveCredentialDialog = (key) => {
        dispatch(openDialog({
            children: (
                <ConfirmationDialog
                    submit={(k) => k === 'y' ? deleteCredential(key) : dispatch(closeDialog())}
                    options={[{key: 'n', label: 'No'}, {key: 'y', label: 'Yes'}]}
                    title={`Delete Credential?`}
                    submitText="Submit"
                />
            )
        }));
    };
    return (
        <>
            <Button variant="contained" onClick={openAddCredentialDialog} style={{marginRight: 20}}>
                Set a Credential
            </Button>
            <Button variant="contained" onClick={openDeleteDialog}>
                Delete Integration
            </Button>
            <Typography variant="h6" component="h6" style={{marginTop: 20}}>
                Credentials
            </Typography>
            <ul>
                {credentials && Object.keys(credentials).map(k => (
                    <li key={k}>
                        <span>
                            {credentialTypes.find(x => x.key === k).label}: <i>{credentials[k]}</i>
                        </span>
                        <Link onClick={() => openRemoveCredentialDialog(k)} style={{cursor: "pointer"}}>
                            <Icon>deleteForever</Icon>
                        </Link>
                    </li>
                ))}
            </ul>
            <Typography variant="h6" component="h6" style={{marginTop: 20}}>
                Options
            </Typography>
        </>
    );
}

function IntegrationCard({integration, onActivate, isActive}) {
    const classes = useStyles();
    const { integrationType } = integration;
    const typeDetails = getTypeDetails(integrationType);
    return (
        <Card key={integrationType} className={isActive ? classes.activeIntegrationCard : classes.integrationCard}>
            <CardActionArea onClick={onActivate}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {typeDetails && typeDetails.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        A description of {typeDetails && typeDetails.label}.
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

function IntegrationDetailsCard({integration}) {
    const { integrationType } = integration;
    const typeDetails = getTypeDetails(integrationType);
    const I = typeDetails.component;
    return (
        <Card>
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    {typeDetails && typeDetails.label} Settings
                </Typography>
                <I integration={integration} />
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
    const submitAdd = (type) => {
        dispatch(addNewIntegration(type));
        dispatch(closeDialog());
    }
    const [activeId, setActiveId] = useState(null);
    const activeIntegration = activeId && integrations.find(x => x._id === activeId);
    return (
        <div>
            <div>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => dispatch(openDialog({
                        children: <NewIntegrationDialog submit={submitAdd} />
                    }))}
                >
                    Add New Integration
                </Button>
            </div>
            <div style={{display: 'flex'}}>
                {integrations.length === 0 ? <p>No Active Integrations Found</p> : (
                    integrations.map(x => (
                        <IntegrationCard
                            key={x.integrationType}
                            integration={x}
                            onActivate={() => setActiveId(x._id)}
                            isActive={x._id === activeId}
                        />
                    ))
                )}
            </div>
            <br />
            <Divider />
            <br />
            {activeIntegration ? <IntegrationDetailsCard integration={activeIntegration}/> : null}
        </div>
    )
}

function SettingsTab() {
    const classes = useStyles();
    const email = useSelector(({account}) => account.email);
    const users = useSelector(({account}) => account.users);
    return (
        <>
            <Typography variant="h5" component="h2">
                Account Details
            </Typography>
            <TextField
            disabled
            id="outlined-disabled"
            label="Email"
            defaultValue={email}
            className={classes.textField}
            margin="normal"
            variant="outlined"
            />
            <Typography variant="h5" component="h2">
                Account Users
            </Typography>
            <ul>
                {users.map(user => <li key={user}>{user}</li>)}
            </ul>
        </>
    )
}

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
                    {isFetching ? <FuseLoading /> : (
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
