/**
 * Custom Register function type that includes an optional sanitizerOverride param - important for customizing/exempting certain fields' sanitization.
 * @template {Object} TFieldValues
 * @param {string} name
 * @param {Object} [options]
 * @param {Function} [sanitizerOverride]
 * @returns {Object}
 */

/**
 * Extended return type for useSanitizedForm with overridden register, setValue, handleSubmit.
 * @template {Object} TFieldValues
 * @typedef {Object} UseSanitizedFormReturn
 * @property {Function} register
 * @property {Function} setValue
 * @property {Function} handleSubmit
 */

export {};
