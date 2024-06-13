/**
 * Custom type policies that allow us to have more granular control
 * over how ApolloClient reads from and writes to the cache.
 *
 * https://www.apollographql.com/docs/react/caching/cache-configuration/#typepolicy-fields
 * https://www.apollographql.com/docs/react/caching/cache-field-behavior/
 */

const typePolicies = {
  Query: {
    fields: {
      jobs: {
        merge(existing, incoming) {
          return incoming;
        }
      }
    }
  },
  FtpConfig: {
    keyArgs: ['path'],
    merged: true,
  },
  Job: {
    keyFields: ['schedule_id'], // use keyFields to reference the unique identifier for the Job
    fields: {
      status: {
        merge(existing, incoming) {
          return incoming;
        }
      }
    },
  },
  StoreConfig: {
    keyArgs: ['path'],
    keyFields: ['path'],
  },
  FtpConfigFields: {
    fields: {
      password: {
        read () {
          return '********';
        }
      },
    }
  },
};

export default typePolicies;
