import React, { useState } from 'react';
import ProductCard from './components/ProductCard';
import { sortResults } from './utils/mockData.js';
import { callGeminiAPI, pollForResults } from '../../Gemini/GeminiAPI.tsx';
import './index_website.css';

function findCheapestProduct(products) {
    if (!products || products.length === 0) return null;

    // Find product with lowest price
    const cheapest = products.reduce((min, product) => {
        const currentPrice = parseFloat(product.price) || Infinity;
        const minPrice = parseFloat(min.price) || Infinity;
        return currentPrice < minPrice ? product : min;
    });

    return cheapest;
}

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
                const normalizedProducts = productArray.map((product, index) => ({
                    id: product.id || index,
                    name: product.name || 'Unknown Product',
                    price: parseFloat(product.price) || 0,
                    description: product.description || '',
                    url: product.url || '#',
                    rating: parseFloat(product.rating) || 0,
                    reviews: parseInt(product.reviews) || 0,
                    image: product.image || product.imageUrl || ''
                }));

                console.log('Normalized products:', normalizedProducts);
                const sortedByPrice = normalizedProducts
                    .filter(product => {
                        const price = parseFloat(product.price);
                        return !isNaN(price) && price > 0;
                    })
                    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

// Check if we have any valid products
                if (sortedByPrice.length > 0) {
                    const cheapest = sortedByPrice[0];
                    console.log('Cheapest URL:', cheapest.url);
                    console.log('Cheapest ID:', cheapest.id);
                } else {
                    console.log('No products with valid prices found');
                }

                const cheapest_thing = sortedByPrice[0];
                console.log('Cheapest URL:', cheapest_thing.url);
                console.log('Cheapest ID:', cheapest_thing.id);
                const cheapest = findCheapestProduct(normalizedProducts);
                if (cheapest) {
                    console.log('Cheapest product:', cheapest.name);
                    console.log('Price:', cheapest.price);
                    console.log('ID:', cheapest.id);
                    console.log('URL:', cheapest.url);c
                }
                const cheapestUrl = Array.isArray(cheapest.url) ? cheapest.url[0] : cheapest.url;
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
        // Open the retailer's website in a new tab
        window.open(product.url, '_blank', 'noopener,noreferrer');
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
                            <button
                                className={`sort-button ${sortBy === 'rating' ? 'active' : ''}`}
                                onClick={() => handleSort('rating')}
                            >
                                Highest Rated
                            </button>
                            <button
                                className={`sort-button ${sortBy === 'reviews' ? 'active' : ''}`}
                                onClick={() => handleSort('reviews')}
                            >
                                Most Reviews
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
