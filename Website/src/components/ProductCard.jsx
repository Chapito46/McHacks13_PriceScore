import React from 'react';

const ProductCard = ({ product, rank, onBuy }) => {
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="star filled">★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} className="star filled">★</span>);
            } else {
                stars.push(<span key={i} className="star empty">★</span>);
            }
        }
        return stars;
    };

    // Extract first URL if it's an array
    const productUrl = Array.isArray(product.url) ? product.url[0] : product.url;

    // Create a normalized product object with single URL
    const normalizedProduct = {
        ...product,
        url: productUrl
    };

    // Safely parse price
    const price = parseFloat(product.price) || 0;
    const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
    const rating = parseFloat(product.rating) || 0;
    const reviews = parseInt(product.reviews) || 0;

    const lowestPrice = rank === 1;

    return (
        <div className="product-card" onClick={() => onBuy(normalizedProduct)}>
            <div className="rank-badge">#{rank}</div>

            <div className="card-header">
                <div className="retailer-logo">{product.logo}</div>
                <div className="card-info">
                    <h3 className="retailer-name">{product.retailer || 'Unknown Retailer'}</h3>
                    <p className="product-name">{product.name || product.productName || 'Product'}</p>
                </div>
            </div>

            <div className="price-section">
                <div className="price">${price.toFixed(2)}</div>
                {originalPrice && (
                    <div className="original-price" style={{
                        textDecoration: 'line-through',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                    }}>
                        ${originalPrice.toFixed(2)}
                    </div>
                )}
                <div className={`shipping-info ${product.freeShipping ? 'free' : ''}`}>
                    {product.freeShipping ? '✓ Free Shipping' : '+ Shipping'}
                </div>
            </div>

            <div className="rating-section">
                <div className="stars">{renderStars(rating)}</div>
                <span className="rating-text">{rating.toFixed(1)}</span>
                <span className="review-count">({reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="badges">
                {lowestPrice && <span className="badge best-price">Best Price</span>}
                {product.verified && <span className="badge verified">Verified</span>}
                {product.fastShipping && <span className="badge fast-shipping">Fast Shipping</span>}
            </div>

            <button className="buy-button" onClick={(e) => {
                e.stopPropagation();
                onBuy(normalizedProduct);
            }}>
                View on {product.retailer || 'Retailer'}
            </button>
        </div>
    );
};

export default ProductCard;
