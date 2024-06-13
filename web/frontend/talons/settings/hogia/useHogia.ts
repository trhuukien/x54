import { useConfig } from '~/hooks/useConfig';
// @ts-ignore
import { CONFIG_PATH_HOGIA_SETTINGS } from '~/../constants';
import { useSettingContext } from '~/context/settings';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SettingContextType } from '~/@types/settings';

const configPath: string = CONFIG_PATH_HOGIA_SETTINGS;

interface HogiaConfig {
  client_id: string;
  client_secret: string;
  guid: string;
}

interface CustomTextFieldRef {
  getValue: () => string;
  validate: () => boolean;
  focus: () => void;
  setValue: (value: string) => void;
}

// generate type for const registeredFields = useRef({});
type RegisteredFields<T extends keyof any> = {
  [K in T]: CustomTextFieldRef;
};

type RegisteredHogiaFields = RegisteredFields<keyof HogiaConfig>;

export const useHogia = () => {
  const { config: loadedConfig, loading, save } = useConfig([CONFIG_PATH_HOGIA_SETTINGS]);
  // useSettingContext is a custom hook that returns the context value
  const [, { registerSaveHandler, registerLoading }] = useSettingContext() as unknown as SettingContextType;
  const registeredFields = useRef<RegisteredHogiaFields>({} as RegisteredHogiaFields);
  const registerField = useCallback((name: string, ref: CustomTextFieldRef) => (registeredFields.current[name as keyof HogiaConfig] = ref), []);
  const config = useMemo<HogiaConfig>(() => {
    return loadedConfig?.[CONFIG_PATH_HOGIA_SETTINGS] || {};
  }, [loadedConfig]);
  const buildConfig = useCallback(() => {
    return Object.entries(registeredFields.current).reduce((acc: HogiaConfig, [name, ref]) => {
      if (typeof ref.validate === 'function' && !ref.validate()) {
        if (typeof ref.focus === 'function') ref.focus();
        throw new Error('Invalid form data.')
      }
      acc[name as keyof HogiaConfig] = ref.getValue();
      return acc;
    }, {} as HogiaConfig);
  }, []);
  const saveConfig = useCallback(async () => {
    const builtConfigInput: HogiaConfig = buildConfig();
    await save([{ path: configPath, value: builtConfigInput }]);
  }, []);

  useEffect(() => {
    registerSaveHandler('hogia', saveConfig);
  }, [saveConfig]);
  useEffect(() => {
    registerLoading('hogia', loading);
  }, [loading]);

  return {
    isLoading: loading,
    registerField,
    config,
    buildConfig,
  }
};
