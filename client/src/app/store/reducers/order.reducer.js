import * as Actions from "../actions";

const initialState = {
    isFetching: false,
    activeOrder: null,
    easyncOptionsSaving: false,
    savingOrderCustomer: false,
    isAddingProduct: false,
    editingOrderProductQtys: {},
    savingOrderProductQtys: {},
    removingOrderProducts: {},
    savingOrderProductsEasync: {}
};

const orderReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_ORDER: {
            return {
                ...state,
                isFetching: true
            };
        }
        case Actions.GOT_ORDER: {
            return {
                ...state,
                isFetching: false,
                activeOrder: action.payload
            };
        }
        case Actions.SET_ORDER: {
            return {
                ...state,
                activeOrder: action.payload
            };
        }
        case Actions.SAVING_ORDER_EASYNC_OPTS: {
            return {
                ...state,
                easyncOptionsSaving: true
            }
        }
        case Actions.SAVED_ORDER_EASYNC_OPTS: {
            return {
                ...state,
                easyncOptionsSaving: false
            }
        }
        case Actions.SAVING_ORDER: {
            return {
                ...state,
                savingOrderCustomer: true
            }
        }
        case Actions.SAVED_ORDER: {
            return {
                ...state,
                savingOrderCustomer: false
            }
        }
        case Actions.ADDING_ORDER_PRODUCT: {
            return {
                ...state,
                isAddingProduct: true
            }
        }
        case Actions.ADDED_ORDER_PRODUCT: {
            return {
                ...state,
                isAddingProduct: false
            }
        }
        case Actions.REMOVING_ORDER_PRODUCT: {
            return {
                ...state,
                removingOrderProducts: {
                    ...state.removingOrderProducts,
                    [action.payload]: true
                }
            }
        }
        case Actions.REMOVED_ORDER_PRODUCT: {
            return {
                ...state,
                removingOrderProducts: {
                    ...state.removingOrderProducts,
                    [action.payload]: false
                }
            }
        }
        case Actions.SAVING_ORDER_PRODUCT_EASYNC: {
            return {
                ...state,
                savingOrderProductsEasync: {
                    ...state.savingOrderProducts,
                    [action.payload]: true
                }
            }
        }
        case Actions.SAVED_ORDER_PRODUCT_EASYNC: {
            return {
                ...state,
                savingOrderProductsEasync: {
                    ...state.savingOrderProducts,
                    [action.payload]: false
                }
            }
        }
        case Actions.EDIT_ORDER_PRODUCT_QTY: {
            return {
                ...state,
                editingOrderProductQtys: {
                    ...state.editingOrderProductQtys,
                    [action.payload]: true
                }
            }
        }
        case Actions.STOP_EDIT_ORDER_PRODUCT_QTY: {
            return {
                ...state,
                editingOrderProductQtys: {
                    ...state.editingOrderProductQtys,
                    [action.payload]: false
                }
            }
        }
        case Actions.SAVING_ORDER_PRODUCT_QTY: {
            return {
                ...state,
                savingOrderProductQtys: {
                    ...state.editingOrderProductQtys,
                    [action.payload]: true
                }
            }
        }
        case Actions.SAVED_ORDER_PRODUCT_QTY: {
            return {
                ...state,
                savingOrderProductQtys: {
                    ...state.editingOrderProductQtys,
                    [action.payload]: false
                },
                editingOrderProductQtys: {
                    ...state.editingOrderProductQtys,
                    [action.payload]: false
                }
            }
        }
        default: {
            return state;
        }
    }
};

export default orderReducer;
