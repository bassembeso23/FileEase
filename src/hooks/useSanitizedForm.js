import { sanitizeString } from '../services/utils/sanitizeString';
import { useForm as useRHF } from 'react-hook-form';

/**
 * Custom hook that extends react-hook-form with sanitization capabilities
 * @template {Object} TFieldValues
 * @param {Object} [props] - Form configuration options
 * @param {Function} [sanitizer] - Custom sanitizer function
 * @returns {Object} Form methods with sanitization
 */
export const useSanitizedForm = (props, sanitizer) => {
    const methods = useRHF(props);
    const originalSetValue = methods.setValue;

    const setValue = (name, value, options, sanitizerOverride) => {
        const sanitizedValue =
            typeof value === 'string'
                ? sanitizerOverride?.(value)
                ?? sanitizer?.(value)
                ?? sanitizeString(value)
                : value;

        return originalSetValue(name, sanitizedValue, options);
    };

    const originalRegister = methods.register;
    const register = (name, options, sanitizerOverride) => {
        const field = originalRegister(name, options);

        const onChange = (e) => {
            const value = e.target.value;

            setValue(name, value, {
                shouldDirty: true,
                shouldValidate: true,
            }, sanitizerOverride);
        };

        return {
            ...field,
            onChange,
        };
    };
    const handleSubmit = (onValid, onInvalid, sanitizerOverride) => {
        return methods.handleSubmit((data) => {
            const sanitized = Object.fromEntries(
                Object.entries(data).map(([key, val]) => [
                    key,
                    typeof val === 'string'
                        ? sanitizerOverride?.(val)
                        ?? sanitizer?.(val)
                        ?? sanitizeString(val)
                        : val,
                ])
            );

            return onValid(sanitized);
        }, onInvalid);
    };

    return {
        ...methods,
        setValue,
        register,
        handleSubmit,
    };
};