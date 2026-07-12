const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Define and apply CORS policy and JSON body parsing middlewares
const corsOptions = {
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());

const mongoose = require('mongoose');

// Import and mount individual API route modules for analysis, company info, authentication, portfolio, and history
const analyzeRoutes = require("./routes/analyzeRoutes");
const companyRoutes = require("./routes/companyRoutes");
const authRoutes = require("./routes/authRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const historyRoutes = require("./routes/historyRoutes");


app.use("/api/analyze", analyzeRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/history", historyRoutes);

// Set up a root health check endpoint to verify server status
app.get("/", (req, res) => {
    res.json({
        status: "Server Running"
    });
});

// Configure and establish MongoDB connection using Mongoose
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/research_engine_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize and start the Express server on the specified port
const PORT = process.env.PORT || 3300;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});