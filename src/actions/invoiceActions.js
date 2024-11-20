// actions/invoiceActions.js

// Action to set all invoices
export const setInvoices = (invoices) => {
  return {
    type: 'SET_INVOICES',
    payload: invoices,
  };
};

// Action to add a new invoice
export const addInvoice = (invoice) => {
  return {
    type: 'ADD_INVOICE',
    payload: invoice,
  };
};

// Action to update an existing invoice
export const updateInvoice = (invoice) => {
  return {
    type: 'UPDATE_INVOICE',
    payload: invoice,
  };
};

// Action to delete an invoice
export const deleteInvoice = (serialNumber) => {
  return {
    type: 'DELETE_INVOICE',
    payload: serialNumber,
  };
};
