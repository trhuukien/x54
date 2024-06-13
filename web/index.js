// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import http from "http";
import { verifyConnection} from './controller/hogiaController.js';

import shopify from "./shopify.js";
import { PrivacyWebhookHandlers, OrdersCreateWebhookHandlers } from "./webhooks/index.js";
import { getStoreConfig, storeConfig } from './controller/storeSettingsController.js';

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const server = http.createServer(app);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: { ...PrivacyWebhookHandlers, ...OrdersCreateWebhookHandlers } })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router
app.post('/api/hogia/test-token', verifyConnection);
app.get('/api/config', getStoreConfig);
app.put('/api/config', storeConfig);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
