const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const serveStatic = require("serve-static");
const { readFileSync } = require('fs');
const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const { SQLiteStorage } = require("@gofynd/fdk-extension-javascript/express/storage");
const sqliteInstance = new sqlite3.Database('session_storage.db');
const productRouter = express.Router();
const axios = require('axios');
const mongoose = require('mongoose')
const { Order } = require('./order.models.js')
const { Product } = require('./product.models.js')
const { Chat } = require('./chat.models.js')
// const cors = require('cors');
// const app = express();

const fdkExtension = setupFdk({
    api_key: process.env.EXTENSION_API_KEY,
    api_secret: process.env.EXTENSION_API_SECRET,
    base_url: process.env.EXTENSION_BASE_URL,
    cluster: process.env.FP_API_DOMAIN,
    callbacks: {
        auth: async (req) => {
            // Write you code here to return initial launch url after auth process complete
            if (req.query.application_id)
                return `${req.extension.base_url}/company/${req.query['company_id']}/application/${req.query.application_id}`;
            else
                return `${req.extension.base_url}/company/${req.query['company_id']}`;
        },
        
        uninstall: async (req) => {
            // Write your code here to cleanup data related to extension
            // If task is time taking then process it async on other process.
        }
    },
    storage: new SQLiteStorage(sqliteInstance,"exapmple-fynd-platform-extension"), // add your prefix
    access_mode: "offline",
    webhook_config: {
        api_path: "/api/webhook-events",
        notification_email: "rushijadhav1423@gmail.com",
        event_map: {
            "application/order/placed": {
                "handler": orderPlacedHandler,
                "version": '1'
            },
            "company/product/create": {
              "handler": productCreateHandler,
              "version": '3'
            },
            // "extension/extension/install": {
            //   "handler": extensionInstallHandler,
            //   "version": '1'
            // }
        }
    },
});

async function productCreateHandler(event_name, request_body, company_id, application_id) {
  console.log("productCreateHandler started");
  
  
  const API_URL = "https://asia-south1.workflow.boltic.app/f5a7f72c-fee8-4e11-a7fe-3fcdb01961a3/tags";
  const requestData = request_body.payload;
  
  try {
    // 1. Call Boltic API to get enriched product metadata
    const response = await axios.post(API_URL, requestData, {
      headers: { "Content-Type": "application/json" }
    })
;
    const { id, description, tags, embeddings } = response.data;

    console.log("Received tags and description from Boltic:", { description, tags });

    // 2. Get platformClient instance
    const platformClient = await fdkExtension.getPlatformClient(company_id, application_id);
    console.log("id", id, typeof(id));
    console.log("id", Number(id), typeof(Number(id)));
    

    // 3. Get the existing product
    const recievedProduct = await platformClient.catalog.getProduct({ itemId: Number(id) });
    const existingProduct = recievedProduct.data
    console.log(existingProduct);
    

    // 4. Update tags and description
    const updatedProduct = {
      ...existingProduct,
      // description: description || existingProduct.description,
      tags: tags || existingProduct.tags,
      company_id: company_id,
      embeddings: embeddings
    };

    console.log(updatedProduct);

    // 5. Save the updated product
    await platformClient.catalog.editProduct({
      itemId: Number(id),
      body: updatedProduct
    });

    console.log("Product updated successfully.");

  } catch (error) {
    console.error("Error in productCreateHandler:", error?.response?.data || error.message);
  }
}

async function orderPlacedHandler(event_name, request_body, company_id, application_id) {
  try {
    const order = request_body.payload.order;
    const orderId = order.order_id;

    const products = [];

    order.shipments.forEach(shipment => {
      shipment.bags.forEach(bag => {
        const item = bag.item;
        products.push({
          productName: item.name,
          productSlug: item.slug_key,
          quantity: bag.quantity
        });
      });
    });

    const newOrder = new Order({
      orderId,
      products
    });

    await newOrder.save();
    console.log("Order saved to MongoDB:", orderId);
  } catch (err) {
    console.error("Error saving order to MongoDB:", err);
  }
}


// async function extensionInstallHandler(event_name, request_body, company_id, application_id) {
//   const API_URL = "https://asia-south1.workflow.boltic.app/f5a7f72c-fee8-4e11-a7fe-3fcdb01961a3/tags";
//   const headers = { "Content-Type": "application/json" };

//   try {
//     const platformClient = await fdkExtension.getPlatformClient(company_id, application_id);

//     // Get all products (paged)
//     let page = 1;
//     const pageSize = 100;
//     let allProducts = [];
//     let hasMore = true;

//     while (hasMore) {
//       const res = await platformClient.catalog.getProducts({ page_no: page, page_size: pageSize });
//       if (res.items.length === 0) break;
//       allProducts.push(...res.items);
//       hasMore = res.page.has_next;
//       page++;
//     }

//     // Filter products with <= 1 tag
//     const lowTagProducts = allProducts.filter(p => !p.tags || p.tags.length <= 1);

//     console.log(`Found ${lowTagProducts.length} products with <=1 tag`);

//     for (const product of lowTagProducts) {
//       try {
//         const bolticResponse = await axios.post(API_URL, product, { headers });
//         const { description, tags } = bolticResponse.data;

//         const fullProduct = await platformClient.catalog.getProduct({ id: product.uid });

//         const updatedProduct = {
//           ...fullProduct,
//           description: description || fullProduct.description,
//           tags: tags || fullProduct.tags
//         };

//         await platformClient.catalog.updateProduct({
//           id: product.uid,
//           body: updatedProduct
//         });

//         console.log(`Updated product ${product.slug}`);
//       } catch (err) {
//         console.warn(`Failed to update product ${product.slug}:`, err?.response?.data || err.message);
//       }
//     }

//     console.log("All low-tag products processed on extension install.");
//   } catch (error) {
//     console.error("Error handling extension install:", error?.response?.data || error.message);
//   }
// }



const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect("mongodb+srv://aniketmdinde100:Aniket*99@stylesyncaicluster.jr7xedc.mongodb.net/stylesync?retryWrites=true&w=majority&appName=StyleSyncAICluster")
        console.log(`\nMONGODB connected :: DB_HOST :: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED ::", error);
        process.exit(1);
    }
}

connectDB();

const STATIC_PATH = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'frontend', 'public' , 'dist')
    : path.join(process.cwd(), 'frontend');
    
const app = express();
const platformApiRoutes = fdkExtension.platformApiRoutes;

// Middleware to parse cookies with a secret key
app.use(cookieParser("ext.session"));

// Middleware to parse JSON bodies with a size limit of 2mb
app.use(bodyParser.json({
    limit: '2mb'
}));

// Serve static files from the React dist directory
app.use(serveStatic(STATIC_PATH, { index: false }));

// FDK extension handler and API routes (extension launch routes)
app.use("/", fdkExtension.fdkHandler);

// Route to handle webhook events and process it.
app.post('/api/webhook-events', async function(req, res) {
    try {
      console.log(`Webhook Event: ${req.body.event} received`)
      await fdkExtension.webhookRegistry.processWebhook(req);
      return res.status(200).json({"success": true});
    } catch(err) {
      console.log(`Error Processing ${req.body.event} Webhook`);
      return res.status(500).json({"success": false});
    }
})

productRouter.get('/', async function view(req, res, next) {
    try {
        const {
            platformClient
        } = req;
        const data = await platformClient.catalog.getProducts()
        return res.json(data);
    } catch (err) {
        next(err);
    }
});

// Get products list for application
productRouter.get('/application/:application_id', async function view(req, res, next) {
    try {
        const {
            platformClient
        } = req;
        const { application_id } = req.params;
        const data = await platformClient.application(application_id).catalog.getAppProducts()
        return res.json(data);
    } catch (err) {
        next(err);
    }
});

productRouter.get("/tags", async (req, res, next) => {
  try {
    // 1. Get all orders
    const orders = await Order.find({});
    

    // 2. Collect all unique productSlugs from all orders
    const allSlugs = [];

    orders.forEach(order => {
      order.products.forEach(prod => {
        if (!allSlugs.includes(prod.productSlug)) {
          allSlugs.push(prod.productSlug);
        }
      });
    });

    // 3. Get all related products using 'slug' field (not alias)
    const productDocs = await Product.find({ slug: { $in: allSlugs } });   

    // 4. Map slug to tags
    const slugToTags = {};
    productDocs.forEach(prod => {
      let raw = Array.isArray(prod.tags) ? prod.tags[0] : '';
      let tags = [];

      if (typeof raw === 'string') {
        try {
          // Use eval safely to interpret JS-style string arrays
          tags = eval(raw);
        } catch (e) {
          console.warn(`Failed to eval tags for ${prod.slug}:`, raw);
        }
      }

      slugToTags[prod.slug] = Array.isArray(tags) ? tags : [];
    });
    

    // 5. Prepare final response
    const finalResponse = orders.map(order => {
      const enrichedProducts = order.products.map(prod => ({
        productSlug: prod.productSlug,
        quantity: prod.quantity,
        tags: slugToTags[prod.productSlug] || []
      }));
      
      return {
        orderId: order.orderId,
        products: enrichedProducts
      };
    });
    
    res.json(finalResponse);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

productRouter.get("/chats", async (req, res, next) => {
  try {
    const chats = await Chat.find({});
    
    res.json(chats);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// FDK extension api route which has auth middleware and FDK client instance attached to it.
platformApiRoutes.use('/products', productRouter);

// If you are adding routes outside of the /api path, 
// remember to also add a proxy rule for them in /frontend/vite.config.js
app.use('/api', platformApiRoutes);

// Serve the React app for all other routes
app.get('*', (req, res) => {
    return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(path.join(STATIC_PATH, "index.html")));
});

module.exports = app;

// // Insights API
// app.use(cors());
// mongoose.connect("mongodb+srv://aniketmdinde100:Aniket*99@stylesyncaicluster.jr7xedc.mongodb.net/stylesync?retryWrites=true&w=majority&appName=StyleSyncAICluster");

// const Order = require('./order.models.js');
// const Product = require('./product.models.js');
// const Chat = require('./chat.models.js');

// connectDB();

// app.use("/api/insights", require('./insights')(Order, Product, Chat));
// // Chat API
// app.use("/api/chats", require('./chat')(Chat));

// // Order API
// app.use("/api/orders", require('./order')(Order, Product));
// // Product API
// app.use("/api/products", require('./product')(Product));
// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
