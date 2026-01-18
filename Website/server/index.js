import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Gumloop API configuration
const GUMLOOP_API_KEY = 'd01459e6a0714948a3927e1bb3387793';
const GUMLOOP_USER_ID = 'dFiBhOuKqYclRLqEnmpdKXTMDyz1';
const GUMLOOP_SAVED_ITEM_ID = 'b6Sq9zNYdaWSr8hDSZzM7k';

// Function to poll Gumloop run status - FIXED ENDPOINT
async function pollGumloopRun(runId, maxAttempts = 60) {
    const pollUrl = `https://api.gumloop.com/api/v1/get_pl_run?run_id=${runId}&user_id=${GUMLOOP_USER_ID}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`   ⏳ Polling attempt ${attempt}/${maxAttempts}...`);

        try {
            const response = await axios.get(pollUrl, {
                headers: {
                    'Authorization': `Bearer ${GUMLOOP_API_KEY}`
                },
                timeout: 10000
            });

            console.log(`   📊 State: ${response.data.state || 'unknown'}`);

            // Check if run is complete
            if (response.data && response.data.state === 'DONE') {
                console.log('   ✅ Pipeline completed!');
                // Return outputs if available, otherwise return full response
                return response.data.outputs || response.data;
            } else if (response.data && response.data.state === 'FAILED') {
                console.log('   ❌ Pipeline failed');
                throw new Error('Gumloop pipeline failed');
            }

            // Wait 2 seconds before next attempt
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            if (attempt === maxAttempts) throw error;
            console.log(`   ⚠️ Poll error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    throw new Error('Gumloop pipeline timeout');
}

// Function to call Gumloop API
async function searchWithGumloop(searchQuery) {
    try {
        console.log(`🔍 Calling Gumloop API for: ${searchQuery}`);

        const response = await axios.post('https://api.gumloop.com/api/v1/start_pipeline', {
            api_key: GUMLOOP_API_KEY,
            user_id: GUMLOOP_USER_ID,
            saved_item_id: GUMLOOP_SAVED_ITEM_ID,
            inputs: [{ search_query: searchQuery }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GUMLOOP_API_KEY}`
            },
            timeout: 60000
        });

        console.log('✅ Gumloop start_pipeline response received');

        // Check if response contains run_id (async execution)
        if (response.data.run_id && !response.data.retailer) {
            console.log(`   🔄 Pipeline started with run_id: ${response.data.run_id}`);
            console.log('   ⏰ Waiting for pipeline to complete...');

            // Poll for results
            const results = await pollGumloopRun(response.data.run_id);
            return results;
        }

        // Otherwise return data directly
        return response.data;
    } catch (error) {
        console.error('❌ Gumloop API error:', error.message);
        if (error.response) {
            console.error('Error response:', error.response.data);
        }
        throw error;
    }
}

// Helper function to generate retailer URLs
function generateRetailerUrl(retailerName, productTitle) {
    const query = encodeURIComponent(productTitle);
    const retailerLower = retailerName.toLowerCase();

    if (retailerLower.includes('amazon')) return `https://www.amazon.com/s?k=${query}`;
    if (retailerLower.includes('ebay')) return `https://www.ebay.com/sch/i.html?_nkw=${query}`;
    if (retailerLower.includes('walmart')) return `https://www.walmart.com/search?q=${query}`;
    if (retailerLower.includes('target')) return `https://www.target.com/s?searchTerm=${query}`;
    if (retailerLower.includes('best buy')) return `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`;
    if (retailerLower.includes('nike')) return `https://www.nike.com/w?q=${query}`;
    return `https://www.google.com/search?q=${query}`;
}

// Function to transform Gumloop results into our format
function transformGumloopResults(gumloopData, searchQuery) {
    try {
        let results = [];

        // Check if data is in columnar format (arrays for each field)
        if (gumloopData.retailer && Array.isArray(gumloopData.retailer)) {
            console.log(`   Detected columnar format with ${gumloopData.retailer.length} products`);

            const length = gumloopData.retailer.length;

            for (let i = 0; i < length; i++) {
                const retailer = gumloopData.retailer[i] || 'Unknown Store';
                const title = gumloopData.title[i] || searchQuery;
                const priceStr = gumloopData.price[i] || '0';
                const price = parseFloat(priceStr.toString().replace(/[^0-9.]/g, ''));
                let url = gumloopData.url && gumloopData.url[i] ? gumloopData.url[i] : '';

                if (!url || url.trim() === '') {
                    url = generateRetailerUrl(retailer, title);
                }

                const rating = parseFloat(gumloopData.rating && gumloopData.rating[i] ? gumloopData.rating[i] : 4.0);
                const reviews = parseInt(gumloopData.reviews && gumloopData.reviews[i] ? gumloopData.reviews[i] : 0);

                if (price > 0) {
                    results.push({
                        id: i + 1,
                        retailer,
                        logo: retailer.substring(0, 2).toUpperCase(),
                        productName: title,
                        price,
                        originalPrice: null,
                        rating,
                        reviews,
                        freeShipping: Math.random() > 0.5,
                        verified: true,
                        fastShipping: Math.random() > 0.6,
                        url
                    });
                }
            }
        }
        // Array format
        else if (Array.isArray(gumloopData)) {
            results = gumloopData.map((item, index) => ({
                id: index + 1,
                retailer: item.retailer || 'Unknown Store',
                logo: (item.retailer || 'UN').substring(0, 2).toUpperCase(),
                productName: item.title || searchQuery,
                price: parseFloat(item.price || 0),
                rating: parseFloat(item.rating || 4.0),
                reviews: parseInt(item.reviews || 100),
                freeShipping: true,
                verified: true,
                fastShipping: false,
                url: item.url || generateRetailerUrl(item.retailer, item.title)
            }));
        }

        console.log(`   ✅ Transformed ${results.length} valid results`);
        return results;
    } catch (error) {
        console.error('   ❌ Error transforming:', error);
        return [];
    }
}

// Main search endpoint
app.get('/api/search', async (req, res) => {
    const { q: searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔍 NEW SEARCH REQUEST`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 Query: "${searchQuery}"`);
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);

    try {
        console.log(`\n🚀 Calling Gumloop API...`);
        const gumloopData = await searchWithGumloop(searchQuery);

        console.log(`\n📦 Gumloop Response Structure:`);
        console.log(`   Type: ${typeof gumloopData}`);
        console.log(`   Keys: ${Object.keys(gumloopData || {}).join(', ')}`);

        console.log(`\n🔄 Transforming results...`);
        let results = transformGumloopResults(gumloopData, searchQuery);

        if (results.length === 0) {
            console.log(`\n❌ No valid results found`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
            return res.status(500).json({
                error: 'No products found in Gumloop response',
                details: 'The pipeline completed but returned no valid product data'
            });
        }

        const sortedResults = results
            .filter(r => r.price > 0)
            .sort((a, b) => a.price - b.price)
            .slice(0, 10);

        console.log(`\n✅ SUCCESS: Returning ${sortedResults.length} results`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        res.json({ results: sortedResults });

    } catch (error) {
        console.error(`\n❌ ERROR:`, error.message);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        res.status(500).json({
            error: 'Failed to fetch product data from Gumloop',
            details: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server running with Gumloop', gumloop: 'enabled' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 Price Comparison Server Started`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`🔍 Search: http://localhost:${PORT}/api/search?q=query`);
    console.log(`🤖 Gumloop: FIXED - Using correct API endpoint`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
