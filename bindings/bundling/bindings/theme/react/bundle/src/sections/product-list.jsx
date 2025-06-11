//product-list.jsx

import React, { useEffect, useState } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { Helmet } from "react-helmet-async";
import styles from "../styles/style.css";
import { ProductCard } from "../components/ProductCard";

// GraphQL query with pagination support
const PLP_PRODUCTS = `query products($first: Int, $pageNo: Int, $enableFilter: Boolean, $pageType: String) {
  products(first: $first, pageNo: $pageNo, enableFilter: $enableFilter, pageType: $pageType) {
    items {
      price {
        effective {
          currency_code
          currency_symbol
          max
          min
        }
      }
      media {
        alt
        type
        url
      }
      slug
      name
      uid
      embeddings
      brand {
        name
        uid
      }
      categories {
        name
        uid
      }
    }
  }
}`;

export function Component({ title = 'Extension Title Default' }) {
  const fpi = useFPI();
  const storeProducts = useGlobalStore(fpi.getters.PRODUCTS);
  const productItems = storeProducts?.items ?? [];

  const [allProducts, setAllProducts] = useState([]);
  const [recommendedBundles, setRecommendedBundles] = useState({});
  const [formattedSlug, setFormattedSlug] = useState(null);

  // Fetch all products with pagination
  const fetchAllProducts = async () => {
  let all = [];
  let currentPage = 1;
  const pageSize = 50;
  let hasMore = true;

  while (hasMore) {
    const payload = {
      enableFilter: true,
      first: pageSize,
      pageNo: currentPage,
      pageType: "number",
    };

    try {
      const result = await fpi.executeGQL(PLP_PRODUCTS, payload);
      const items = result?.products?.items || [];

      all = [...all, ...items];

      if (items.length < pageSize) {
        hasMore = false;
      } else {
        currentPage++;
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      hasMore = false;
    }
  }

  setAllProducts(all);
  fpi.custom.setValue(fpi.getters.PRODUCTS, { items: all });

  return all;
  };

  const bundling = async (productsList = allProducts) => {
  const targetProduct = productsList.find((product) => product.slug === formattedSlug);
  console.log("targetProduct", targetProduct);
  

  const API_URL = "https://asia-south1.workflow.boltic.app/a5d3c126-e0e7-4228-bc1f-86ba7d93dfb5/bundling";

  const requestData = {
    company_id: 10368,
    slug: targetProduct.slug
  };

  console.log("Request Data:", requestData);

  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestData),
    });
    

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response:", data);
    
    setRecommendedBundles(data.recommended_bundles)
  } catch (error) {
    console.error("Request failed:", error);
  }
};

useEffect(() => {
    if (typeof window !== "undefined") {
      const path_of_page = window.location.pathname;
      const rawSlug = path_of_page.split("/product/")[1];
      setFormattedSlug(rawSlug);
    }
  }, [])

useEffect(() => {
  console.log("recommendedBundles", recommendedBundles);
  console.log("formattedSlug", formattedSlug);
},[recommendedBundles, formattedSlug])

  useEffect(() => {
  if (!productItems.length) {
    fetchAllProducts().then((fetchedProducts) => {
      setAllProducts(fetchedProducts);
    });
  } else {
    setAllProducts(productItems);
  }
}, [productItems.length, fpi]);

useEffect(() => {
  if (formattedSlug && allProducts.length > 0) {
    bundling(allProducts);
  }
}, [formattedSlug, allProducts]);
  

  // Fetch bundling recommendation
  // const fetchBundles = async () => {
  //   try {
  //     const response = await fetch("https://submitted-airlines-copies-tribunal.trycloudflare.com/bundling", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ slug: formattedSlug }),
  //     });

  //     const data = await response.json();

  //     if (response.ok && data?.target_product) {
  //       setRecommendedBundles(data);
  //     } else {
  //       console.error("Unexpected API response:", data);
  //     }
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchBundles();
  // }, []);

  if (!allProducts.length) {
    return <h2>Loading Products...</h2>;
  }

  return (
    <div className={styles.maincontainers}>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <h2 className={styles.lookText}>Complete the look</h2>
      <br />
      <div className={styles.bundlings}></div>
      <div className={styles.bundles}>
        {recommendedBundles?.target && (
          <>
            {/* Show Target Product */}
            {allProducts
              .filter((product) => product.slug === recommendedBundles.target.slug)
              .map((product) => (
                <ProductCard product={product} key={product.slug} fpi={fpi} />
              ))}

            {/* Show ONLY first product from each recommended group */}
            {recommendedBundles.recommended_outfits?.map((group, index) => {
              const firstRecProd = group[0];   // Only first product in this group
              const matchingProduct = allProducts.find((product) => product.slug === firstRecProd.slug);
              
              if (!matchingProduct) return null;
              
              return (
                <ProductCard product={matchingProduct} key={matchingProduct.slug} fpi={fpi} />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// SSR fallback (optional)
Component.serverFetch = ({ fpi }) => {
  const payload = {
    enableFilter: true,
    first: 50,
    pageNo: 1,
    pageType: "number",
  };
  fpi.custom.setValue("test-extension", true);
  return fpi.executeGQL(PLP_PRODUCTS, payload);
};

// Config
export const settings = {
  label: "Product List",
  name: "product-list",
  props: [
    {
      id: "title",
      label: "Page Title",
      type: "text",
      default: "Extension Title",
      info: "Set the page title for the product list.",
    },
  ],
  blocks: [],
};