const Company = require('../models/Company');

const searchCompanies = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.json({ data: [] });
        }

        // Case-insensitive regex search across symbol and name
        // Limit to 10 results for autocomplete performance
        const companies = await Company.find({
            $or: [
                { symbol: { $regex: new RegExp(`^${query}`, 'i') } },
                { name: { $regex: new RegExp(query, 'i') } }
            ],
            isActive: true
        })
        .select('symbol name exchange')
        .limit(10)
        .lean();

        // Sort exact matches on symbol first, then name matches
        companies.sort((a, b) => {
            const queryUpper = query.toUpperCase();
            if (a.symbol.toUpperCase() === queryUpper) return -1;
            if (b.symbol.toUpperCase() === queryUpper) return 1;
            
            if (a.symbol.toUpperCase().startsWith(queryUpper) && !b.symbol.toUpperCase().startsWith(queryUpper)) return -1;
            if (b.symbol.toUpperCase().startsWith(queryUpper) && !a.symbol.toUpperCase().startsWith(queryUpper)) return 1;

            return 0;
        });

        res.json({ data: companies });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    searchCompanies
};
