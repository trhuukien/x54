import { Frame, Page, Divider, BlockStack, useBreakpoints } from '@shopify/polaris';
import { memo } from 'react';
import HogiaSettings from '~/components/settings/hogia';
import SettingProvider, { useSettingContext } from '~/context/settings';

const Settings = () => {
  const { smUp } = useBreakpoints();
  const [{ loading, shouldDisableSaveAction }, { saveConfigs }] = useSettingContext();

  return (
    <Frame>
      <Page divider primaryAction={{ content: 'Save', disabled: shouldDisableSaveAction, onAction: saveConfigs, loading }}>
        <BlockStack gap={{ xs: '800', sm: '400' }}>
          <HogiaSettings  />
          {smUp ? <Divider /> : null}
        </BlockStack>
        <div className='mb-8' />
      </Page>
    </Frame>
  );
};

export default memo((props) => {
  return (
    <SettingProvider>
      <Settings {...props} />
    </SettingProvider>
  );
});
