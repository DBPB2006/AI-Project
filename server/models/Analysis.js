const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    company: {
      type: String,
      required: true
    },
    recommendation: {
      type: String,
      default: 'HOLD'
    },
    confidence: {
      type: String,
      default: 'N/A'
    },
    reportData: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Analysis', AnalysisSchema);
