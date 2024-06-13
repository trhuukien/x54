import { useState, useCallback, useMemo, useEffect } from 'react';
import { InMemoryCache, ApolloClient } from '@apollo/client';
import { CachePersistor } from 'apollo-cache-persist';
import typePolicies from "~/Apollo/policies";
import { useLinks } from '~/Apollo/links';
const CACHE_PERSIST_PREFIX = 'apollo-cache-persist';

const preInstantiatedCache = new InMemoryCache({
  typePolicies,
});

export const useAdapter = props => {
  const { origin, domain } = props;
  const [initialized, setInitialized] = useState(false);
  const [apiBase] = useState(() => new URL('/', origin).toString());
  const { getLinks } = useLinks(apiBase);
  const createApolloClient = useCallback((cache, link) => new ApolloClient({ cache, link, ssrMode: false }), []);
  const createCachePersistor = useCallback((cache) => {
    return new CachePersistor({
      key: `${CACHE_PERSIST_PREFIX}-${domain}`,
      cache,
      storage: globalThis.localStorage,
      // eslint-disable-next-line no-undef
      debug: process.env.NODE_ENV === 'development',
    });
  }, [domain]);
  const clearCacheData = useCallback(async (client, cacheType) => {
    // client.cache.evict({ id: 'TypeName' });
    // client.cache.evict({ fieldName: 'queryName' });
    client.cache.gc();
    if (client.persistor) {
      await client.persistor.persist();
    }
  }, []);
  const apolloLink = getLinks();
  const apolloClient = useMemo(() => {
    const client = createApolloClient(preInstantiatedCache, apolloLink);

    client.apiBase = apiBase;
    client.persistor = createCachePersistor(preInstantiatedCache);
    client.clearCacheData = clearCacheData;

    return client;
  }, [domain]);
  useEffect(() => {
    if (initialized) return;

    (async () => {
      await apolloClient.persistor.restore();
      // attach the Apollo client to the Redux store
      // await attachClient(apolloClient);
      setTimeout(() => {
        setInitialized(true);
      }, 300)
    })();
  }, [apolloClient, initialized]);

  return {
    client: apolloClient,
    initialized,
  };
};
