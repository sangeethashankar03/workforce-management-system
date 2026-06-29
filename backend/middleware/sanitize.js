const sanitizeText = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/<[^>]*>?/gm, "").trim();
};

const sanitizeFields = (body, fields) => {
  const result = { ...body };
  fields.forEach((field) => {
    if (result[field] !== undefined) {
      result[field] = sanitizeText(result[field]);
    }
  });
  return result;
};

module.exports = { sanitizeText, sanitizeFields };