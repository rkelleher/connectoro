import React from "react";
import { Options } from "app/components/Options";

function getSelectionCriteriaArrayChoices(key) {
    if (key === "conditionIn") {
        return ["New"];
    } else {
        return [];
    }
}

export default ({
    id,
    data,
    isSaving,
    saveAction,
    saveActionParam,
    saveActionParam2,
    isInline,
    smCol
}) => {
    const selectionCriteria = data.selectionCriteria;
    return (
        <div>
            {selectionCriteria && (
                <>
                    <h4>Selection Criteria</h4>
                    <div>
                        <Options
                            id={id}
                            isInline={isInline}
                            data={selectionCriteria}
                            saveAction={saveAction}
                            saveActionParam={saveActionParam}
                            saveActionParam2={saveActionParam2}
                            isSaving={isSaving}
                            getArrayChoices={getSelectionCriteriaArrayChoices}
                            smCol={smCol}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
