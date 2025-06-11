import React, { useEffect, useState } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";  // Importing hooks from fdk-core utilities
import { Helmet } from "react-helmet-async";  // Importing Helmet for managing changes to the document head
import styles from "../styles/style.css";  // Importing CSS styles
import { ProductCard } from "../components/ProductCard";  // Importing the ProductCard component


// GraphQL query as a template literal string to fetch products with dynamic variables
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
      description
      tags
    }
  }
}`;

// Functional component definition using destructuring to access props
export function Component({ title = 'Extension Title Default' }) {
  const fpi = useFPI();  // Using a custom hook to access functional programming interface
  const products = useGlobalStore(fpi.getters.PRODUCTS);  // Accessing global store to retrieve products
  const productItems = products?.items ?? [];  // Nullish coalescing operator to handle undefined products
  
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [formattedSlug, setFormattedSlug] = useState(null);
  
  // Fetch all products using pagination
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


  const recommendation = async (productsList = allProducts) => {
  
  const targetProduct = productsList.find((product) => product.slug === formattedSlug);

  const API_URL = "https://asia-south1.workflow.boltic.app/ca7a0558-f634-4c93-872f-4e5b63e30f10/recommendation";

  const requestData = {
    company_id: 10368,
    slug: targetProduct.slug
  };

  // console.log("Request Data:", requestData);

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
    
    setRecommendedProducts(data.recommendations)
    // console.log("Recommended Products:", recommendedProducts);
  } catch (error) {
    console.error("Request failed:", error);
  }
};

// const recommendation = async (productList) => {
//   setRecommendedProducts([
//     {slug: "npnp-14135240"},
//     {slug: "wardrobe-dark-brown-textured-top-14135101"},
//     {slug: "wardrobe-navy-stripe-printed-top-12378389-14129770"},
    
//   ])

//   console.log("recommended products",recommendedProducts);
  
// }

// First effect: set formattedSlug
useEffect(() => {
  if (typeof window !== "undefined") {
    const path_of_page = window.location.pathname;
    // console.log("path_of_page", path_of_page);
    
    const rawSlug = path_of_page.split("/product/")[1];
    // console.log("rawSlug", rawSlug);

    // const slug = rawSlug?.replace(/_/g, "-");
    // console.log("slug", slug);
    setFormattedSlug(rawSlug);
  }
}, []);

// Second effect: fetch all products
useEffect(() => {
  if (!productItems.length) {
    fetchAllProducts().then((fetchedProducts) => {
      setAllProducts(fetchedProducts);
    });
  } else {
    setAllProducts(productItems);
  }
}, [productItems.length, fpi]);

// Third effect: run recommendation only when both are ready
useEffect(() => {
  if (formattedSlug && allProducts.length > 0) {
    recommendation(allProducts);
  }
}, [formattedSlug, allProducts]);


  // Conditionally rendering based on the availability of product items
  if (!allProducts.length) {
    return <h2>Loading Products...</h2>;
  }

  return (
    <div>
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <h2 className={styles.recommendationTitle}>You might also like</h2>
      <div className={styles.recommendationGrid}>
        {allProducts
          .filter((product) => recommendedProducts.includes(product.slug))
          .map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
      </div>
    </div>
  );
}

// SSR Fetch Setup (optional)
Component.serverFetch = ({ fpi }) => {
  const payload = {
    enableFilter: true,
    first: 50, // or smaller if SSR page timeout is short
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
      info: "Set the page title for the product list."
    },
  ],
  blocks: [],
};