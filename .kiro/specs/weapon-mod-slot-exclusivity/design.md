# Design Document: Weapon Mod Slot Exclusivity

## Overview

Текущая система модификаций накапливает бонусы при повторном открытии модального окна, потому что `getBaseWeaponFromCode` не восстанавливает базовые характеристики — он просто копирует текущие (уже модифицированные) значения. Решение: хранить базовые характеристики оружия и список установленных модификаций по категориям прямо в объекте оружия, и всегда пересчитывать характеристики от базы.

## Architecture

### Текущая проблема

```
Открытие мода 1 (ресивер +1):
  weapon (base: урон=5) → applyModification → weapon (урон=6)
  сохраняется в equippedWeapons

Открытие мода 2 (ресивер +3):
  weapon (урон=6) передаётся в модальное окно
  getBaseWeaponFromCode возвращает weapon (урон=6) — НЕ базу!
  applyModification(урон=6, +3) → weapon (урон=9) ← НЕВЕРНО
```

### Решение

Хранить в объекте оружия:
- `_baseStats` — снимок базовых характеристик при первой модификации
- `_installedMods` — словарь `{ [category]: modObject }` установленных модов

При применении модификации:
1. Если `_baseStats` нет — сохранить текущие характеристики как базу
2. Обновить `_installedMods[category] = newMod` (заменяет старый)
3. Пересчитать характеристики: начать с `_baseStats`, применить все моды из `_installedMods`

```
Открытие мода 1 (ресивер +1):
  _baseStats = { урон: 5 }
  _installedMods = { ресивер: mod+1 }
  результат: урон = 5 + 1 = 6 ✓

Открытие мода 2 (ресивер +3):
  _baseStats = { урон: 5 } (уже сохранён)
  _installedMods = { ресивер: mod+3 } (заменяет mod+1)
  результат: урон = 5 + 3 = 8 ✓
```

## Components and Interfaces

### 1. Изменения в `weaponModificationUtils.js`

#### Новая функция `getOrCreateBaseStats(weapon)`
Возвращает базовые характеристики оружия. Если `_baseStats` уже есть — возвращает их. Иначе создаёт снимок текущих характеристик.

```js
export const getOrCreateBaseStats = (weapon) => {
  if (weapon._baseStats) return weapon._baseStats;
  return {
    Урон: weapon.Урон,
    'Скорость стрельбы': weapon['Скорость стрельбы'],
    Дистанция: weapon['Дистанция'],
    Вес: weapon.Вес,
    Цена: weapon.Цена,
    Эффекты: weapon.Эффекты,
    Качества: weapon.Качества,
    Патроны: weapon.Патроны,
    Название: weapon.Название,
  };
};
```

#### Обновлённая функция `applyModificationToSlot(weapon, category, mod)`
Главная функция замены мода в слоте. Заменяет `applyMultipleModifications` в контексте UI.

```js
export const applyModificationToSlot = (weapon, category, mod) => {
  const baseStats = getOrCreateBaseStats(weapon);
  const installedMods = { ...(weapon._installedMods || {}), [category]: mod };
  
  // Пересчёт от базы
  let result = { ...weapon, ...baseStats, _baseStats: baseStats, _installedMods: installedMods };
  
  for (const installedMod of Object.values(installedMods)) {
    result = applyModification(result, installedMod);
  }
  
  // Обновляем название
  result.Название = getModifiedWeaponName({ ...baseStats }, Object.values(installedMods));
  
  return result;
};
```

#### Обновлённая функция `applyMultipleModificationsFromSlots(weapon, installedMods)`
Пересчитывает оружие от базы с учётом всех переданных модов (используется при загрузке персонажа).

### 2. Изменения в `WeaponModificationModal.js`

#### Инициализация состояния
При открытии модального окна загружать `weapon._installedMods` как начальное состояние `selectedModifications`.

```js
React.useEffect(() => {
  if (weapon && visible) {
    // Загружаем уже установленные моды как выбранные
    const existing = weapon._installedMods || {};
    setSelectedModifications(existing);
    setModifiedWeapon(weapon);
  }
}, [weapon, visible]);
```

#### Обработчик выбора мода `handleSelectModification`
Использовать `applyModificationToSlot` вместо `applyMultipleModifications`.

```js
const handleSelectModification = (mod) => {
  const newSelected = { ...selectedModifications, [mod.category]: mod };
  setSelectedModifications(newSelected);
  
  // Пересчёт от базы через новую утилиту
  const newWeapon = applyModificationToSlot(weapon, mod.category, mod);
  // Применяем остальные уже выбранные моды из других категорий
  setModifiedWeapon(newWeapon);
};
```

### 3. Структура данных оружия

Объект оружия в `equippedWeapons` расширяется двумя служебными полями:

```js
{
  // Стандартные поля оружия
  Название: "Автоматический 10-мм Пистолет",
  Урон: 8,
  'Скорость стрельбы': 3,
  // ...

  // Служебные поля системы модификаций
  _baseStats: {
    Название: "10-мм Пистолет",
    Урон: 5,
    'Скорость стрельбы': 2,
    // ...
  },
  _installedMods: {
    "Ресивер": { name: "Для автоогня", data: { Эффекты: "+3 урона, ..." }, category: "Ресивер" },
    "Ствол": { name: "Длинный", data: { Эффекты: "Увеличение дистанции на 1 зону" }, category: "Ствол" }
  }
}
```

## Data Models

### WeaponInstalledMod
```js
{
  name: string,       // Название мода (например "Для автоогня")
  category: string,   // Категория слота (например "Ресивер")
  data: object        // Данные мода из JSON (Эффекты, Вес, Цена, Префикс имени и т.д.)
}
```

### WeaponBaseStats
```js
{
  Название: string,
  Урон: number,
  'Скорость стрельбы': number,
  Дистанция: string,
  Вес: number,
  Цена: number,
  Эффекты: string,
  Качества: string,
  Патроны: string
}
```

## Error Handling

- Если `_baseStats` отсутствует при применении мода — создаётся из текущих характеристик (обратная совместимость с уже сохранёнными персонажами).
- Если `_installedMods` отсутствует — считается пустым объектом.
- Если мод из `_installedMods` не найден в данных JSON при загрузке — он игнорируется, не вызывая ошибку.

## Название оружия с несколькими модами

Функция `getModifiedWeaponName` уже поддерживает несколько префиксов. При пересчёте оружия передаём все моды из `_installedMods`:

```
_installedMods = {
  Ресивер: { data: { 'Префикс имени': 'Калиброванный' } },
  Ствол:   { data: { 'Префикс имени': 'Длинный' } },
  Рукоять: { data: { 'Префикс имени': 'Удобный' } }
}
→ Название: "Калиброванный Длинный Удобный 10-мм Пистолет"
```

## Сохранение модификаций при снятии оружия

Поля `_baseStats` и `_installedMods` хранятся прямо в объекте оружия. Это означает:
- При снятии оружия в инвентарь объект сохраняется как есть — модификации не теряются.
- При надевании оружия из инвентаря модификации восстанавливаются автоматически.
- При сохранении/загрузке персонажа эти поля сериализуются вместе с остальными данными оружия (они уже входят в `equippedWeapons`, который сохраняется в `characters.data`).

Никаких дополнительных механизмов хранения не требуется — объект оружия самодостаточен.

## Testing Strategy

Ручная проверка сценариев:
- Установить ресивер +1 → проверить урон.
- Заменить на ресивер +3 → проверить что урон = база + 3, не база + 1 + 3.
- Снять оружие в инвентарь и надеть снова → проверить что модификации сохранились.
- Установить моды из 3 разных категорий → проверить название и характеристики.
