//ProductCard.jsx

import React, { useState } from 'react';
import styles from '../styles/style.css';

export function ProductCard({ product, fpi }) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [showServiceabilityModal, setShowServiceabilityModal] = useState(false);
    const [pincode, setPincode] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [availableSizes, setAvailableSizes] = useState([]);
    const [serviceabilityData, setServiceabilityData] = useState(null);

    // GraphQL Queries - Updated to handle country parameter properly
    const LOCALITY_QUERY = `
        query locality($locality: LocalityEnum!, $localityValue: String!, $country: String) {
            locality(locality: $locality, localityValue: $localityValue, country: $country) {
                display_name
                id
                name
                parent_ids
                type
                localities {
                    id
                    name
                    display_name
                    parent_ids
                    type
                }
            }
        }
    `;

    // Alternative query without country parameter
    const LOCALITY_QUERY_NO_COUNTRY = `
        query locality($locality: LocalityEnum!, $localityValue: String!) {
            locality(locality: $locality, localityValue: $localityValue) {
                display_name
                id
                name
                parent_ids
                type
                localities {
                    id
                    name
                    display_name
                    parent_ids
                    type
                }
            }
        }
    `;

    const PRODUCT_PRICE_QUERY = `
        query ProductPrice($slug: String!, $size: String!, $pincode: String!) {
            productPrice(slug: $slug, size: $size, pincode: $pincode) {
                article_id
                discount
                is_cod
                is_gift
                item_type
                long_lat
                pincode
                quantity
                seller_count
                special_badge
                price_per_piece {
                    currency_code
                    currency_symbol
                    effective
                    marked
                    selling
                }
                price {
                    currency_code
                    currency_symbol
                    effective
                    marked
                    selling
                }
                price_per_unit {
                    currency_code
                    currency_symbol
                    price
                    unit
                }
                return_config {
                    returnable
                    time
                    unit
                }
                seller {
                    count
                    name
                    uid
                }
                set {
                    quantity
                }
                store {
                    uid
                    name
                    count
                }
                strategy_wise_listing {
                    distance
                    pincode
                    quantity
                    tat
                }
                grouped_attributes {
                    title
                    details {
                        key
                        type
                        value
                    }
                }
                article_assignment {
                    level
                    strategy
                }
                delivery_promise {
                    max
                    min
                }
                discount_meta {
                    end
                    start
                    start_timer_in_minutes
                    timer
                }
            }
        }
    `;

    const ADD_TO_CART_MUTATION = `
        mutation AddItemsToCart($buyNow: Boolean, $areaCode: String!, $addCartRequestInput: AddCartRequestInput) {
            addItemsToCart(buyNow: $buyNow, areaCode: $areaCode, addCartRequestInput: $addCartRequestInput) {
                message
                partial
                success
                cart {
                    buy_now
                    cart_id
                    checkout_mode
                    comment
                    coupon_text
                    delivery_charge_info
                    gstin
                    id
                    is_valid
                    message
                    restrict_checkout
                    user_cart_items_count
                    uid
                    items {
                        bulk_offer
                        coupon_message
                        custom_order
                        discount
                        is_set
                        key
                        message
                        moq
                        parent_item_identifiers
                        product_ean_id
                        quantity
                        availability {
                            deliverable
                            is_valid
                            other_store_quantity
                            out_of_stock
                            sizes
                            available_sizes {
                                display
                                is_available
                                value
                            }
                        }
                        article {
                            _custom_json
                            cart_item_meta
                            extra_meta
                            gift_card
                            identifier
                            is_gift_visible
                            meta
                            mto_quantity
                            parent_item_identifiers
                            product_group_tags
                            quantity
                            seller_identifier
                            size
                            tags
                            uid
                            seller {
                                name
                                uid
                            }
                            price {
                                base {
                                    currency_code
                                    currency_symbol
                                    effective
                                    marked
                                }
                                converted {
                                    currency_code
                                    currency_symbol
                                    effective
                                    marked
                                }
                            }
                        }
                        price_per_unit {
                            base {
                                currency_code
                                currency_symbol
                                effective
                                marked
                                selling_price
                            }
                            converted {
                                currency_code
                                currency_symbol
                                effective
                                marked
                                selling_price
                            }
                        }
                        product {
                            attributes
                            item_code
                            name
                            slug
                            tags
                            type
                            uid
                            brand {
                                name
                                uid
                            }
                            action {
                                type
                                url
                            }
                            categories {
                                name
                                uid
                            }
                            images {
                                aspect_ratio
                                secure_url
                                url
                            }
                        }
                        promo_meta {
                            message
                        }
                        promotions_applied {
                            amount
                            article_quantity
                            code
                            meta
                            mrp_promotion
                            offer_text
                            promo_id
                            promotion_group
                            promotion_name
                            promotion_type
                            applied_free_articles {
                                article_id
                                parent_item_identifier
                                quantity
                                free_gift_item_details {
                                    item_brand_name
                                    item_id
                                    item_images_url
                                    item_name
                                    item_price_details {
                                        currency
                                        marked {
                                            min
                                            max
                                        }
                                        effective {
                                            min
                                            max
                                        }
                                    }
                                    item_slug
                                }
                            }
                            discount_rules {
                                item_criteria
                                matched_buy_rules
                                offer
                                raw_offer
                            }
                        }
                        charges {
                            meta
                            name
                            allow_refund
                            code
                            type
                            amount {
                                currency
                                value
                            }
                        }
                        coupon {
                            code
                            discount_single_quantity
                            discount_total_quantity
                        }
                        identifiers {
                            identifier
                        }
                        price {
                            base {
                                currency_code
                                currency_symbol
                                effective
                                marked
                            }
                            converted {
                                currency_code
                                currency_symbol
                                effective
                                marked
                            }
                        }
                        delivery_promise {
                            formatted {
                                max
                                min
                            }
                            timestamp {
                                max
                                min
                            }
                            iso {
                                max
                                min
                            }
                        }
                    }
                    breakup_values {
                        coupon {
                            code
                            coupon_type
                            coupon_value
                            description
                            is_applied
                            message
                            minimum_cart_value
                            sub_title
                            title
                            type
                            uid
                            value
                        }
                        display {
                            currency_code
                            currency_symbol
                            display
                            key
                            message
                            value
                            preset
                        }
                        loyalty_points {
                            applicable
                            description
                            is_applied
                            total
                        }
                        raw {
                            cod_charge
                            convenience_fee
                            coupon
                            delivery_charge
                            discount
                            fynd_cash
                            gift_card
                            gst_charges
                            mop_total
                            mrp_total
                            subtotal
                            total
                            vog
                            you_saved
                            total_charge
                        }
                    }
                }
            }
        }
    `;

    const GET_CART_QUERY = `
        query Cart($areaCode: String, $assignCardId: Int, $includeBreakup: Boolean, $buyNow: Boolean, $includeAllItems: Boolean, $includeCodCharges: Boolean, $cartId: String) {
            cart(areaCode: $areaCode, assignCardId: $assignCardId, includeBreakup: $includeBreakup, buyNow: $buyNow, includeAllItems: $includeAllItems, includeCodCharges: $includeCodCharges, id: $cartId) {
                buy_now
                cart_id
                checkout_mode
                comment
                coupon_text
                delivery_charge_info
                gstin
                id
                is_valid
                message
                restrict_checkout
                user_cart_items_count
                uid
                success
            }
        }
    `;

    // Initialize with common sizes
    React.useEffect(() => {
        setAvailableSizes(['XS', 'S', 'M', 'L', 'XL', 'OS']);
        setSelectedSize('OS');
    }, []);

    const handleAddToCartClick = () => {
        setShowServiceabilityModal(true);
    };

    const checkServiceability = async () => {
        if (!pincode || !selectedSize) {
            alert('Please enter pincode and select size');
            return;
        }

        // Validate pincode format (6 digits)
        const cleanPincode = pincode.replace(/\D/g, '');
        if (cleanPincode.length !== 6) {
            alert('Please enter a valid 6-digit pincode');
            return;
        }

        try {
            setIsAddingToCart(true);

            console.log('Debug Info:', {
                pincode: cleanPincode,
                selectedSize,
                productSlug: product.slug,
                productUid: product.uid
            });

            // Step 1: Check locality with multiple approaches
            console.log('Step 1: Checking locality...');
            
            let localityResult;
            let localityData;
            
            // Try different country codes and approaches
            const approaches = [
                { country: "IN", query: LOCALITY_QUERY },
                { country: "IND", query: LOCALITY_QUERY },
                { country: null, query: LOCALITY_QUERY_NO_COUNTRY }
            ];
            
            for (const approach of approaches) {
                try {
                    console.log(`Trying approach:`, approach);
                    
                    const variables = {
                        locality: "pincode",
                        localityValue: cleanPincode
                    };
                    
                    if (approach.country) {
                        variables.country = approach.country;
                    }
                    
                    localityResult = await fpi.executeGQL(approach.query, variables);
                    console.log(`Result:`, localityResult);
                    
                    // Check for success
                    localityData = localityResult?.data?.locality || localityResult?.locality;
                    
                    if (localityData && !localityResult?.errors) {
                        console.log(`✅ Success with approach:`, approach);
                        break;
                    } else if (localityResult?.errors) {
                        console.log(`❌ Error with approach:`, approach, localityResult.errors);
                    }
                } catch (error) {
                    console.log(`❌ Exception with approach:`, approach, error.message);
                    continue;
                }
            }
            
            if (!localityData) {
                console.error('All locality approaches failed');
                if (localityResult?.errors) {
                    alert(`Locality Error: ${localityResult.errors[0]?.message || 'Unknown error'}`);
                } else {
                    alert('Invalid pincode or locality service unavailable');
                }
                setIsAddingToCart(false);
                return;
            }

            console.log('✅ Locality validated successfully:', localityData);

            // Step 2: Check product price and availability
            console.log('Step 2: Checking product price...');
            
            const priceResult = await fpi.executeGQL(PRODUCT_PRICE_QUERY, {
                slug: product.slug,
                size: selectedSize,
                pincode: cleanPincode
            });

            console.log('Price Result:', priceResult);

            const priceData = priceResult?.data?.productPrice || priceResult?.productPrice;

            if (!priceData) {
                console.error('No price data found');
                if (priceResult?.errors) {
                    alert(`Product Price Error: ${priceResult.errors[0]?.message || 'Unknown error'}`);
                } else {
                    alert('Product not available for this pincode and size combination');
                }
                setIsAddingToCart(false);
                return;
            }

            console.log('✅ Product price validated successfully:', priceData);
            setServiceabilityData(priceData);
            
            // Product is serviceable, proceed to add to cart
            await addToCart(priceData, cleanPincode);

        } catch (error) {
            console.error('Serviceability check failed:', error);
            alert(`Failed to check serviceability: ${error.message}`);
            setIsAddingToCart(false);
        }
    };

    const addToCart = async (productData, cleanPincode) => {
        try {
            console.log('Step 3: Adding to cart...');
            
            const itemId = product.uid || parseInt(product.slug.split('-').pop());
            console.log('Cart Item Details:', {
                itemId,
                articleId: productData.article_id,
                sellerId: productData.seller.uid,
                storeId: productData.store.uid,
                size: selectedSize,
                pincode: cleanPincode
            });

            const addToCartResult = await fpi.executeGQL(ADD_TO_CART_MUTATION, {
                buyNow: false,
                areaCode: cleanPincode,
                addCartRequestInput: {
                    items: [{
                        article_assignment: productData.article_assignment,
                        article_id: productData.article_id,
                        item_id: itemId,
                        item_size: selectedSize,
                        quantity: 1,
                        seller_id: productData.seller.uid,
                        store_id: productData.store.uid
                    }]
                }
            });

            console.log('Add to Cart Result:', addToCartResult);

            const cartResult = addToCartResult?.data?.addItemsToCart || addToCartResult?.addItemsToCart;

            if (cartResult?.success) {
                // Get updated cart
                await fpi.executeGQL(GET_CART_QUERY, {
                    buyNow: false,
                    includeAllItems: true,
                    includeBreakup: true
                });

                // Send analytics event
                await sendAnalyticsEvent(cartResult.cart, productData);

                alert('Product added to cart successfully!');
                setShowServiceabilityModal(false);
            } else {
                console.error('Add to cart failed:', cartResult);
                alert(`Failed to add product to cart: ${cartResult?.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Add to cart failed:', error);
            alert(`Failed to add product to cart: ${error.message}`);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const sendAnalyticsEvent = async (cartData, productData) => {
        try {
            const eventPayload = {
                batch: [{
                    context: {
                        library: {
                            name: "flick",
                            version: "1.0.4"
                        },
                        os: {
                            name: navigator.platform.includes('Mac') ? "Mac OS" : "Windows",
                            version: "10.15.7"
                        },
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        screen: {
                            width: window.screen.width,
                            height: window.screen.height
                        },
                        user_agent: navigator.userAgent,
                        locale: navigator.language,
                        device: {
                            is_mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                        }
                    },
                    event_id: generateUUID(),
                    event_name: "add_to_cart",
                    properties: {
                        cart_id: cartData.id,
                        event_type: "engagement",
                        product_id: product.uid || parseInt(product.slug.split('-').pop()),
                        article_id: productData.article_id,
                        brand: product.brand?.name || "Generic",
                        l3_category: product.categories?.[0]?.name || "Unknown",
                        currency: "INR",
                        quantity: 1,
                        position: null,
                        query: null,
                        f_medium: "",
                        f_source: "",
                        f_campaign: "",
                        utm_medium: "",
                        utm_source: "",
                        utm_campaign: "",
                        search_id: null,
                        previous_cart_id: cartData.id
                    },
                    event_timestamp: new Date().toISOString(),
                    user_id: null,
                    anonymous_id: generateUUID()
                }],
                sent_at: new Date().toISOString()
            };

            await fetch('/api/service/application/webhook/v1.0/click-analytics/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventPayload)
            });

        } catch (error) {
            console.error('Analytics event failed:', error);
        }
    };

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    return (
        <div className={styles.product}>
            {product.media?.[0] && (
                <img src={product.media[0].url} alt={product.media[0].alt} />
            )}
            <h1 className={styles.name}>{product.name}</h1>
            
            {/* Price Display */}
            {product.price && (
                <div className={styles.price}>
                    <span className={styles.effectivePrice}>
                        {product.price.effective?.currency_symbol}{product.price.effective?.min}
                    </span>
                    {product.price.effective?.max !== product.price.effective?.min && (
                        <span> - {product.price.effective?.currency_symbol}{product.price.effective?.max}</span>
                    )}
                </div>
            )}

            <button 
                className={styles.btn} 
                onClick={handleAddToCartClick}
                disabled={isAddingToCart}
            >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            {/* Serviceability Modal */}
            {showServiceabilityModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Check Serviceability</h3>
                        
                        <div className={styles.formGroup}>
                            <label>Pincode:</label>
                            <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                placeholder="Enter 6-digit pincode (e.g., 400001)"
                                className={styles.input}
                                maxLength="6"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Size:</label>
                            <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                className={styles.select}
                            >
                                {availableSizes.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.modalActions}>
                            <button 
                                onClick={checkServiceability}
                                disabled={isAddingToCart}
                                className={styles.confirmBtn}
                            >
                                {isAddingToCart ? 'Processing...' : 'Add to Cart'}
                            </button>
                            <button 
                                onClick={() => setShowServiceabilityModal(false)}
                                className={styles.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}