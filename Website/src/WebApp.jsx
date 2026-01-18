import React, { useState } from 'react';
import ProductCard from './components/ProductCard';
import { sortResults } from './utils/mockData.js';
import { callGeminiAPI, pollForResults } from '../../Gemini/GeminiAPI.tsx';
import './index_website.css';

function WebApp() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [sortBy, setSortBy] = useState('price-low');
    const [isSearched, setIsSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            setIsLoading(true);
            setError(null);
            setIsSearched(true);

            try {
                // Get run ID from Gemini/Gumloop
                const runId = await callGeminiAPI(searchQuery);
                console.log('Pipeline run ID:', runId);

                // Poll for results
                const gumloopOutputs = await pollForResults(runId);
                console.log('Gumloop outputs:', gumloopOutputs);

                // If output is a string, parse it
                let parsedProducts = gumloopOutputs;
                if (typeof gumloopOutputs === 'string') {
                    try {
                        parsedProducts = JSON.parse(gumloopOutputs);
                    } catch (parseErr) {
                        console.error('Failed to parse products:', parseErr);
                        parsedProducts = [];
                    }
                }

                // Ensure it's an array
                const productArray = Array.isArray(parsedProducts) ? parsedProducts : [parsedProducts];

                // Replace the entire normalization section with this:
                console.log('Raw product array:', productArray);

// Transform the data structure from Gumloop's format
// Gumloop returns ONE object with arrays for each field
// We need to convert it to an array of individual product objects
                let allProducts = [];

                if (productArray.length > 0) {
                    const gumloopData = productArray[0]; // Get the first (and likely only) object
                    console.log('Gumloop data structure:', gumloopData);

                    // Check if we have the array-based structure
                    if (gumloopData.product_name && Array.isArray(gumloopData.product_name)) {
                        const numProducts = gumloopData.product_name.length;

                        // Create individual product objects from the arrays
                        for (let i = 0; i < numProducts; i++) {
                            const productName = gumloopData.product_name[i];
                            const retailer = gumloopData.retailer[i];
                            const priceStr = gumloopData.price[i];
                            const url = gumloopData.url[i];

                            // Skip empty entries
                            if (!productName || !retailer || !priceStr || !url) {
                                console.log(`Skipping index ${i} - missing data`);
                                continue;
                            }

                            // Parse price
                            const price = parseFloat(priceStr.replace(/[$,]/g, '')) || 0;

                            if (price <= 0) {
                                console.log(`Skipping index ${i} - invalid price`);
                                continue;
                            }

                            allProducts.push({
                                id: i,
                                productName: productName,
                                retailer: retailer,
                                price: price,
                                originalPrice: null,
                                description: gumloopData.special_offers?.[i] || '',
                                url: url,
                                image: '',
                                logo: '',
                                freeShipping: gumloopData.shipping?.[i] === 'free',
                                verified: true,
                                fastShipping: false,
                                availability: gumloopData.availability?.[i] || 'unknown'
                            });
                        }
                    }
                }

                console.log('Transformed products:', allProducts);

                const normalizedProducts = allProducts;

                console.log('All normalized products:', normalizedProducts);

                const sortedByPrice = normalizedProducts
                    .filter(product => {
                        const price = parseFloat(product.price);
                        return !isNaN(price) && price > 0;
                    })
                    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

// Check if we have any valid products
                if (sortedByPrice.length > 0) {
                    const cheapest = sortedByPrice[0];
                    console.log('Cheapest product:', cheapest.productName);
                    console.log('Cheapest retailer:', cheapest.retailer);
                    console.log('Cheapest URL:', cheapest.url);
                    console.log('Cheapest price:', cheapest.price);
                } else {
                    console.log('No products with valid prices found');
                }

                setResults(normalizedProducts);


            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to fetch results. Please try again.');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSort = (sortType) => {
        setSortBy(sortType);
        if (results.length > 0) {
            const sortedResults = sortResults(results, sortType);
            setResults(sortedResults);
        }
    };

    const handleBuy = (product) => {
        console.log('Opening URL:', product.url);
        // URL is already extracted to first element in normalization
        if (product.url && product.url !== '#') {
            window.open(product.url, '_blank', 'noopener,noreferrer');
        } else {
            console.error('Invalid URL:', product.url);
        }
    };

    // Sort results before displaying
    const displayResults = results.length > 0 ? sortResults(results, sortBy) : [];

    return (
        <div className="app">
            <header className="header">
                <h1>PriceScout</h1>
                <p className="header-subtitle">
                    Find the best deals across the web. Compare prices instantly.
                </p>
            </header>

            <div className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for any product... (e.g., LeBron James Jersey)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        Search
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Searching for best prices...</p>
                </div>
            )}

            {error && !isLoading && (
                <div className="empty-state">
                    <div className="empty-state-icon">⚠️</div>
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {isSearched && results.length > 0 && !isLoading && (
                <div className="results-section">
                    <div className="results-header">
                        <div>
                            <h2>Top {results.length} Results</h2>
                            <p className="results-count">
                                Showing best prices for "{searchQuery}"
                            </p>
                        </div>
                        <div className="sort-controls">
                            <button
                                className={`sort-button ${sortBy === 'price-low' ? 'active' : ''}`}
                                onClick={() => handleSort('price-low')}
                            >
                                Price: Low to High
                            </button>
                            <button
                                className={`sort-button ${sortBy === 'price-high' ? 'active' : ''}`}
                                onClick={() => handleSort('price-high')}
                            >
                                Price: High to Low
                            </button>
                        </div>
                    </div>

                    <div className="results-grid">
                        {displayResults.map((product, index) => (
                            <ProductCard
                                key={product.id || index}
                                product={product}
                                rank={index + 1}
                                onBuy={handleBuy}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isSearched && results.length === 0 && !isLoading && !error && (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try searching for a different product</p>
                </div>
            )}

            {!isSearched && !isLoading && (
                <div className="empty-state">
                    <div className="empty-state-icon">🛍️</div>
                    <h3>Start comparing prices</h3>
                    <p>Enter a product name above to find the best deals</p>
                </div>
            )}
        </div>
    );
}

export default WebApp;
