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

    const lowestPrice = rank === 1;

    return (
        <div className="product-card" onClick={() => onBuy(product)}>
            <div className="rank-badge">#{rank}</div>

            <div className="card-header">
                <div className="retailer-logo">{product.logo}</div>
                <div className="card-info">
                    <h3 className="retailer-name">{product.retailer}</h3>
                    <p className="product-name">{product.productName}</p>
                </div>
            </div>

            <div className="price-section">
                <div className="price">${product.price.toFixed(2)}</div>
                {product.originalPrice && (
                    <div className="original-price" style={{
                        textDecoration: 'line-through',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                    }}>
                        ${product.originalPrice.toFixed(2)}
                    </div>
                )}
                <div className={`shipping-info ${product.freeShipping ? 'free' : ''}`}>
                    {product.freeShipping ? '✓ Free Shipping' : '+ Shipping'}
                </div>
            </div>

            <div className="rating-section">
                <div className="stars">{renderStars(product.rating)}</div>
                <span className="rating-text">{product.rating}</span>
                <span className="review-count">({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="badges">
                {lowestPrice && <span className="badge best-price">Best Price</span>}
                {product.verified && <span className="badge verified">Verified</span>}
                {product.fastShipping && <span className="badge fast-shipping">Fast Shipping</span>}
            </div>

            <button className="buy-button" onClick={(e) => {
                e.stopPropagation();
                onBuy(product);
            }}>
                View on {product.retailer}
            </button>
        </div>
    );
};

export default ProductCard;
