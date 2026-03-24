# Design Document: Equipment Kit ID Migration

## Overview

Перевод системы комплектов снаряжения с прямых импортов устаревших JSON-файлов (`light_weapons.json`, `heavy_weapons.json` и др.) на единый источник данных — SQLite базу данных через функции `db/Database.js`. Это устраняет краш при открытии `EquipmentKitModal` для происхождений вроде "Житель НКР".

## Architecture

### Текущая проблема

```
originsData.js:
  { weaponCode: 'hunting_rfl', modCodes: ['power_receiver_plus'] }
         ↓
EquipmentKitModal.js:
  getWeaponByCodeLocal('hunting_rfl')
  → allWeapons.find(w => w.code === 'hunting_rfl')  ← ищет в light_weapons.json
  → undefined  ← нет такого поля 'code' в новом формате
  → baseWeapon.Название  ← CRASH: Cannot read property of undefined
```

### Решение

```
originsData.js:
  { weaponId: 'weapon_XXX', modIds: ['mod_YYY', 'mod_ZZZ'] }
         ↓
EquipmentKitModal.js (async):
  getWeaponById('weapon_XXX')  ← Database.js → таблица weapons
  getWeaponModById('mod_YYY')  ← Database.js → таблица weapon_mods
  getAmmoById(weapon.ammo_id)  ← Database.js → таблица ammo_types
  getItemByName('Прочная одежда')  ← Database.js → таблица items
         ↓
  Всё найдено → отображение без краша
```

## Components and Interfaces

### 1. `originsData.js` — миграция на `weaponId` / `modIds`

Все элементы с `weaponCode` / `modCodes` заменяются на `weaponId` / `modIds`.
Элементы с `name` для оружия заменяются на `weaponId` (нужно найти соответствие в `weapons.json`).
Броня, одежда, химикаты, разное — остаются с `name` (ищутся через `getItemByName`).

**До:**
```js
{ type: 'fixed', weaponCode: 'hunting_rfl', modCodes: ['power_receiver_plus', 'long_optic_sight'], ammunition: '6+3fn{CD}<ammo>' }
{ name: '10-мм Пистолет', ammunition: '8+4fn{CD}<ammo>' }
```

**После:**
```js
{ type: 'fixed', weaponId: 'weapon_XXX', modIds: ['mod_YYY', 'mod_ZZZ'], ammunition: '6+3fn{CD}<ammo>' }
{ weaponId: 'weapon_002', ammunition: '8+4fn{CD}<ammo>' }
```

### 2. `EquipmentKitModal.js` — переход на async + Database.js

Компонент становится полностью асинхронным при инициализации. Вместо синхронного поиска по массивам из JSON — async-запросы к БД.

#### Новый `useEffect` (async)

```js
useEffect(() => {
  if (!visible || !equipmentKits?.length) return;

  const resolveKits = async () => {
    const resolved = await Promise.all(equipmentKits.map(kit => resolveKit(kit)));
    setCalculatedKits(resolved);
    // установка initialChoices...
  };

  resolveKits();
}, [visible, equipmentKits]);
```

#### Новая функция `resolveWeaponItem(item)`

```js
async function resolveWeaponItem(item) {
  if (!item.weaponId) return item; // не оружие из БД

  const weapon = await getWeaponById(item.weaponId);
  if (!weapon) {
    console.warn('[EquipmentKitModal] weapon not found:', item.weaponId);
    return { ...item, displayName: item.weaponId, itemType: 'weapon' };
  }

  // Разрешаем моды
  const mods = [];
  for (const modId of (item.modIds || [])) {
    const mod = await getWeaponModById(modId);
    if (mod) mods.push(mod);
  }

  // Формируем displayName: prefix1 prefix2 BaseName
  const prefixes = mods.map(m => m.prefix).filter(Boolean);
  const displayName = [...prefixes, weapon.name].join(' ');

  // Разрешаем патроны
  let resolvedAmmunition = null;
  if (item.ammunition && weapon.ammo_id) {
    const ammo = await getAmmoById(weapon.ammo_id);
    if (ammo) {
      resolvedAmmunition = resolveAmmoQuantity(item.ammunition, ammo);
    }
  }

  return {
    ...item,
    _weapon: weapon,
    _mods: mods,
    displayName,
    name: displayName,
    itemType: 'weapon',
    resolvedAmmunition,
  };
}
```

#### Новая функция `resolveNonWeaponItem(item)`

```js
async function resolveNonWeaponItem(item) {
  if (!item.name || safeMatch(item.name, /<\w+>/)) return item; // формула — не трогаем

  const dbItem = await getItemByName(item.name);
  if (dbItem) {
    return { ...dbItem, ...item, Название: dbItem.name, itemType: dbItem.item_type || item.itemType };
  }
  return { ...item, Название: item.name };
}
```

#### Функция `resolveAmmoQuantity(formula, ammo)`

Синхронная — использует существующую логику из `ammoLogic.js` (`parseFormula`, `calculateDamage`), но принимает уже готовый объект `ammo` из БД вместо поиска по имени.

```js
function resolveAmmoQuantity(formula, ammo) {
  const { baseValue, diceCount } = parseFormula(formula.replace(/<ammo>/, '').trim());
  const { finalValue: quantity } = calculateDamage(baseValue, diceCount);
  return {
    name: ammo.name,
    Название: ammo.name,
    quantity,
    type: 'ammo',
    Цена: ammo.cost,
    Редкость: ammo.rarity,
  };
}
```

### 3. `ammoLogic.js` — удаление устаревших импортов

Функция `getAmmoTypeForWeapon` больше не нужна в контексте комплектов снаряжения — тип патрона теперь берётся из `weapon.ammo_id`. Импорты `light_weapons.json` и др. удаляются.

Функция `resolveLoot` с тегом `<ammo>` остаётся для обратной совместимости, но её вызов из `EquipmentKitModal` заменяется на `resolveAmmoQuantity`.

### 4. `weaponModificationUtils.js` — удаление устаревших импортов

Функции `getWeaponByCode` и `getModificationByCode` используются в `EquipmentKitModal` для поиска по старым кодам. После миграции `EquipmentKitModal` перестаёт их вызывать. Сами функции могут остаться для других частей приложения (экран модификаций), но импорты старых JSON в контексте комплектов снаряжения убираются.

## Data Models

### KitWeaponItem (в `originsData.js`)
```js
{
  type: 'fixed' | 'choice',
  weaponId: string,        // id из таблицы weapons, например "weapon_007"
  modIds: string[],        // массив id из таблицы weapon_mods, например ["mod_012"]
  ammunition: string,      // формула вида "6+3fn{CD}<ammo>", опционально
}
```

### KitNonWeaponItem (в `originsData.js`)
```js
{
  type: 'fixed' | 'choice',
  name: string,            // имя предмета для поиска в таблице items
  itemType?: string,       // 'chem', 'armor', 'clothing', 'misc' — опционально
  quantity?: number,
}
```

### ResolvedWeaponItem (внутри `EquipmentKitModal`)
```js
{
  weaponId: string,
  _weapon: object,         // строка из таблицы weapons
  _mods: object[],         // строки из таблицы weapon_mods
  displayName: string,     // "Усиленный Длинный Охотничья Винтовка"
  name: string,
  itemType: 'weapon',
  resolvedAmmunition: object | null,
}
```

## Error Handling

- `getWeaponById` возвращает `null` → логируем предупреждение, используем `weaponId` как `displayName`, не крашимся.
- `getWeaponModById` возвращает `null` → мод пропускается, оружие отображается без него.
- `getAmmoById` возвращает `null` → `resolvedAmmunition = null`, патроны не добавляются.
- `getItemByName` возвращает `null` → используем `item.name` как `Название`, не крашимся.
- Любой async-запрос бросает исключение → оборачиваем в `try/catch`, логируем, возвращаем fallback.

## Mapping: старые коды → новые id

Перед миграцией `originsData.js` нужно составить таблицу соответствий. Пример:

| Старый `weaponCode` / `name` | Новый `weaponId` |
|---|---|
| `hunting_rfl` / "Охотничья винтовка" | `weapon_XXX` |
| "10-мм Пистолет" | `weapon_002` |
| "Боевой нож" | `weapon_YYY` |
| `power_receiver_plus` | `mod_ZZZ` |
| `long_optic_sight` | `mod_AAA` |

Эта таблица составляется путём сравнения `weapons.json` (поле `Name`) и `weapon_mods.json` (поле `Name`) с текстовыми именами в `originsData.js`.

## Testing Strategy

- Открыть модальное окно комплектов для каждого происхождения с `equipmentKits` — убедиться что не крашится.
- Проверить "Житель НКР" → "Меткий стрелок" — оружие с модами отображается корректно.
- Выбрать комплект → убедиться что предметы попадают в инвентарь с корректными полями.
- Проверить что патроны добавляются корректно для оружия с `ammo_id`.
- Проверить что броня, одежда, химикаты отображаются и передаются в инвентарь.
