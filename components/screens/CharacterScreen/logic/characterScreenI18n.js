import ruCharacterScreen from "../../../../i18n/ru-RU/CharacterScreen.json";

export const tCharacterScreen = (path, fallback = "") => {
  const parts = path.split(".");
  let current = ruCharacterScreen;

  for (const part of parts) {
    current = current?.[part];
    if (current === undefined) return fallback || "Ошибка ключа";
  }

  return current;
};
