import isEqual from "lodash/isEqual";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "@fuse/hooks";
import { Option } from "./Option";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { showMessage } from 'app/store/actions';

const useStyles = makeStyles(theme => ({
    saveBtnContainer: {
        marginTop: 10,
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            justifyContent: 'center'
        }
    }
}));

export function Options({
    id,
    isInline,
    data,
    saveAction,
    saveActionParam,
    saveActionParam2,
    isSaving,
    getArrayChoices,
    stringOptions,
    smCol=3
}) {
    const classes = useStyles();

    const dispatch = useDispatch();
    const { form, handleChange, setForm, setInForm } = useForm(null);
    const [formId, setFormId] = useState(null);
    const errors = [];

    useEffect(() => {
        if ((data && !form) || id !== formId) {
            setForm(data);
            setFormId(id);
        }
    }, [data, form, setForm, id, formId, setFormId]);

    const canBeSubmitted = () => {
        if (isSaving || !form || Object.keys(form).length === 0) {
            return false;
        }
        if (!data) {
            return true;
        }
        for (const k of Object.keys(form)) {
            if (!isEqual(form[k], data[k])) {
                return true;
            }
        }
        return false;
    };

    const decamelize = (str, separator) => {
        separator = typeof separator === 'undefined' ? ' ' : separator;
    
        return str
            .replace(/([a-z\d])([A-Z\d])/g, '$1' + separator + '$2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
            .toLowerCase();
    }

    // TODO collapse into saveActionParam and just use objects
    const handleSubmit = () => {
        if (errors.length > 0)  {
            const display = errors.map((field => {
                field = decamelize(field)
                return field
            }))
            let fields = display.join(', ');
            dispatch(
                showMessage({
                    message     : <p>This fields: <span className="capitalize">{fields}</span> are required !</p>,
                    autoHideDuration: 6000,
                    anchorOrigin: {
                        vertical  : 'top',
                        horizontal: 'center'
                    },
                    variant: 'error'
                }))
                return;
        }
        dispatch(saveAction(form, saveActionParam, saveActionParam2));
    };

    return (
        form &&
        formId === id && (<>
            <Grid container spacing={2}>
                {Object.keys(data) &&
                    Object.keys(data).map(key => {
                        if (!form[key]) {
                            if (key === 'firstName' || key === 'addressLine1' || key === 'zipCode' || key === 'city' || key === 'state' || key === 'countryName' || key === 'phoneNumber') {
                                errors.push(key);
                            }
                        }
                        console.log(form.firstName);
                        return (
                            <Grid item xs={6} sm={smCol} key={key}>
                                <Option
                                    isInline={isInline}
                                    optionKey={key}
                                    form={form}
                                    label={key}
                                    setInForm={setInForm}
                                    handleChange={handleChange}
                                    choices={
                                        {
                                            "string":
                                                stringOptions &&
                                                stringOptions[key]
                                                    ? stringOptions[key]
                                                    : "str",
                                            "boolean": "bool",
                                            "number": "int",
                                            "object":
                                                (getArrayChoices &&
                                                    getArrayChoices(key)) ||
                                                []
                                        }[typeof data[key]]
                                    }
                                />
                            </Grid>
                        );
                    })}
            </Grid>

            <div className={classes.saveBtnContainer}>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!canBeSubmitted()}
                    onClick={handleSubmit}
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </>)
    );
}
