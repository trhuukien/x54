import { useMutation, useQuery } from '@apollo/client';
import { GET_CONFIG_QUERY, SAVE_CONFIG_MUTATION } from '~/queries/config';
import { useCallback, useMemo } from 'react';

export const useConfig = (paths) => {
  const { data, loading } = useQuery(GET_CONFIG_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    variables: { paths },
  });
  const [saveConfigMutation] = useMutation(SAVE_CONFIG_MUTATION);

  const config = useMemo(() => {
    const reducer = (accumulator, currentValue) => {
      // try to parse JSON data and set to accumulator
      try {
        accumulator[currentValue.path] = JSON.parse(currentValue.value);
      } catch (e) {
        accumulator[currentValue.path] = currentValue.value;
      }
      return accumulator;
    };
    if (!data?.storeConfig) return undefined;
    return data.storeConfig.reduce(reducer, {});
  }, [data]);

  const save = useCallback(async (input) => {
    // save the config
    // handle input, stringify if necessary
    const processedInput = input.map(({ path, value }) => {
      return {
        path,
        value: typeof value === 'object' || Array.isArray(value) ? JSON.stringify(value) : value,
      };
    });
    return await saveConfigMutation({
      variables: {
        input: processedInput,
      },
    });
  }, []);

  return { config, loading, save };
};
