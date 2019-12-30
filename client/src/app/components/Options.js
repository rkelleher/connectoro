import isEqual from "lodash/isEqual";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "@fuse/hooks";
import { Option } from "./Option";
import { Button } from "@material-ui/core";

export function Options({
    data,
    saveAction,
    saveActionParam,
    saveActionParam2,
    isSaving,
    getArrayChoices
}) {
    const dispatch = useDispatch();
    const { form, handleChange, setForm, setInForm } = useForm(null);

    useEffect(() => {
        if ((data && !form) || data._id !== form._id) {
            setForm(data);
        }
    }, [data, form, setForm]);

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
        form && (
            <div style={{ maxWidth: 500 }}>
                <div style={{ margin: 10 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!canBeSubmitted()}
                        onClick={handleSubmit}
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
                <div>
                    {Object.keys(data) &&
                        Object.keys(data).map(key => {
                            return (
                                <div
                                    key={key}
                                    style={{
                                        margin: 10,
                                        display: "block"
                                    }}
                                >
                                    <Option
                                        optionKey={key}
                                        form={form}
                                        label={key}
                                        setInForm={setInForm}
                                        handleChange={handleChange}
                                        choices={
                                            {
                                                "string": "str",
                                                "boolean": "bool",
                                                "number": "int",
                                                "object":
                                                    (getArrayChoices &&
                                                        getArrayChoices(key)) ||
                                                    []
                                            }[typeof data[key]]
                                        }
                                    />
                                </div>
                            );
                        })}
                </div>
            </div>
        )
    );
}
