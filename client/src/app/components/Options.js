import isEqual from "lodash/isEqual";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "@fuse/hooks";
import { Option } from "./Option";
import { Grid, Button, makeStyles } from "@material-ui/core";

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

    // TODO collapse into saveActionParam and just use objects
    const handleSubmit = () => {
        dispatch(saveAction(form, saveActionParam, saveActionParam2));
    };

    return (
        form &&
        formId === id && (<>
            <Grid container spacing={2}>
                {Object.keys(data) &&
                    Object.keys(data).map(key => {
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
