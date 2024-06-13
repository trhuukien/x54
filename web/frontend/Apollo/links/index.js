import { httpLink } from '~/Apollo/links/httpLink';
import { useAppBridge } from '@shopify/app-bridge-react';
import { checkForReauthorizationLink } from '~/Apollo/links/checkForReauthorizationLink';
import { from } from '@apollo/client';

export const useLinks = uri => {
  const app = useAppBridge();
  return {
    getLinks: () => from([
      checkForReauthorizationLink(app),
      httpLink(uri, app),
    ]),
  };
};
