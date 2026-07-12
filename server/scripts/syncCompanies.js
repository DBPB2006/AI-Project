const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

// Load environment variables from the server root .env file safely
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Company = require('../models/Company');

const MONGODB_URI = process.env.MONGODB_URI;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const API_URL = 'https://finnhub.io/api/v1/stock/symbol?exchange=US';


// Query the Finnhub stock symbol endpoint for the entire US exchange list
async function fetchCompaniesFromAPI() {
  console.log(`Fetching companies from Finnhub...`);
  const response = await axios.get(`${API_URL}&token=${FINNHUB_API_KEY}`);
  return response.data;
}


// Standardize the raw Finnhub objects into Mongoose Company update schema format
function prepareDatabaseOperations(rawCompanies) {
  const operations = [];
  let skipped = 0;

  for (const company of rawCompanies) {
    // Map Finnhub ticker fields to local company model attributes
    const symbol = company.symbol || company.displaySymbol;
    const name = company.description;

    // Skip records that do not contain valid identifier symbols and names
    if (!symbol || !name) {
      skipped++;
      continue;
    }

    // Structure the target company record object fields
    const updateData = {
      name: name,
      symbol: symbol,
      exchange: company.mic || 'US',
      type: company.type || '',
      currency: company.currency || 'USD',
      country: 'US',
      isActive: true,
    };

    // Queue the bulk write update operation for the company symbol
    operations.push({
      updateOne: {
        filter: { symbol: symbol },
        update: { $set: updateData },
        // Ensure existing records are updated and new records are inserted automatically
        upsert: true,
      },
    });
  }

  console.log(`Prepared ${operations.length} valid companies. Skipped ${skipped} invalid ones.`);
  return operations;
}


// Fetch all companies from the API, format them, and write them in bulk to MongoDB
async function runSync() {
  console.log('\n--- Starting Company Sync ---');
  const startTime = Date.now();
  const isResetMode = process.argv.includes('--reset');

  if (!FINNHUB_API_KEY) {
    console.error('Error: FINNHUB_API_KEY is missing in your .env file.');
    return;
  }

  try {
    // Connect to the target MongoDB instance
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // Clear existing company collections when the --reset flag is specified
    if (isResetMode) {
      console.log('Reset mode detected. Clearing old companies...');
      await Company.deleteMany({});
    }

    // Fetch raw US market company metadata from Finnhub
    const rawCompanies = await fetchCompaniesFromAPI();

    // Prepare database operations by normalising the API response
    const dbOperations = prepareDatabaseOperations(rawCompanies);

    if (dbOperations.length === 0) {
      console.log('No companies found to save. Exiting.');
      return;
    }

    // Execute bulk write operations to insert or update company profiles
    console.log('Saving companies to the database... This may take a few seconds.');
    const result = await Company.bulkWrite(dbOperations, { ordered: false });

    // Output statistics about the synchronisation run
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n--- Sync Complete ---');
    console.log(`Total fetched:   ${rawCompanies.length}`);
    console.log(`Inserted new:    ${result.upsertedCount || 0}`);
    console.log(`Updated old:     ${result.modifiedCount || 0}`);
    console.log(`Execution time:  ${duration} seconds`);
    console.log('---------------------\n');

  } catch (error) {
    console.error('\nSync failed with error:', error.message);
  } finally {
    // Disconnect from the database engine
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB.');
    }
  }
}

// Start the script
runSync();
