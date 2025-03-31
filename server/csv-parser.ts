import fs from 'fs';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { InsertTransaction } from '@shared/schema';

interface CSVTransactionRow {
  description: string;
  amount: string;
  type: string;
  date: string;
  notes?: string;
  category?: string;
}

/**
 * Parse a CSV file from a file path
 * @param filePath - Path to the CSV file
 * @returns Promise that resolves to an array of transactions
 */
export function parseCSVFile(filePath: string): Promise<Partial<InsertTransaction>[]> {
  return new Promise((resolve, reject) => {
    const results: Partial<InsertTransaction>[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data: CSVTransactionRow) => {
        const transaction = mapCSVRowToTransaction(data);
        if (transaction) {
          results.push(transaction);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Parse a CSV file from a buffer
 * @param buffer - Buffer containing CSV data
 * @returns Promise that resolves to an array of transactions
 */
export function parseCSVBuffer(buffer: Buffer): Promise<Partial<InsertTransaction>[]> {
  return new Promise((resolve, reject) => {
    const results: Partial<InsertTransaction>[] = [];
    
    // Create a readable stream from the buffer
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csvParser())
      .on('data', (data: CSVTransactionRow) => {
        const transaction = mapCSVRowToTransaction(data);
        if (transaction) {
          results.push(transaction);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Maps a CSV row to a transaction object
 * @param row - CSV row data
 * @returns Transaction object or null if invalid
 */
function mapCSVRowToTransaction(row: CSVTransactionRow): Partial<InsertTransaction> | null {
  try {
    // Validate required fields
    if (!row.description || !row.amount || !row.type || !row.date) {
      console.warn('Skipping row with missing required fields:', row);
      return null;
    }
    
    // Parse amount as a number
    const amount = parseFloat(row.amount);
    if (isNaN(amount)) {
      console.warn('Skipping row with invalid amount:', row);
      return null;
    }
    
    // Validate transaction type
    const type = row.type.toLowerCase();
    if (type !== 'income' && type !== 'expense') {
      console.warn('Skipping row with invalid type (must be "income" or "expense"):', row);
      return null;
    }
    
    // Create date object
    let date: Date;
    try {
      date = new Date(row.date);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      console.warn('Skipping row with invalid date:', row);
      return null;
    }
    
    // Return the validated transaction
    return {
      description: row.description,
      amount,
      type: type as 'income' | 'expense',
      date,
      notes: row.notes || undefined,
      // Category will be handled separately since we need to look it up by name
    };
  } catch (error) {
    console.error('Error mapping CSV row to transaction:', error);
    return null;
  }
}