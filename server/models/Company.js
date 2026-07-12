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
      default: 'US', // Assuming predominantly US market initially, can be overridden
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
      type: String, // URL to the logo image
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    cik: {
      type: String, // SEC Central Index Key, useful for EDGAR mapping
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound index for search optimizations
// Allows efficiently finding companies by name and symbol together if a combined search is used
companySchema.index({ name: 1, symbol: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
