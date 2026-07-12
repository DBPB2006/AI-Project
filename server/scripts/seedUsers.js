const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/research_engine_db';

const mockUsers = [
  {
    name: 'John Aggressive',
    email: 'john.aggressive@example.com',
    password: 'password123',
    preferences: {
      riskTolerance: 'Aggressive',
      investmentGoal: 'Capital Appreciation & Tech Sector Growth',
      investmentHorizon: '5+ Years',
      preferredSectors: ['Technology', 'Consumer Cyclical'],
      avoidedSectors: ['Utilities', 'Energy']
    },
    portfolio: {
      consent: true,
      cashAvailable: 25000,
      monthlyInvestment: 1500,
      holdings: [
        {
          symbol: 'AAPL',
          company: 'Apple Inc.',
          quantity: 50,
          averageBuyPrice: 175.50,
          sector: 'Technology',
          exchange: 'NASDAQ',
          purchaseDate: new Date('2025-01-15')
        },
        {
          symbol: 'TSLA',
          company: 'Tesla, Inc.',
          quantity: 30,
          averageBuyPrice: 185.00,
          sector: 'Consumer Cyclical',
          exchange: 'NASDAQ',
          purchaseDate: new Date('2025-03-10')
        },
        {
          symbol: 'NVDA',
          company: 'NVIDIA Corporation',
          quantity: 40,
          averageBuyPrice: 850.00,
          sector: 'Technology',
          exchange: 'NASDAQ',
          purchaseDate: new Date('2025-05-20')
        }
      ]
    }
  },
  {
    name: 'Jane Conservative',
    email: 'jane.conservative@example.com',
    password: 'password123',
    preferences: {
      riskTolerance: 'Conservative',
      investmentGoal: 'Capital Preservation & Dividend Income',
      investmentHorizon: '1-3 Years',
      preferredSectors: ['Healthcare', 'Consumer Defensive', 'Utilities'],
      avoidedSectors: ['Technology']
    },
    portfolio: {
      consent: true,
      cashAvailable: 50000,
      monthlyInvestment: 500,
      holdings: [
        {
          symbol: 'JNJ',
          company: 'Johnson & Johnson',
          quantity: 100,
          averageBuyPrice: 155.20,
          sector: 'Healthcare',
          exchange: 'NYSE',
          purchaseDate: new Date('2024-06-12')
        },
        {
          symbol: 'PG',
          company: 'The Procter & Gamble Company',
          quantity: 80,
          averageBuyPrice: 160.00,
          sector: 'Consumer Defensive',
          exchange: 'NYSE',
          purchaseDate: new Date('2024-08-25')
        }
      ]
    }
  },
  {
    name: 'Alex Moderate',
    email: 'alex.moderate@example.com',
    password: 'password123',
    preferences: {
      riskTolerance: 'Moderate',
      investmentGoal: 'Balanced Growth & Value',
      investmentHorizon: '3-5 Years',
      preferredSectors: ['Technology', 'Financial', 'Healthcare'],
      avoidedSectors: []
    },
    portfolio: {
      consent: true,
      cashAvailable: 15000,
      monthlyInvestment: 800,
      holdings: [
        {
          symbol: 'MSFT',
          company: 'Microsoft Corporation',
          quantity: 25,
          averageBuyPrice: 405.00,
          sector: 'Technology',
          exchange: 'NASDAQ',
          purchaseDate: new Date('2025-02-18')
        },
        {
          symbol: 'JPM',
          company: 'JPMorgan Chase & Co.',
          quantity: 35,
          averageBuyPrice: 190.50,
          sector: 'Financial',
          exchange: 'NYSE',
          purchaseDate: new Date('2024-11-05')
        }
      ]
    }
  }
];

async function seedDB() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Remove existing seed users
    const emailsToClear = mockUsers.map(u => u.email);
    console.log('Clearing existing mock users...');
    await User.deleteMany({ email: { $in: emailsToClear } });

    // Seed new users
    console.log('Seeding mock users...');
    for (const userData of mockUsers) {
      // Create user using document instantiating so pre-save hook runs for hashing password
      const user = new User(userData);
      await user.save();
      console.log(`Seeded user: ${user.name} (${user.email})`);
    }

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();
