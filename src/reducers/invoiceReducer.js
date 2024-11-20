// reducers/invoiceReducer.js

const initialState = {
  invoices: [],
};

const invoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_INVOICES':
      return {
        ...state,
        invoices: action.payload,
      };
    case 'ADD_INVOICE':
      return {
        ...state,
        invoices: [...state.invoices, action.payload],
      };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map((invoice) =>
          invoice.serialNumber === action.payload.serialNumber
            ? { ...invoice, ...action.payload }
            : invoice
        ),
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter((invoice) => invoice.serialNumber !== action.payload),
      };
    default:
      return state;
  }
};

export default invoiceReducer;
