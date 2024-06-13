import { getApiTokenData } from '../utils/hogia.js';

export const verifyConnection = async (req, res) => {
  const { client_id, client_secret } = req.body;

  try {
    const token = await getApiTokenData(client_id, client_secret);

    if (token?.access_token) {
      res.status(200).send({
        success: true,
        message: 'Connection successful.',
      });
      return;
    }
  } catch (e) {
    console.log(e);
  }

  res.status(200).send({
    success: false,
    message: 'Connection failed',
  });
  return;
};