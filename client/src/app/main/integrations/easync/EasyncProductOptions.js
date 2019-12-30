import React from "react";
import { Options } from "app/components/Options";

function getSelectionCriteriaArrayChoices(key) {
    if (key === "conditionIn") {
        return ["New"];
    } else {
        return [];
    }
}

export default ({ data, isSaving, saveAction, saveActionParam, saveActionParam2 }) => {
    const selectionCriteria = data.selectionCriteria;
    return (
        <div>
            {selectionCriteria && (
                <>
                    <h4>Selection Criteria</h4>
                    <div>
                        <Options
                            data={selectionCriteria}
                            saveAction={saveAction}
                            saveActionParam={saveActionParam}
                            saveActionParam2={saveActionParam2}
                            isSaving={isSaving}
                            getArrayChoices={getSelectionCriteriaArrayChoices}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
