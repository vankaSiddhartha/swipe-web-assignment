"use client"
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Edit, Trash2 } from 'lucide-react';
import { 
  setInvoices, 
  addInvoice, 
  updateInvoice, 
  deleteInvoice 
} from '../actions/invoiceActions';

const CustomerPage = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoice.invoices || []);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Group invoices by customer name and calculate total purchases
  const customerData = invoices.reduce((acc, invoice) => {
    const customerName = invoice.customerName || 'Unknown';
    let existingCustomer = acc.find(c => c.customerName === customerName);
    
    if (existingCustomer) {
      existingCustomer.totalPurchase += parseFloat(invoice.totalAmount || 0);
      existingCustomer.invoiceCount += 1;
    } else {
      existingCustomer = {
        customerName: customerName,
        phoneNumber: invoice.phoneNumber || '',
        totalPurchase: parseFloat(invoice.totalAmount || 0),
        invoiceCount: 1,
        originalInvoices: invoices.filter(inv => inv.customerName === customerName)
      };
      acc.push(existingCustomer);
    }
    
    return acc;
  }, []);

  const handleEdit = (customer) => {
    setEditingCustomer({
      ...customer,
      originalName: customer.customerName
    });
  };

  const handleSave = () => {
    if (editingCustomer) {
      // Update all invoices with the new customer details
      const updatedInvoices = invoices.map(invoice => 
        invoice.customerName === editingCustomer.originalName 
          ? {
              ...invoice, 
              customerName: editingCustomer.customerName,
              phoneNumber: editingCustomer.phoneNumber
            }
          : invoice
      );

      // Dispatch update invoices action
      dispatch(setInvoices(updatedInvoices));
      setEditingCustomer(null);
    }
  };

  const handleDelete = (customerName) => {
    // Remove all invoices for this customer
    const remainingInvoices = invoices.filter(
      invoice => invoice.customerName !== customerName
    );

    // Dispatch action to update invoices
    dispatch(setInvoices(remainingInvoices));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoices
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Purchase Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customerData.map((customer, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingCustomer?.originalName === customer.customerName ? (
                    <input
                      type="text"
                      value={editingCustomer.customerName}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer, 
                        customerName: e.target.value
                      })}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    customer.customerName || 'Unknown'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingCustomer?.originalName === customer.customerName ? (
                    <input
                      type="text"
                      value={editingCustomer.phoneNumber}
                      onChange={(e) => setEditingCustomer({
                        ...editingCustomer, 
                        phoneNumber: e.target.value
                      })}
                      className="w-full border rounded px-2 py-1"
                    />
                  ) : (
                    customer.phoneNumber || 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.invoiceCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${customer.totalPurchase.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                  {editingCustomer?.originalName === customer.customerName ? (
                    <button 
                      onClick={handleSave} 
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEdit(customer)} 
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.customerName)} 
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customerData.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPage;