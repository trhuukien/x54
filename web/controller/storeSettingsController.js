import prisma from '../context/prisma.js';

export const getStoreConfig = async (req, res) => {
  try {
    const paths = req.query.paths;
    if (!paths) {
      const error = new Error('Paths are required. Please provide a list of paths to retrieve.');
      error.data = { code: 'missing_paths' };
      throw error;
    }
    const configs = await prisma.config.findMany({
      where: {
        session_id: res.locals.shopify.session.id,
        path: {
          in: req.query.paths
        }
      }
    });
    const result = paths.map(path => {
      const config = configs.find(c => c.path === path);
      return { path, value: config?.value || null };
    });
    res.status(200).send(result);
  } catch (e) {
    if (e instanceof Error) {
      !e.data?.code && console.log(e);
      return res.status(400).send({
        errors: [{
          message: e.message,
          code: e.data?.code || 'unknown_error'
        }]
      });
    } else {
      console.log(e);
      return res.status(400).send({
        errors: [{
          message: e,
          code: 'unknown_error'
        }]
      });
    }
  }
};

function validateStoreConfig(input) {
  const er = new Error();
  er.data = { code: 'invalid_input' };

  // validate input must be array
  if (!input || !Array.isArray(input)) {
    er.message = 'Invalid input. Please provide a list of config input.';
    throw er;
  }

  // validate each store config must have path
  input.forEach(config => {
    if (!config.path || config.value === undefined) {
      er.message = 'Invalid input. Each store config must have a path and a value.';
      throw er;
    }
  });
}

export const storeConfig = async(req, res) => {
  try {
    /** @type {Array<{path: string, value: string}>} */
    const input = req.body;
    validateStoreConfig(input);
    const updatedData = [];
    for (const i of input) {
      updatedData.push(await prisma.config.upsert({
        where: { session_id_path: { session_id: res.locals.shopify.session.id, path: i.path } },
        update: { value: i.value },
        create: { session_id: res.locals.shopify.session.id, path: i.path, value: i.value }
      }))
    }

    res.status(200).send(updatedData.map(d => ({ path: d.path, value: d.value })));
  } catch (e) {
    if (!e.data?.code) {
      console.log(e);
    }
    res.status(400).send({
      errors: [{
        message: e.message,
        code: e.data?.code || 'unknown_error'
      }]
    });
  }
}
