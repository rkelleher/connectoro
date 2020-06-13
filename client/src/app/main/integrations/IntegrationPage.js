import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import * as Actions from "app/store/actions";
import {
    Card,
    CardContent,
    Button,
    TextField,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    CardActionArea,
    Link,
    Divider,
    Icon,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
} from "@material-ui/core";
import { FusePageCarded, FuseLoading } from "@fuse";
import { useForm } from "@fuse/hooks";
import ConfirmationDialog from "app/components/ConfirmationDialog";
import EasyncAccountOptions from "./easync/EasyncAccountOptions";

const useStyles = makeStyles(theme => {
    return {
        integrationCard: {
            margin: "25px 25px 0 0",
            maxWidth: 250
        },
        activeIntegrationCard: {
            backgroundColor: theme.palette.secondary.main,
            margin: "25px 25px 0 0",
            maxWidth: 250
        },
        layoutRoot: {}
    };
});

const integrationTypes = [
    {
        component: LinnworksIntegrationSettings,
        integrationLabel: "Linnworks",
        integrationKey: "LINNW",
        credentialTypes: [
            {
                label: "App Install Token",
                credentialKey: "INSTALL_TOKEN"
            }
        ],
        options: []
    },
    {
        component: EasyncIntegrationSettings,
        integrationLabel: "Easync",
        integrationKey: "EASYNC",
        credentialTypes: [
            {
                label: "API Token",
                credentialKey: "API_TOKEN"
            }
        ]
    }
];

function getIntegrationTypeDetails(key) {
    return integrationTypes.find(t => t.integrationKey === key);
}

function AddCredentialDialog({ submit, options, title, submitText }) {
    const dispatch = useDispatch();
    const [chosenOption, setChosenOption] = useState(options[0].credentialKey);
    const { form, handleChange } = useForm({ content: "" });
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
                            value={option.credentialKey}
                            key={option.credentialKey}
                            control={<Radio />}
                            label={option.label}
                        />
                    ))}
                </RadioGroup>
                <TextField
                    required
                    autoFocus
                    label="Content"
                    error={form.content === ""}
                    variant="outlined"
                    value={form.content}
                    onChange={handleChange}
                    id="content"
                    name="content"
                ></TextField>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => dispatch(Actions.closeDialog())}
                    color="primary"
                >
                    Cancel
                </Button>
                <Button
                    onClick={() =>
                        form.content !== "" &&
                        submit(chosenOption, form.content)
                    }
                    color="secondary"
                >
                    {submitText}
                </Button>
            </DialogActions>
        </>
    );
}

function IntegrationSettingHeader({
    integration,
    credentialTypes,
    integrationLabel
}) {
    const dispatch = useDispatch();
    const addCredential = (type, content) => {
        dispatch(Actions.closeDialog());
        dispatch(Actions.addCredential(integration._id, type, content));
    };
    const deleteIntegration = () => {
        dispatch(Actions.closeDialog());
        dispatch(Actions.deleteIntegration(integration._id));
    };
    const openAddCredentialDialog = () => {
        dispatch(
            Actions.openDialog({
                children: (
                    <AddCredentialDialog
                        submit={addCredential}
                        options={credentialTypes}
                        title="Set a Credential"
                        submitText="Set Credential"
                    />
                )
            })
        );
    };
    const openDeleteIntegrationDialog = () => {
        dispatch(
            Actions.openDialog({
                children: (
                    <ConfirmationDialog
                        submit={k =>
                            k === "y"
                                ? deleteIntegration()
                                : dispatch(Actions.closeDialog())
                        }
                        options={[
                            { key: "n", label: "No" },
                            { key: "y", label: "Yes" }
                        ]}
                        title={`Delete ${integrationLabel} Integration?`}
                        submitText="Submit"
                    />
                )
            })
        );
    };

    return (
        <>
            {credentialTypes && (
                <Button
                    variant="contained"
                    onClick={openAddCredentialDialog}
                    style={{ marginRight: 20 }}
                >
                    Set a Credential
                </Button>
            )}
            <Button variant="contained" onClick={openDeleteIntegrationDialog}>
                Delete Integration
            </Button>
        </>
    );
}

function IntegrationSettings({ integration, credentialTypes }) {
    const dispatch = useDispatch();
    const { credentials } = integration;

    const deleteCredential = k => {
        dispatch(Actions.closeDialog());
        dispatch(Actions.deleteCredential(integration._id, k));
    };
    const openRemoveCredentialDialog = credentialKey => {
        dispatch(
            Actions.openDialog({
                children: (
                    <ConfirmationDialog
                        submit={submittedKey =>
                            submittedKey === "y"
                                ? deleteCredential(credentialKey)
                                : dispatch(Actions.closeDialog())
                        }
                        options={[
                            { key: "n", label: "No" },
                            { key: "y", label: "Yes" }
                        ]}
                        title={`Delete ${credentialTypes.find(
                            x => x.key === credentialKey
                        )}`}
                        submitText="Submit"
                    />
                )
            })
        );
    };
    return (
        <>
            <Typography variant="h6" component="h6" style={{ marginTop: 20 }}>
                Credentials
            </Typography>
            <ul>
                {credentials &&
                    Object.keys(credentials).map(k => (
                        <li key={k}>
                            <span>
                                {
                                    credentialTypes.find(
                                        x => x.credentialKey === k
                                    ).label
                                }
                                : <i>{credentials[k]}</i>
                            </span>
                            <Link
                                onClick={() => openRemoveCredentialDialog(k)}
                                style={{ cursor: "pointer" }}
                            >
                                <Icon>deleteForever</Icon>
                            </Link>
                        </li>
                    ))}
            </ul>
        </>
    );
}

function EasyncIntegrationSettings(props) {
    const account = useSelector(({ account }) => account);

    return (
        <>
            <IntegrationSettingHeader {...props} />
            <IntegrationSettings {...props} />

            <Divider className="HorizontalLine"/>

            <div style={{margin: 10}}>
                <EasyncAccountOptions
                    data={account.integrationData["EASYNC"]}
                    accountId={account.accountId}
                />
            </div>
        </>
    );
}

function LinnworksIntegrationSettings(props) {
    const appId = props.integration.appId;
    const appInstallURL = `https://apps.linnworks.net/Authorization/Authorize/${appId}`;
    const dispatch = useDispatch();
    const linnworksStockLocations = useSelector(({ account }) => account.integrationData.LINNW.locations);
    const chosenLinnworksStockLocation = useSelector(({ account }) => account.integrationData.LINNW.choosedLocation.LocationName);
    const [currentLinnworksStockLocation, setCurrentLinnworksStockLocation] = React.useState('');
    const [currentLinnworksStockLocationId, setCurrentLinnworksStockLocationId] = React.useState('');
    const classes = useStyles();

    useEffect(() => {
        setCurrentLinnworksStockLocation(chosenLinnworksStockLocation);
    }, []);

    const handleChangeLinnworksLocation = (event, { props }) => {
        setCurrentLinnworksStockLocation(event.target.value);
        setCurrentLinnworksStockLocationId(props.id);
    };

    return (
        <>
            <IntegrationSettingHeader {...props} />
            <p style={{ marginTop: 20 }}>
                To complete Linnworks integration setup, install the Connectoro
                Linnworks App by visiting:
                <br />
                <a href={appInstallURL}>{appInstallURL}</a>
                <br />
                Once installation is complete, copy the App Install Token and
                add it as a credential to this integration.
            </p>
            <IntegrationSettings {...props} />

            <Divider className="HorizontalLine"/>
            <div className="DropshippingWrapper">
                <h6 className="DropshippingLocationText">Dropshipping Location</h6>
                <div className="DropshippingLocation">
                    <div className="CurrentLocation">
                        Current location:
                    </div>

                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel
                            className="InputLabel"
                            id="demo-simple-select-outlined-label"
                        >
                            Select location
                        </InputLabel>
                        <Select
                            className="Select"
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={currentLinnworksStockLocation}
                            onChange={(event, data) => handleChangeLinnworksLocation(event, data)}
                            label="Select location"
                        >
                            {linnworksStockLocations.map(item => {
                                return (
                                    <MenuItem
                                        key={item.StockLocationId}
                                        id={item.StockLocationId}
                                        value={item.LocationName}
                                    >
                                        {item.LocationName}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </div>
                <div className="ButtonWrapper">
                    <Button
                        className="ButtonSave"
                        variant="contained"
                        disabled={!chosenLinnworksStockLocation || !currentLinnworksStockLocation}
                        onClick={() =>
                            dispatch(
                                Actions.setLinnworksLocationId(currentLinnworksStockLocationId)
                            )
                        }
                    >
                        Save
                    </Button>
                    <Button
                        className="ButtonRefresh"
                        variant="contained"
                        onClick={() => {
                            dispatch(
                                Actions.getLinnworksData()
                            )
                        }
                        }
                    >
                        Refresh
                    </Button>
                </div>
            </div>
        </>
    );
}

function IntegrationDetailsCard(props) {
    const { integrationType } = props.integration;
    const typeDetails = getIntegrationTypeDetails(integrationType);
    const IntegrationComponent = typeDetails.component;
    return (
        <Card>
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                    {typeDetails && typeDetails.integrationLabel} Settings
                </Typography>
                <IntegrationComponent {...props} {...typeDetails} />
            </CardContent>
        </Card>
    );
}

function NewIntegrationDialog({ submit }) {
    const dispatch = useDispatch();
    const [chosenType, setChosenType] = useState(
        integrationTypes[0].integrationKey
    );
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
                            value={option.integrationKey}
                            key={option.integrationKey}
                            control={<Radio />}
                            label={option.integrationLabel}
                        />
                    ))}
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => dispatch(Actions.closeDialog())}
                    color="primary"
                >
                    Cancel
                </Button>
                <Button onClick={() => submit(chosenType)} color="secondary">
                    Add Integration
                </Button>
            </DialogActions>
        </>
    );
}

function IntegrationCard({ integration, onActivate, isActive }) {
    const classes = useStyles();
    const { integrationType } = integration;
    const typeDetails = getIntegrationTypeDetails(integrationType);
    return (
        <Card
            key={integrationType}
            className={
                isActive
                    ? classes.activeIntegrationCard
                    : classes.integrationCard
            }
        >
            <CardActionArea onClick={onActivate}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {typeDetails && typeDetails.integrationLabel}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                    >
                        A description of{" "}
                        {typeDetails && typeDetails.integrationLabel}.
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

function IntegrationsTab() {
    const dispatch = useDispatch();
    const integrations = useSelector(({ account }) => account.integrations);
    const submitAdd = type => {
        dispatch(Actions.addNewIntegration(type));
        dispatch(Actions.closeDialog());
    };
    const [activeId, setActiveId] = useState(null);
    const activeIntegration =
        activeId && integrations.find(x => x._id === activeId);
    return (
        <div>
            <div>
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() =>
                        dispatch(
                            Actions.openDialog({
                                children: (
                                    <NewIntegrationDialog submit={submitAdd} />
                                )
                            })
                        )
                    }
                >
                    Add New Integration
                </Button>
            </div>
            <div style={{ display: "flex" }}>
                {integrations.length === 0 ? (
                    <p>No Active Integrations Found</p>
                ) : (
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
            {activeIntegration ? (
                <IntegrationDetailsCard integration={activeIntegration} />
            ) : null}
        </div>
    );
}

function IntegrationPage() {
    const dispatch = useDispatch();
    const classes = useStyles();

    const account = useSelector(({ account }) => account);

    useEffect(() => {
        dispatch(Actions.getAccountDetails());
    }, [dispatch]);

    return account.isFetching ? (
        <FuseLoading />
    ) : (
        <FusePageCarded
            classes={{
                root: classes.layoutRoot,
                toolbar: "p-0"
            }}
            header={
                <div className="py-24">
                    <h1>Integration Settings</h1>
                </div>
            }
            content={
                <div className="p-24">
                    <IntegrationsTab />
                </div>
            }
        />
    );
}

export default IntegrationPage;
