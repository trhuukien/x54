import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import prisma from './context/prisma.js';
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import { WEBHOOK_CALLBACK_PATH } from './constants/index.js';
const storage = new PrismaSessionStorage(prisma);

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: WEBHOOK_CALLBACK_PATH,
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: storage,
});

export default shopify;