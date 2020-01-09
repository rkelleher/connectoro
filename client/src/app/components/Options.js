import isEqual from "lodash/isEqual";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "@fuse/hooks";
import { Option } from "./Option";
import { Button } from "@material-ui/core";

export function Options({
    id,
    isInline,
    data,
    saveAction,
    saveActionParam,
    saveActionParam2,
    isSaving,
    getArrayChoices,
    stringOptions
}) {
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
        formId === id && (
            <div style={{ maxWidth: 500 }}>
                <div>
                    {Object.keys(data) &&
                        Object.keys(data).map(key => {
                            return (
                                <div
                                    key={key}
                                    style={{
                                        margin: 10,
                                        display: isInline
                                            ? "inline-block"
                                            : "block"
                                    }}
                                >
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
                                </div>
                            );
                        })}
                </div>

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
            </div>
        )
    );
}
