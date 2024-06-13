import { onError } from '@apollo/client/link/error';
import { Redirect } from "@shopify/app-bridge/actions";

/**
 * @desc Kiểm tra xem có cần chuyển hướng merchant xác thực lại không
 * @param {Object} app
 */
export const checkForReauthorizationLink = (app) => {
  return onError(response => {
    const networkError = response.networkError;
    const { headers } = networkError?.response || {};
    if (networkError) {
      if (networkError.name === 'Error' && networkError.statusCode === 403) {
        if (headers && headers.get('X-Shopify-Api-Request-Failure-Reauthorize') === '1') {
          const redirect = Redirect.create(app);
          const authUrlHeader = headers.get('X-Shopify-API-Request-Failure-Reauthorize-Url');
          if (!authUrlHeader) {
            return;
          }
          const decodedAuthUrlHeader = decodeURIComponent(authUrlHeader);
          redirect.dispatch(
            Redirect.Action.REMOTE,
            decodedAuthUrlHeader.startsWith("/") ? `https://${window.location.host}${authUrlHeader}` : decodedAuthUrlHeader
          );
        }
      }
    }
  })
}