const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    symbol: {
      type: String,
      required: [true, 'Ticker symbol is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    exchange: {
      type: String,
      required: [true, 'Exchange is required (e.g., NASDAQ, NYSE)'],
      uppercase: true,
      trim: true,
      index: true,
    },
    exchangeShortName: {
      type: String,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'US', // Default country setting to US for localization
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: 'USD',
    },
    sector: {
      type: String,
      trim: true,
      index: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please enter a valid website URL',
      ],
    },
    logo: {
      type: String, // URL pointing to the company's logo graphic
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    cik: {
      type: String, // SEC Central Index Key identifier for EDGAR filings integration
      trim: true,
    },
  },
  {
    timestamps: true, // Enable automatic tracking of document creation and modification times
  }
);

// Create a compound index on name and symbol fields to optimize autocomplete and search queries
companySchema.index({ name: 1, symbol: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
