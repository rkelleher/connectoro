import isEqual from "lodash/isEqual";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "@fuse/hooks";
import { Option } from "./Option";
import { Button } from "@material-ui/core";

export function Options({ data, saveAction, isSaving, getArrayChoices }) {
    const dispatch = useDispatch();
    const { form, handleChange, setForm, setInForm } = useForm(null);

    useEffect(() => {
        if (data && !form) {
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

    const handleSubmit = () => {
        dispatch(saveAction(form));
    };

    return (
        form && (
            <div>
                <div>
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
                                        display: "inline-block"
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
                                                "object": getArrayChoices && getArrayChoices(key) || []
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
