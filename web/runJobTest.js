import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getHogiaConfig, getApiToken, createCustomerInvoices, createCustomerPayment } from './utils/hogia.js';
globalThis.__rootdir = path.resolve();

async function test() {
  const hogiaConfig = await getHogiaConfig('offline_quickstart-9b4e4108.myshopify.com');
  const token = await getApiToken('offline_quickstart-9b4e4108.myshopify.com', hogiaConfig);
  const sequenceId = uuidv4();

  const requestBody = {
    "currencyInfo": {
      "exchangeRate": 0,
      "roundingFactor": 1,
      "currency": {
        "decimals": 2,
        "code": "VND"
      },
      "accountingCurrency": {
        "decimals": 2,
        "code": "VND"
      }
    },
    "invoiceLines": [
      {
        "type": "TextInvoiceLine",
        "name": "Kvittonummer 203"
      },
      {
        "unitPrice": '448',
        "unitType": "st",
        "quantity": 1,
        "salesAccountNumber": 3001,
        "vat": {
          "percent": 0.25,
          "accountNumber": 2611
        },
        "name": "The product",
        "type": "InvoiceLine"
      },
      {
        "unitPrice": '458',
        "unitType": "st",
        "quantity": 1,
        "vat": {
          "percent": 0.12,
          "accountNumber": 2621
        },
        "salesAccountNumber": 3002,
        "name": "Another product",
        "type": "InvoiceLine"
      }
    ],
    "invoiceHeader": {
      "invoiceDate": "2024-10-11",
      "invoiceNumber": 1022,
      "customer": {
        "number": "1234",
      },
      "comment": "",
      "ourReference": "",
      "yourReference": ""
    }
  };

  await createCustomerInvoices(
    {
      ssid: 'offline_quickstart-9b4e4108.myshopify.com',
      order_data: { order_id: 111111 },
      token: token,
      guid: hogiaConfig?.guid
    },
    requestBody
  );
}

test();