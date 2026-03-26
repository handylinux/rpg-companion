import ruCharacterScreen from "../../../../i18n/ru-RU/CharacterScreen.json";

export const CANONICAL_ATTRIBUTE_KEYS = [
  "STR",
  "END",
  "PER",
  "AGI",
  "INT",
  "CHA",
  "LCK",
];

const ATTRIBUTE_KEY_ALIASES = {
  STR: "STR",
  END: "END",
  PER: "PER",
  AGI: "AGI",
  INT: "INT",
  CHA: "CHA",
  LCK: "LCK",
  СИЛ: "STR",
  ВЫН: "END",
  ВСП: "PER",
  ВОС: "PER",
  ЛОВ: "AGI",
  ИНТ: "INT",
  ХАР: "CHA",
  УДЧ: "LCK",
};

export const getCanonicalAttributeKey = (key) => ATTRIBUTE_KEY_ALIASES[key] || null;

export const getAttributeLabel = (key) => {
  const canonical = getCanonicalAttributeKey(key);
  if (!canonical) return "Ошибка ключа";
  return ruCharacterScreen?.attributes?.[canonical] || canonical;
};

export const normalizeAttributeMap = (attributeMap = {}) =>
  Object.entries(attributeMap).reduce((acc, [key, value]) => {
    const canonical = getCanonicalAttributeKey(key);
    if (canonical) acc[canonical] = value;
    return acc;
  }, {});

export const getAttributeValue = (attributes = [], key) => {
  const canonical = getCanonicalAttributeKey(key);
  if (!canonical) return null;

  const found = attributes.find(
    (attr) => getCanonicalAttributeKey(attr.name) === canonical,
  );

  return found?.value ?? 0;
};
