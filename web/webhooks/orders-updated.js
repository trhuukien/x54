import Jobs from '../jobs/index.js';
import { DeliveryMethod } from '@shopify/shopify-api';
import { WEBHOOK_CALLBACK_PATH } from '../constants/index.js';

export default {
  ORDERS_UPDATED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_CALLBACK_PATH,
    callback: async (topic, shop, body, webhookId) => {
      const ssid = 'offline_' + shop;
      const order = JSON.parse(body);
      const jobs = new Jobs(ssid);

      console.log('Calling WEBHOOK - ORDERS_UPDATED - Order Name:', order?.name);

      if (order?.financial_status === 'paid') {
        // When an order is placed and IS PAID
        // An order that's paid should go directly to the accounting through /voucherdrafts
        jobs.handleOrderPaid(order);

        return;
      }

      if (order?.financial_status === 'pending') {
        // When an order is placed and IS NOT PAID
        // An order that's placed but not PAID is an invoice that should be sent as /costumerinvoices INCLUDING invoice number. It will be recieved as invoiced on the customer as a "waiting for payment".
        jobs.handleOrderNotPaid(order);
        
        return;
      }

      console.log('Skip call Hogia. Order: ', order?.admin_graphql_api_id);
    },
  },
};