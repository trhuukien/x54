import { DeliveryMethod } from '@shopify/shopify-api';
import { WEBHOOK_CALLBACK_PATH } from '../constants/index.js';
import { getHogiaConfig, getApiToken, createVoucherDraft } from '../utils/hogia.js';
import { getConfig } from '../config.js';

export default {
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: WEBHOOK_CALLBACK_PATH,
    callback: async (topic, shop, body, webhookId) => {
      console.log('Calling WEBHOOK - orders_create');
      const ssid = 'offline_' + shop;
      const order = JSON.parse(body);

      const hogiaConfig = await getHogiaConfig(ssid);
      const token = await getApiToken(ssid, hogiaConfig);

      if (!hogiaConfig?.guid) {
        throw new Error(`Please save config auth Hogia`);
      }

      if (!token) {
        throw new Error(`Config auth Hogia invalid`);
      }

      try {
        const requestBody = {
          voucherDraft: {
            voucherDate: order.created_at,
            voucherType: 'Unspecified',
            text: 'Order ID: ' + order.id,
            currencyCode: order.currency
          },
          voucherDraftRows: [
            {
              amount: order.total_price
            }
          ]
        };
        await createVoucherDraft(
          {
            token: token,
            guid: hogiaConfig?.guid
          },
          requestBody
        );
      } catch(e) {
        console.log(e);
        throw new Error(`Error save voucher`);
      }
    },
  },
};