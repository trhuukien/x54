import { BlockStack, Box, Button, Card, InlineGrid, Text } from '@shopify/polaris';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomTextField from '~/components/settings/hogia/textField';
import TestConnectionButton from '~/components/settings/hogia/testConnection';
import { Loading } from "@shopify/app-bridge-react";
import { useHogia } from '~/talons/settings/hogia/useHogia';

const HogiaUI = props => {
  const { t } = useTranslation();
  const { config, isLoading, buildConfig, registerField } = useHogia();

  return (
    <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap='400'>
      {isLoading && <Loading />}
      <Box as='section' paddingInlineStart={{ xs: '400', sm: '0' }} paddingInlineEnd={{ xs: '400', sm: '0' }}>
        <BlockStack gap='400'>
          <Text as='h3' variant='headingMd'>
            Authenticate
          </Text>
          <Text as='p' variant='bodyMd'>
            API Hogia Access Information
          </Text>
        </BlockStack>
      </Box>
      <Card roundedAbove='sm'>
        <BlockStack gap='400'>
          <CustomTextField
            ref={ref => registerField('client_id', ref)}
            label={"Client ID"}
            autoComplete={'off'}
            initValue={config?.client_id}
          />
          <CustomTextField
            ref={ref => registerField('client_secret', ref)}
            label={"Client Secret"}
            type='password'
            autoComplete={'off'}
            initValue={config?.client_secret}
          />
          <CustomTextField
            ref={ref => registerField('guid', ref)}
            label={"GUID"}
            autoComplete={'off'}
            initValue={config?.guid}
          />
          <TestConnectionButton buildBody={buildConfig} />
        </BlockStack>
      </Card>
    </InlineGrid>
  );
};

export default memo(HogiaUI);
