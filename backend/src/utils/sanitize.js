export const trimString = (value) =>
  typeof value === "string" ? value.trim() : value;

export const normalizeEmail = (value) => {
  const trimmed = trimString(value);
  return typeof trimmed === "string" ? trimmed.toLowerCase() : trimmed;
};

export const trimPayload = (payload, fields) => {
  return fields.reduce((result, field) => {
    if (payload[field] !== undefined) {
      result[field] = trimString(payload[field]);
    }

    return result;
  }, {});
};
