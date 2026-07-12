const Company = require('../models/Company');

const searchCompanies = async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.json({ data: [] });
        }

        // Perform a case-insensitive regex query against symbol or name, matching active companies only. Limit response to 10 items for query performance.
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

        // Sort results prioritizing exact symbol matches, followed by symbol prefix matches
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
        // Return a 500 error if the database query fails
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    searchCompanies
};
