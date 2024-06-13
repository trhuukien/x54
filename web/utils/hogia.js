import fetch from 'node-fetch';
import { getConfig, updateConfig } from '../config.js';

//getApiToken('offline_quickstart-249efe07.myshopify.com');

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
  
  const url = `https://api.hogia.se/${guid}/voucherdrafts/${voucherId}?api-version=2024-06-12`;
  const options = {
    method: 'GET',
    headers: {
      'api-version': '2024-06-12',
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

  const url = `https://api.hogia.se/${guid}/voucherdrafts?api-version=2024-06-11`;
  const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'api-version': '2024-06-11'
      },
      body: JSON.stringify(requestBody)
  };

  try {
      const response = await fetch(url, options);
      if (response.status === 201) {
          const uuid = await response.text();
          console.log('Token:', token);
          console.log('Created:', uuid);
          return uuid;
      } else {
        const errorText = await response.text();
        let errorData;
        try {
            errorData = JSON.parse(errorText);
        } catch (e) {
            errorData = errorText;
        }
        console.error('Error:', errorData);
      }
  } catch (error) {
      console.error('Error:', error);
  }
}