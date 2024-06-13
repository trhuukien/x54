import { NavigationMenu } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation();

  return (
    <NavigationMenu
      navigationLinks={[
        {
          label: "Settings",
          destination: "/settings",
        }
      ]}
    />
  );
};