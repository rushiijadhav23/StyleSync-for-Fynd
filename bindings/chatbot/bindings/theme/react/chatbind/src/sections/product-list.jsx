import React, { useEffect, useState } from "react";
import { useGlobalStore, useFPI } from "fdk-core/utils";
import { Helmet } from "react-helmet-async";
import styles from "../styles/style.css";
import { ChatBot } from "../components/ChatBot";
import { ProductCard } from "../components/ProductCard";

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

export function Component({ title = "Extension Title Default" }) {
  const fpi = useFPI();
  const products = useGlobalStore(fpi.getters.PRODUCTS);
  const productItems = products?.items ?? [];

  const [allProducts, setAllProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [queryCompleted, setQueryCompleted] = useState(false); // ✅ Fix added

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

  useEffect(() => {
    if (!productItems.length) {
      fetchAllProducts();
    } else {
      setAllProducts(productItems);
    }
  }, [productItems.length]);

  const chatting = async (query) => {
    const API_URL = "https://asia-south1.workflow.boltic.app/89b7e111-c0bc-4e2e-b4bd-40e973146f94/chat";

    const requestData = {
      company_id: 10368,
      query: query,
    };

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

      if (Array.isArray(data.recommended_products)) {
        setRecommendedSlugs(data.recommended_products);
      } else {
        console.warn("Unexpected response format:", data);
        setRecommendedSlugs([]);
      }
    } catch (error) {
      console.error("Request failed:", error);
      setRecommendedSlugs([]);
    } finally {
      setQueryCompleted(true);
    }
  };


  const handleSuggestionQuery = async (query) => {
    await chatting(query);
  };

  const recommendedProductObjects = allProducts.filter((product) =>
    recommendedSlugs.includes(product.slug)
  );


  return (
    <div>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <h1 className={styles.title1}>Chat with FashionBot</h1>
      <ChatBot onQuery={handleSuggestionQuery} />

      {queryCompleted && (
        <h2 className={styles.title2}>
          {recommendedProductObjects.length > 0
            ? "Suggested Products"
            : "No suggested products available."}
        </h2>
      )}

      <div className={styles.container}>
        {recommendedProductObjects.length > 0 &&
          recommendedProductObjects.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
      </div>
    </div>
  );
}

Component.serverFetch = ({ fpi }) => {
  const payload = {
    enableFilter: true,
    first: 12,
    pageNo: 1,
    pageType: "number",
  };

  fpi.custom.setValue("test-extension", true);
  return fpi.executeGQL(PLP_PRODUCTS, payload);
};

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




// import React, { useEffect, useState } from "react";
// import { useGlobalStore, useFPI } from "fdk-core/utils";
// import { Helmet } from "react-helmet-async";
// import styles from "../styles/style.css";
// import { ChatBot } from "../components/ChatBot";
// import { ProductCard } from "../components/ProductCard";

// const PLP_PRODUCTS = `query products($first: Int, $pageNo: Int, $enableFilter: Boolean, $pageType: String) {
//   products(first: $first, pageNo: $pageNo, enableFilter: $enableFilter, pageType: $pageType) {
//     items {
//       price {
//         effective {
//           currency_code
//           currency_symbol
//           max
//           min
//         }
//       }
//       media {
//         alt
//         type
//         url
//       }
//       slug
//       name
//     }
//   }
// }`;

// export function Component({ title = "Extension Title Default" }) {
//   const fpi = useFPI();
//   const products = useGlobalStore(fpi.getters.PRODUCTS);
//   const productItems = products?.items ?? [];

//   const [recommendedProducts, setRecommendedProducts] = useState([]);
//   const [allProducts, setAllProducts] = useState([]);

//   const fetchAllProducts = async () => {
//     let all = [];
//     let currentPage = 1;
//     const pageSize = 50;
//     let hasMore = true;

//     while (hasMore) {
//       const payload = {
//         enableFilter: true,
//         first: pageSize,
//         pageNo: currentPage,
//         pageType: "number",
//       };

//       try {
//         const result = await fpi.executeGQL(PLP_PRODUCTS, payload);
//         const items = result?.products?.items || [];
//         all = [...all, ...items];

//         if (items.length < pageSize) {
//           hasMore = false;
//         } else {
//           currentPage++;
//         }
//       } catch (error) {
//         console.error("Failed to fetch products:", error);
//         hasMore = false;
//       }
//     }

//     setAllProducts(all);
//     fpi.custom.setValue(fpi.getters.PRODUCTS, { items: all });
//   };

//   useEffect(() => {
//     if (!productItems.length) {
//       fetchAllProducts();
//     } else {
//       setAllProducts(productItems);
//     }
//   }, [productItems.length, fpi]);

//   const handleSuggestionQuery = async (query) => {
//     try {
//       const response = await fetch(
//         "https://c36b-115-117-121-194.ngrok-free.app/query/recommend",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ query: query }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok && Array.isArray(data.recommended_slugs)) {
//         const filtered = allProducts
//           .filter((p) => data.recommended_slugs.includes(p.slug))

//         setRecommendedProducts(filtered.slice(0, 3));
//       } else {
//         console.error("Unexpected API response:", data);
//         setRecommendedProducts([]);
//       }
//     } catch (error) {
//       console.error("Fetch error:", error);
//       setRecommendedProducts([]);
//     }
//   };

//   return (
//     <div>
//       <Helmet>
//         <title>{title}</title>
//       </Helmet>
//       <h1 className={styles.title1}>Chat with FashionBot</h1>
//       <ChatBot onQuery={handleSuggestionQuery} />
//       <h2 className={styles.title2}>Suggested Products</h2>
//       <div className={styles.container}>
//         {Array.isArray(recommendedProducts) && recommendedProducts.length > 0 ? (
//           recommendedProducts.map((product) => (
//             <ProductCard product={product} key={product.slug} />
//           ))
//         ) : (
//           <p>No suggested products available.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// Component.serverFetch = ({ fpi }) => {
//   const payload = {
//     enableFilter: true,
//     first: 12,
//     pageNo: 1,
//     pageType: "number",
//   };

//   fpi.custom.setValue("test-extension", true);
//   return fpi.executeGQL(PLP_PRODUCTS, payload);
// };

// export const settings = {
//   label: "Product List",
//   name: "product-list",
//   props: [
//     {
//       id: "title",
//       label: "Page Title",
//       type: "text",
//       default: "Extension Title",
//       info: "Set the page title for the product list.",
//     },
//   ],
//   blocks: [],
// };