import { memo, useCallback, useImperativeHandle, useState, forwardRef, useRef, useEffect, useMemo } from 'react';
import { TextField as PTextField } from '@shopify/polaris';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const TextField = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { initValue, required, validator, onChange, focusOnInvalid, ...rest } = props;
  const [sValue, setValue] = useState(undefined);
  const value = useMemo(() => sValue !== undefined ? sValue : initValue, [initValue, sValue])
  const handleValueChange = useCallback((value) => {
    setValue(value);
    if (typeof onChange === 'function') onChange(value);
  }, [onChange]);
  const [error, setError] = useState(undefined);
  const [focused, setFocused] = useState(false);
  const blur = useCallback(() => setFocused(false), []);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => value,
      setValue: handleValueChange,
      validate: () => {
        setFocused(false);
        setError(undefined);
        if (typeof validator === 'function') {
          const result = validator(value);
          if (result !== true) {
            setError(result);
            return false;
          }
        }
        if (required && !value) {
          setError(t('Global.validation.required'));
          return false;
        }
        return true;
      },
      focus: () => setFocused(true),
    }
  });

  // console.log({ initValue, value, focused });

  return (
    <PTextField value={value} onChange={handleValueChange} requiredIndicator={required} focused={focused} onBlur={blur} error={error} {...rest} />
  );
});

TextField.displayName = 'XpifyTextField';
TextField.defaultProps = {
  initValue: '',
  required: false,
  focusOnInvalid: false,
};
TextField.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  initValue: PropTypes.string,
  required: PropTypes.bool,
  focusOnInvalid: PropTypes.bool,
  validator: PropTypes.func,
};

export default memo(TextField);
