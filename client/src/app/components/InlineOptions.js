import isEqual from "lodash/isEqual";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "@fuse/hooks";
import { Option } from "./Option";
import { Button, IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";

// editAction should set isEditing: true,
// cancelEditAction should set isEditing: false
// saveAction should set isSaving to true,
//      then when it finishes set isSaving: false, isEditing: false and update data

export function InlineOptions({
    data,
    actionParam,
    isSaving,
    saveAction,
    isEditing,
    editAction,
    cancelEditAction,
    getArrayChoices
}) {
    const dispatch = useDispatch();
    const { form, handleChange, setForm, setInForm } = useForm(null);

    useEffect(() => {
        // TODO pass in ._id elsewhere when possible
        if ((data && !form) || data._id !== form._id) {
            setForm(data);
        }
    }, [data, form, setForm]);

    const canBeSaved = (() => {
        if (isSaving || !form || Object.keys(form).length === 0) {
            return false;
        }
        for (const k of Object.keys(form)) {
            if (!isEqual(form[k], data[k])) {
                return true;
            }
        }
        return false;
    })();

    return (
        form && (
            <div>
                <div style={{ margin: 10 }}>
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
                                    {isEditing ? (
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
                                                            getArrayChoices(
                                                                key
                                                            )) ||
                                                        []
                                                }[typeof data[key]]
                                            }
                                        />
                                    ) : (
                                        <span style={{ margin: 10 }}>
                                            {data[key]}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                </div>
                <div style={{ margin: 10 }}>
                    {!isEditing && (
                        <IconButton
                            onClick={() => dispatch(editAction(actionParam))}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                    {isEditing && (
                        <IconButton
                            disabled={!canBeSaved}
                            onClick={() =>
                                dispatch(saveAction(form, actionParam))
                            }
                        >
                            {isSaving ? <HourglassEmptyIcon /> : <SaveIcon />}
                        </IconButton>
                    )}
                    {isEditing && (
                        <IconButton
                            onClick={() =>
                                dispatch(cancelEditAction(actionParam))
                            }
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </div>
            </div>
        )
    );
}
