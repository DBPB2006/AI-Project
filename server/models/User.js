const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const HoldingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    uppercase: true,
    trim: true
  },
  company: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.0001, 'Quantity must be positive']
  },
  averageBuyPrice: {
    type: Number,
    required: [true, 'Average buy price is required'],
    min: [0, 'Average buy price cannot be negative']
  },
  sector: {
    type: String,
    default: 'General'
  },
  exchange: {
    type: String,
    default: 'US'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

const PortfolioSchema = new mongoose.Schema({
  consent: {
    type: Boolean,
    default: false
  },
  cashAvailable: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyInvestment: {
    type: Number,
    default: 0,
    min: 0
  },
  holdings: [HoldingSchema]
});

const PreferencesSchema = new mongoose.Schema({
  riskTolerance: {
    type: String,
    enum: ['Conservative', 'Moderate', 'Aggressive'],
    default: 'Moderate'
  },
  investmentGoal: {
    type: String,
    default: 'Long-term Wealth Growth'
  },
  investmentHorizon: {
    type: String,
    default: '5+ Years'
  },
  preferredSectors: {
    type: [String],
    default: ['Technology', 'Healthcare']
  },
  avoidedSectors: {
    type: [String],
    default: []
  }
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Ensure password is never returned in default queries
    },
    preferences: {
      type: PreferencesSchema,
      default: () => ({})
    },
    portfolio: {
      type: PortfolioSchema,
      default: () => ({ consent: false, cashAvailable: 0, monthlyInvestment: 0, holdings: [] })
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
