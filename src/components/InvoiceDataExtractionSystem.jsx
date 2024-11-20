import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { setInvoices, addInvoice, updateInvoice, deleteInvoice } from '../actions/invoiceActions';

const CHUNK_SIZE = 5;
const MAX_RETRIES = 3;
const genAI = new GoogleGenerativeAI('AIzaSyBDNSRlJ1MnWr1k5L_ClBiSJsoaLXxkrU0');

class InvoiceProcessor {
    
  constructor() {
    console.log("Initializing InvoiceProcessor with Gemini models");
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.textModel = genAI.getGenerativeModel({ model: "gemini-1.5" });
  }

  async processFiles(files, onProgress) {
    console.log(`Starting to process ${files.length} files in chunks of ${CHUNK_SIZE}`);
    const results = [];
    const chunks = this.chunkArray(files, CHUNK_SIZE);
    let processedFiles = 0;

    for (const chunk of chunks) {
      console.log(`Processing chunk of ${chunk.length} files`);
      const chunkPromises = chunk.map(file => this.processFileWithRetry(file));
      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults.forEach((result, index) => {
        processedFiles++;
        const progress = (processedFiles / files.length) * 100;
        console.log(`Progress: ${progress.toFixed(2)}%`);
        onProgress(progress);

        if (result.status === 'fulfilled') {
          console.log(`Successfully processed ${chunk[index].name}`);
          results.push({
            fileName: chunk[index].name,
            data: result.value,
            status: 'success'
          });
        } else {
          console.error(`Failed to process ${chunk[index].name}:`, result.reason);
          results.push({
            fileName: chunk[index].name,
            error: result.reason.message,
            status: 'error'
          });
        }
      });
    }

    console.log("Finished processing all files", results);
    return results;
  }

  async processFileWithRetry(file, retryCount = 0) {
    try {
      const fileType = this.getFileType(file);
      console.log(`Processing ${file.name} as ${fileType}, attempt ${retryCount + 1}`);
      return await this.extractData(file, fileType);
    } catch (error) {
      console.error(`Error processing ${file.name}, attempt ${retryCount + 1}:`, error);
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying ${file.name} in ${(retryCount + 1)}s...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.processFileWithRetry(file, retryCount + 1);
      }
      throw error;
    }
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  getFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    console.log(`Determining file type for ${file.name}: ${extension}`);
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  async extractData(file, fileType) {
    console.log(`Extracting data from ${fileType} file: ${file.name}`);
    switch (fileType) {
      case 'excel':
        return await this.processExcel(file);
      case 'pdf':
        return await this.processPDF(file);
      case 'image':
        return await this.processImage(file);
      default:
        throw new Error('Unsupported file type');
    }
  }

  async processExcel(file) {
    console.log(`Processing Excel file: ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log("Excel data converted to JSON:", jsonData);

    return await this.extractInvoiceData(JSON.stringify(jsonData));
  }

  async processPDF(file) {
    console.log(`Processing PDF file: ${file.name}`);
    const base64PDF = await this.fileToBase64(file);

    const prompt = `
      Extract the following information from this PDF file and return it as JSON:
      - Serial Number/Invoice Number
      - Customer Name
      - Product Name
      - Quantity
      - Tax Amount
      - Total Amount
      - Date

      Provide JSON output in the format:
      {
        "serialNumber": "",
        "customerName": "",
        "products": [{"name": "", "quantity": 0}],
        "taxAmount": 0,
        "totalAmount": 0,
        "date": ""
      }
    `;

    console.log("Sending PDF to Gemini for processing");
    const result = await this.model.generateContent([
      { inlineData: { data: base64PDF, mimeType: file.type } },
      prompt
    ]);

    const response = await result.response;
    console.log("Received response from Gemini for PDF");
    return this.parseResponse(response.text());
  }

  async processImage(file) {
    console.log(`Processing image file: ${file.name}`);
    const base64Image = await this.fileToBase64(file);

    const prompt = `
      Extract invoice data from this image and return it in JSON format:
      {
        "serialNumber": "",
        "customerName": "",
        "products": [{"name": "", "quantity": 0}],
        "taxAmount": 0,
        "totalAmount": 0,
        "date": ""
      }
    `;

    console.log("Sending image to Gemini for processing");
    const result = await this.model.generateContent([
      { inlineData: { data: base64Image, mimeType: file.type } },
      prompt
    ]);

    const response = await result.response;
    console.log("Received response from Gemini for image");
    return this.parseResponse(response.text());
  }

  async extractInvoiceData(content) {
    console.log("Extracting invoice data from content");
    const prompt = `
      Extract the following information from this invoice content and return it in JSON format:
      - Serial Number/Invoice Number
      - Customer Name
      - Product Name
      - Quantity
      - Tax Amount
      - Total Amount
      - Date
      
      Content: ${content}
    `;

    const result = await this.textModel.generateContent(prompt);
    const response = await result.response;
    const clean = response.text().replace(/\*/g, '').replace(/```json/g, '').trim();
    console.log("Cleaned response:", clean);
    return this.parseResponse(clean);
  }

  parseResponse(text) {
    console.log("Parsing response text:", text);
    try {
      const cleanedText = text
        .replace(/\*/g, '')
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      console.log("Cleaned text:", cleanedText);

      const parsedData = JSON.parse(cleanedText);
      console.log("Successfully parsed data:", parsedData);
      return parsedData;
    } catch (error) {
      console.error("Error parsing response:", error);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON match in text:", jsonMatch[0]);
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse response');
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

const InvoiceExtractor = () => {
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const invoices = useSelector(state => state.invoices);

  const handleProgress = (progressValue) => {
    setProgress(progressValue);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", files.map(f => f.name));
    await processFiles(files);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    console.log("Files selected:", files.map(f => f.name));
    await processFiles(files);
  };

 const processFiles = async (files) => {
    if (files.length === 0) return;
    console.log("Starting to process files:", files.map(f => f.name));

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const processor = new InvoiceProcessor();
      console.log("Created InvoiceProcessor instance");
      
      const processedResults = await processor.processFiles(files, handleProgress);
      console.log("Processed results:", processedResults);
      
      setResults(processedResults);
      
      // Filter successful results and add them to Redux one by one
      const successfulResults = processedResults.filter(result => result.status === 'success');
      console.log("Successful results to dispatch:", successfulResults);
      
      // Instead of using setInvoices, use addInvoice for each new invoice
      successfulResults.forEach(result => {
        dispatch(addInvoice(result.data));
      });
      
      console.log("Successfully dispatched to Redux store");
      
    } catch (error) {
      console.error("Error processing files:", error);
      setError(error.message);
    } finally {
      setProcessing(false);
      console.log("Finished processing files");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Invoice Data Extractor
      </h1>

      <div className="space-y-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-1 text-sm text-gray-600">
              Drag and drop files here, or click to select files
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Excel, PDF, or Image files
            </p>
          </div>
        </div>

        {processing && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Processing files... {Math.round(progress)}%
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Results</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {result.fileName}
                  </h4>
                  {result.status === 'success' ? (
                    <div className="mt-2 space-y-2">
                      <p>Invoice Number: {result.data.serialNumber}</p>
                      <p>Customer: {result.data.customerName}</p>
                      <p>Date: {result.data.date}</p>
                      <p>Total Amount: ${result.data.totalAmount}</p>
                      <div>
                        <p className="font-medium">Products:</p>
                        <ul className="list-disc list-inside">
                          {result.data.products.map((product, idx) => (
                            <li key={idx}>
                              {product.name} (Qty: {product.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-500 mt-2">Error: {result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceExtractor;