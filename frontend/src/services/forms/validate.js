export const validateForm = (values, rules) => {
  let errors = {};

  Object.keys(rules).forEach(fieldName => {
    const validators = rules[fieldName];

    if (validators) {
      const value = values[fieldName] || undefined;
      validators.forEach(v => {
        if (!v.isValid(value)) errors[fieldName] = v.errorName;
      });
    }
  });

  return errors;
};