"use client"
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Upload, Home, FileText, Package, Users } from 'lucide-react';
import InvoiceExtractor from './InvoiceDataExtractionSystem';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const navItems = [
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/customers', label: 'Customers', icon: Users },
  ];

  return (
    <header className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <Home className="w-8 h-8 text-white group-hover:text-gray-300 transition-colors duration-200" />
              <div>
                <span className="text-3xl font-extrabold text-white group-hover:text-gray-300 transition-colors duration-200">
                  Swipe
                </span>
                <span className="block text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  Invoice Manager
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 text-base font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-full shadow-sm text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Invoice
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } transition-all duration-200`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full mt-4 px-4 py-2 flex items-center justify-center text-sm font-medium text-black bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Invoice
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto" 
          aria-labelledby="modal-title" 
          role="dialog" 
          aria-modal="true"
        >
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              {/* Header */}
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900" id="modal-title">
                      Upload Invoice
                    </h3>
                    <div className="mt-4">
                      <InvoiceExtractor onSuccess={handleCloseModal} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;