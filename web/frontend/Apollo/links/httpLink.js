import { RestLink } from 'apollo-link-rest';
import { authenticatedFetch } from "@shopify/app-bridge/utilities";

export const httpLink = (uri, app) => {
  const fetchFunction = authenticatedFetch(app);
  return new RestLink({
    uri,
    customFetch: fetchFunction,
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
  })
};
