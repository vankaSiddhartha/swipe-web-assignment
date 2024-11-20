"use client"
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setInvoices, addInvoice, updateInvoice, deleteInvoice } from '../actions/invoiceActions';
import { Edit, Trash2 } from 'lucide-react';

const ProductDetails = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoice.invoices || []);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const handleEdit = (invoice) => {
    setEditingInvoice({...invoice});
  };

  const handleSave = () => {
    if (editingInvoice) {
      // Calculate tax if it's less than or equal to 100
      if (parseFloat(editingInvoice.taxAmount) <= 100) {
        const totalAmount = parseFloat(editingInvoice.totalAmount);
        const taxPercentage = parseFloat(editingInvoice.taxAmount);
        const calculatedTaxAmount = totalAmount * (taxPercentage / 100);
        editingInvoice.taxAmount = calculatedTaxAmount.toFixed(2);
      }
      
      dispatch(updateInvoice(editingInvoice));
      setEditingInvoice(null);
    }
  };

  const handleDelete = (serialNumber) => {
    dispatch(deleteInvoice(serialNumber));
  };

  const handleProductChange = (productIndex, field, value) => {
    const updatedProducts = [...editingInvoice.products];
    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      [field]: value
    };
    setEditingInvoice({
      ...editingInvoice,
      products: updatedProducts
    });
  };
    const calculateTax = (invoice) => {
    // If taxAmount is less than 100, calculate percentage of total amount
    if (invoice.taxAmount < 100) {
      return (invoice.taxAmount / invoice.totalAmount * 100).toFixed(2) + '%';
    }
    return `$${invoice.taxAmount}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice, index) => (
              <tr key={invoice.serialNumber || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingInvoice?.serialNumber === invoice.serialNumber ? (
                    <input
                      type="text"
                      value={editingInvoice.serialNumber}
                      onChange={(e) => setEditingInvoice({...editingInvoice, serialNumber: e.target.value})}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    invoice.serialNumber || 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingInvoice?.serialNumber === invoice.serialNumber ? (
                    <input
                      type="text"
                      value={editingInvoice.customerName}
                      onChange={(e) => setEditingInvoice({...editingInvoice, customerName: e.target.value})}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    invoice.customerName || 'Unknown'
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="space-y-1">
                    {(editingInvoice?.serialNumber === invoice.serialNumber 
                      ? editingInvoice.products 
                      : invoice.products)?.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        {editingInvoice?.serialNumber === invoice.serialNumber ? (
                          <div className="flex items-center w-full">
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                              className="w-full border rounded px-2 py-1 mr-2"
                              placeholder="Product Name"
                            />
                            <input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(idx, 'quantity', e.target.value)}
                              className="w-20 border rounded px-2 py-1"
                              placeholder="Qty"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-between w-full">
                            <span>{product.name || 'Unknown Product'}</span>
                            <span className="text-gray-400">×{product.quantity || 0}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingInvoice?.serialNumber === invoice.serialNumber ? (
                    <input
                      type="text"
                      value={editingInvoice.taxAmount}
                      onChange={(e) => setEditingInvoice({...editingInvoice, taxAmount: e.target.value})}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Tax Amount or %"
                    />
                  ) : (
                    calculateTax(invoice) || 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingInvoice?.serialNumber === invoice.serialNumber ? (
                    <input
                      type="text"
                      value={editingInvoice.totalAmount}
                      onChange={(e) => setEditingInvoice({...editingInvoice, totalAmount: e.target.value})}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    invoice.totalAmount || 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingInvoice?.serialNumber === invoice.serialNumber ? (
                    <button 
                      onClick={handleSave} 
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleEdit(invoice)} 
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice.serialNumber)} 
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No invoices found
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;