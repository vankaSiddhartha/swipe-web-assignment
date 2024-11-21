import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { setInvoices, addInvoice, updateInvoice, deleteInvoice } from '../actions/invoiceActions';

const CHUNK_SIZE = 5;
const MAX_RETRIES = 3;
const apiKey = import.meta.env.VITE_LLM_API_KEY;

console.log(apiKey)
const genAI = new GoogleGenerativeAI(apiKey);
var fileTYPE = "";
var loadText = ""
const LoadingProgress = ({ progress, text }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-4 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">
          { 'Processing...'}
        </p>
    
      </div>
    </div>
  );
};

class InvoiceProcessor {
    
  constructor() {
    console.log("Initializing InvoiceProcessor with Gemini models");
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    this.textModel = genAI.getGenerativeModel({ model: "gemini-1.5" });
  }

  async processFiles(files, onProgress) {
    console.log(`Starting to process ${files.length} files in chunks of ${CHUNK_SIZE}`);
    loadText = "Starting.."
    const results = [];
    const chunks = this.chunkArray(files, CHUNK_SIZE);
    let processedFiles = 0;

    for (const chunk of chunks) {
      console.log(`Processing chunk of ${chunk.length} files`);
      loadText = "Processing chunk"
      const chunkPromises = chunk.map(file => this.processFileWithRetry(file));
      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults.forEach((result, index) => {
        processedFiles++;
        const progress = (processedFiles / files.length) * 100;
        console.log(`Progress: ${progress.toFixed(2)}%`);
  
        onProgress(progress);

        if (result.status === 'fulfilled') {
          console.log(`Successfully processed ${chunk[index].name}`);
          loadText = "Successfully processed "
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
    loadText = "Finished processing all files"
    return results;
  }

  async processFileWithRetry(file, retryCount = 0) {
    try {

      const fileType = this.getFileType(file);
      fileTYPE = fileType
      console.log(`Processing ${file.name} as ${fileType}, attempt ${retryCount + 1}`);
      loadText = `Processing ${file.name} as ${fileType}, attempt ${retryCount + 1}`
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
    loadText  = "`Determining file type for ${file.name}: ${extension}`"
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
    loadText = "`Extracting data from ${fileType} file: ${file.name}`"
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
    loadText = `Processing Excel file: ${file.name}`
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const filteredData = [];

    for (const row of jsonData) {
        const serialNumber = row.serialNumber || row["Serial Number"] || null;
        if (!serialNumber || serialNumber === "Totals") {
            break; // Skip rows without a serial number or totals row
        }

        // Map product details into the products array
        const products = [
            {
                name: row.products || row["Product Name"] || "",
                quantity: row["Qty"] || 1,
       
            }
        ];

        // Map the rest of the row data
        filteredData.push({
            serialNumber: serialNumber,
            customerName: row.customerName || row["Party Company Name"] || "Unknown",
            products: products,
            taxAmount: row.taxAmount || row["Tax Amount"] || row["Tax (%)"]|| "Unknown",
            totalAmount: row.totalAmount || row["Item Total Amount"] ||row["Net Amount"]|| row["Price with Tax"] ||"Unknown",
            date: row.date || row["Invoice Date"] || row["Date"]|| "Unknown",
            phoneNumber:row.phoneNumber||row["Phone Number"]||"Unknow"
        });
    }

    console.log("Filtered Excel data:", filteredData);
    return filteredData; // Return only filtered rows
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
      -Phone Number

      Provide JSON output in the format:
      {
        "serialNumber": "",
        "customerName": "",
        "products": [{"name": "", "quantity": 0}],
        "taxAmount": 0,
        "totalAmount": 0,
        "date": "",
        "phoneNumber:"",
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
        "date": "",
        phoneNumber:"",
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
      -Phone Number
      
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
  const [completed, setCompleted] = useState(false);
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
    console.log("Starting to process files:", files.map((f) => f.name));

    setProcessing(true);
    setProgress(0);
    setError(null);
    setResults([]);
    setCompleted(false);

    try {
      const processor = new InvoiceProcessor();
      console.log("Created InvoiceProcessor instance");

      const processedResults = await processor.processFiles(files, handleProgress);
      console.log("Processed results:", processedResults);

      setResults(processedResults);

      // Filter successful results and handle them based on file type
      const successfulResults = processedResults.filter(
        (result) => result.status === "success"
      );

      successfulResults.forEach((result) => {
        if (fileTYPE === "excel") {
          // Excel-specific handling: extract and dispatch filtered rows
          if (Array.isArray(result.data)) {
            result.data.forEach((row) => {
              console.log(row);
              dispatch(addInvoice(row)); // Dispatch filtered rows for Excel
            });
          } else {
            console.error("Expected array of rows but got:", result.data);
          }
        } else {
          // Handle other file types (e.g., JSON, text)
          dispatch(addInvoice(result.data)); // Dispatch the entire data for non-Excel files
        }
      });

      console.log("Successfully dispatched all files to Redux store");
      setCompleted(true);

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
          <LoadingProgress 
            progress={progress} 
            text={"loading..."}
          />
        )}

        {completed && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Extraction completed successfully!</p>
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default InvoiceExtractor;