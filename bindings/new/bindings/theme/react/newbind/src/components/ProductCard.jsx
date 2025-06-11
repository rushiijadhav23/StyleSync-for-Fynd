import React from 'react';
import styles from '../styles/style.css';

export function ProductCard({ product }) {
    const effectivePrice = product.price?.effective?.min;
    const originalPrice = product.price?.effective?.max;
    const currency = product.price?.effective?.currency_symbol || '$';
    const discount = originalPrice && effectivePrice && originalPrice > effectivePrice
        ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
        : null;

    const handleClick = () => {
        // 👉 Your custom logic here
        console.log('Clicked on:', product.name);

        // For example, redirect to product page using slug
        if (product.slug) {
            window.location.href = `/product/${product.slug}`;
        }
    };

    return (
        <div
            className={styles.productCard}
            onClick={handleClick}
            style={{ cursor: 'pointer' }} // Makes it look clickable
        >
            {product.media?.[0] && (
                <img
                    src={product.media[0].url}
                    alt={product.media[0].alt}
                    className={styles.productImage}
                />
            )}
            <h3 className={styles.productName}>{product.name}</h3>
            <div className={styles.priceSection}>
                <span className={styles.price}>{currency}{effectivePrice}</span>
                {discount && (
                    <>
                        <span className={styles.originalPrice}>{currency}{originalPrice}</span>
                        <span className={styles.discount}>-{discount}%</span>
                    </>
                )}
            </div>
        </div>
    );
}
