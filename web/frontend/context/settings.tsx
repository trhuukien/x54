import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useToast } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { SettingContextType, FieldsLoadingType, SaveConfigHandlerListType, SaveConfigHandlerType, SettingProviderProps } from '~/@types/settings';

const SettingContext = createContext<SettingContextType>(undefined as unknown as SettingContextType);

const SettingProvider: React.FC<SettingProviderProps> = ({ children }) => {
  const handlers = useRef<SaveConfigHandlerListType>({} as SaveConfigHandlerListType);
  const [loading, setLoading] = useState<boolean>(false);
  const [subLoading, setSubLoading] = useState<FieldsLoadingType>({});
  const toast = useToast();
  const { t } = useTranslation();
  const registerSaveHandler = useCallback((id: string, handler: SaveConfigHandlerType) => {
    handlers.current[id] = handler;
  }, []);

  const registerLoading = useCallback((id: string, isLoading: boolean) => {
    setSubLoading(prev => ({ ...prev, [id]: isLoading }));
  }, []);

  const shouldDisableSaveAction = useMemo<boolean>(() => {
    return Object.values(subLoading).some(Boolean) || loading;
  }, [subLoading, loading]);

  const saveConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const promises = Object.values(handlers.current).map(handler => handler());
      await Promise.all(promises);
      setLoading(false);
      toast.show('Saved successfully', { isError: false });
    } catch (e: any) {
      console.log(e);
      toast.show(e.message, { isError: true });
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo<SettingContextType>(() => {
    return [
      { loading, shouldDisableSaveAction },
      { saveConfigs, registerSaveHandler, registerLoading },
    ];
  }, [registerSaveHandler, saveConfigs, loading, registerLoading, shouldDisableSaveAction]);
  return <SettingContext.Provider value={contextValue} children={children} />;
};

export default SettingProvider;
export const useSettingContext = () => useContext(SettingContext);
