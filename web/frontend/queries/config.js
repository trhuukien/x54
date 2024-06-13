import { gql } from '@apollo/client';

export const GET_CONFIG_QUERY = gql`
  query GetStoreConfig($paths: [String!]) {
    storeConfig(paths: $paths) @rest(type: "StoreConfig", path: "api/config?{args}") {
      path value
    }
  }
`;

export const SAVE_CONFIG_MUTATION = gql`
  mutation SaveStoreConfig($input: [StoreConfigInput!]!) {
    saveStoreConfig(input: $input) @rest(type: "StoreConfig", path: "api/config", method: "PUT") {
      path value
    }
  }
`;
