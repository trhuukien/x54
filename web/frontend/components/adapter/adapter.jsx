import { memo } from 'react';
import { useAdapter } from '~/talons/adapter/useAdapter';
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from '@apollo/client';
import { Loading } from '@shopify/app-bridge-react';
import { Spinner } from '@shopify/polaris';
import PropTypes from 'prop-types';

import {
  AppBridgeProvider,
  PolarisProvider,
} from "~/components";

export const ShopifyLoadingFull = () => {
  return (
    <div className='grid grid-rows-1 justify-center h-fill-available items-center'>
      <Loading />
      <Spinner accessibilityLabel={'Loading'} />
    </div>
  );
};

const ApolloClientProvider = props => {
  const { children } = props;
  const talonProps = useAdapter(props);
  const { client, initialized } = talonProps;
  if (!initialized || !props.domain)
    return <ShopifyLoadingFull />
  return <ApolloProvider client={client} children={children} />;
};

const Adapter = props => {
  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <ApolloClientProvider {...props} />
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
};

Adapter.propTypes = {
  children: PropTypes.node,
  domain: PropTypes.string.isRequired,
  origin: PropTypes.string.isRequired,
};

export default memo(Adapter);
