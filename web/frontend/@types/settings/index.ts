import React from 'react';

type SettingContextState = {
  loading: boolean;
  shouldDisableSaveAction: boolean;
};
export type SettingContextAction = {
  saveConfigs: () => void;
  registerSaveHandler: (id: string, handler: () => void) => void;
  registerLoading: (id: string, loading: boolean) => void;
};
// export a type for the settingContext with type is array
export type SettingContextType = [SettingContextState, SettingContextAction];

export type FieldsLoadingType = {
  [key: string]: boolean;
};

export type SaveConfigHandlerType = () => void;
export type SaveConfigHandlerListType = {
  [key: string]: SaveConfigHandlerType;
};

export type SettingProviderProps = {
  children: React.ReactNode;
};
