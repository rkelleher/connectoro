import React from "react";

export default ({ data, options }) => {
    return (
        <div className="table-responsive">
            <table className="simple">
                <thead>
                    <tr>
                        {options.head.map(x => (
                            <th key={x}>{x}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr>
                            {row.map(node => {
                                return <th>{node.props ? <node /> : node}</th>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
