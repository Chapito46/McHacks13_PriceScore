import React, { useState } from 'react';
import ProductCard from './components/ProductCard';
import { searchProducts, sortResults } from './utils/mockData.js';
import { callGeminiAPI } from '../../Gemini/GeminiAPI.tsx';
import './index_website.css';

function WebApp() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [sortBy, setSortBy] = useState('price-low');
    const [isSearched, setIsSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        // Add look for authentificaiton

        if (searchQuery.trim()) {
            setIsLoading(true);
            setError(null);
            setIsSearched(true);

            try {
                const geminiResponse = await callGeminiAPI(searchQuery);
                console.log('Gemini response:', geminiResponse);

                // Process gemini response and get results
                const fetchedResults = await searchProducts(searchQuery);
                const sortedResults = sortResults(fetchedResults, sortBy);
                setResults(sortedResults);
            } catch (err) {
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

    const displayResults = sortResults(results, sortBy);

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
                    <button className="search-button" onClick={() => handleSearch()}>
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
                                key={product.id}
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
