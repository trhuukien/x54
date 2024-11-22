import fetch from 'node-fetch';
import { getConfig, updateConfig } from '../config.js';
import { getCustomerInvoice, updateCustomerInvoices } from '../customerInvoices.js';

const api_version = '2024-11-11';

export async function getHogiaConfig(shop) {
  const hogiaConfig = await getConfig(shop, 'settings/hogia');
  const value = hogiaConfig?.value || null;
  return value ? JSON.parse(value) : null;
}

export async function getApiToken(shop, hogiaConfig) {
  const hogiaToken = await getConfig(shop, 'settings/hogia/token');
  const parsedToken = hogiaToken?.value ? JSON.parse(hogiaToken.value) : null;
  if (parsedToken?.access_token) {
    let expiresIn = new Date(hogiaToken?.updatedAt);
    expiresIn.setSeconds(expiresIn.getSeconds() + parsedToken?.expires_in);
    let now = new Date();

    console.log(expiresIn > now, expiresIn);

    if (expiresIn > now) {
      return parsedToken?.access_token;
    }
  }

  const responseData = await getApiTokenData(hogiaConfig?.client_id, hogiaConfig?.client_secret);
  if (!responseData?.access_token) {
    throw new Error(`Auth invalid`); 
  }

  await updateConfig(shop, 'settings/hogia/token', JSON.stringify(responseData));
  return responseData?.access_token;
}

export async function getApiTokenData(client_id, client_secret) {
  const url = 'https://id.hogia.se/connect/token';
  const data = {
      grant_type: 'client_credentials',
      client_id: client_id,
      client_secret: client_secret
  };
  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(data)
  });
  if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData;
}

export async function getVoucherDraft(props, voucherId) {
  const { token, guid } = props;
  
  const url = `https://api.hogia.se/${guid}/voucherdrafts/${voucherId}?api-version=${api_version}`;
  const options = {
    method: 'GET',
    headers: {
      'api-version': `${api_version}`,
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function createVoucherDraft(props, requestBody) {
  const { token, guid } = props;
  await createCustomerPayment(props)

  const url = `https://api.hogia.se/${guid}/voucherdrafts?api-version=${api_version}`;
  const options = {
    method: 'POST',
    headers: {
      'api-version': `${api_version}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };

  try {
    const response = await fetch(url, options);
    if (response.status === 201) {
      const uuid = await response.text();
      console.log('✅ ==> Voucher Draft Created:', uuid);
      return uuid;
    } else {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = errorText;
      }
      console.error('==> Error:', errorData, response?.status);
    }
  } catch (error) {
    console.error('==> Catch:', error);
  }
}

export async function createCustomerInvoices(props, requestBody) {
  const { ssid, order_data, token, guid } = props;

  const url = `https://api.hogia.se/${guid}/customerinvoices?api-version=${api_version}`;
  const options = {
    method: 'POST',
    headers: {
      'api-version': `${api_version}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };

  console.log(JSON.stringify(requestBody));

  fetch(url, options)
  .then(async response => {
    if (!response.ok) {
      const error = await response.text(); 
      throw new Error(`${response.status}: ${error}`);
    }
    return response.json();
  })
  .then(async data => {
    console.log('✅ ==> Customer Invoice Created:', data?.id);

    await updateCustomerInvoices(
      ssid,
      'pending',
      order_data,
      data
    );

    return data?.id;
  })
  .catch(e => {
    console.error('==> Catch:', e);
  });
}

export async function createCustomerPayment(props) {
  const { ssid, order_id, token, guid } = props;
  const customerInvoceDB = await getCustomerInvoice(ssid, order_id);
  const invoice_id = customerInvoceDB?.invoice_id;
  if (!invoice_id) {
    return;
  }

  const url = `https://api.hogia.se/${guid}/customerinvoices/${invoice_id}/payments?api-version=${api_version}`;
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "payer": "Customer",
      "date": new Date().toISOString().split('T')[0],
      "amount": 1099,
      "accountNumber": 3001,
    })
  };

  fetch(url, options)
  .then(async response => {
    if (!response.ok) {
      const error = await response.text(); 
      throw new Error(`${response.status}: ${error}`);
    }
    return response.json();
  })
  .then(async data => {
    console.log('✅ ==> Customer Payment Created:', data?.id);
    await updateCustomerInvoices(
      ssid,
      'done',
      JSON.parse(customerInvoceDB?.order_data ?? ''),
      data
    );
    return data?.id;
  })
  .catch(e => {
    console.error('❌ ==> Catch:', e);
  });
}