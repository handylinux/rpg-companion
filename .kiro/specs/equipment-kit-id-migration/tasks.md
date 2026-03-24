# Implementation Plan

- [x] 1. Составить таблицу соответствий и обновить `originsData.js`





  - Сопоставить все текстовые имена оружия в `originsData.js` с `id` из `weapons.json` (поле `Name`)
  - Сопоставить все `weaponCode` / `modCodes` с `id` из `weapon_mods.json` (поле `Name` / `id`)
  - Заменить все `{ name: 'Оружие', ammunition: '...' }` на `{ weaponId: 'weapon_XXX', ammunition: '...' }`
  - Заменить все `{ weaponCode: '...', modCodes: [...] }` на `{ weaponId: 'weapon_XXX', modIds: ['mod_YYY'] }`
  - Броня, одежда, химикаты, разное — оставить с `name` (ищутся через `getItemByName`)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Создать утилиту `kitResolver.js` для async-разрешения предметов комплекта





  - [x] 2.1 Реализовать `resolveWeaponItem(item)` — async, принимает элемент с `weaponId`


    - Вызывает `getWeaponById(item.weaponId)` из `Database.js`
    - Для каждого `id` из `item.modIds` вызывает `getWeaponModById(modId)`
    - Формирует `displayName` из `prefix` модов + `weapon.name`
    - Если `item.ammunition` и `weapon.ammo_id` — вызывает `getAmmoById(weapon.ammo_id)` и считает количество через `parseFormula` / `calculateDamage` из `Calculator.js`
    - При любом `null` из БД — логирует предупреждение, возвращает fallback без краша
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2_
  - [x] 2.2 Реализовать `resolveNonWeaponItem(item)` — async, принимает элемент с `name`


    - Если `name` содержит формулу `<tag>` — возвращает `item` без изменений (обрабатывается `resolveRandomLoot`)
    - Иначе вызывает `getItemByName(item.name)` из `Database.js`
    - Возвращает обогащённый объект с `Название`, `item_type`, `weight`, `price`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 2.3 Реализовать `resolveKitItems(kit)` — async, обходит все категории комплекта


    - Для каждого элемента: если есть `weaponId` → `resolveWeaponItem`, иначе → `resolveNonWeaponItem`
    - Для `type: 'choice'` — разрешает каждый `option` аналогично
    - Возвращает новый объект комплекта с разрешёнными предметами
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 3. Переписать `EquipmentKitModal.js` для работы через `kitResolver.js`





  - [x] 3.1 Заменить `useEffect` на async-версию с `resolveKits`


    - Вызывает `resolveKitItems(kit)` для каждого комплекта через `Promise.all`
    - Добавить состояние `isLoading` — показывать индикатор пока данные загружаются
    - _Requirements: 5.1, 5.5_

  - [x] 3.2 Удалить все прямые импорты устаревших JSON-файлов


    - Удалить импорты: `melee_weapons.json`, `light_weapons.json`, `heavy_weapons.json`, `energy_weapons.json`, `armor.json`, `Clothes.json`, `miscellaneous.json`, `ammoData.json`, `chems.json`, `light_weapon_mods.json`
    - Удалить импорты `getWeaponByCode`, `getModificationByCode`, `applyMultipleModifications`, `getWeaponModifications` из `weaponModificationUtils.js` (больше не нужны здесь)
    - Добавить импорт `resolveKitItems` из нового `kitResolver.js`
    - _Requirements: 7.1, 7.3_

  - [x] 3.3 Обновить `handleSelectKit` для работы с новой структурой данных

    - Оружие теперь имеет `weaponId`, `_weapon`, `_mods` вместо `weaponCode` / `code`
    - Патроны уже разрешены в `resolvedAmmunition` на этапе `resolveKitItems`
    - Итоговый объект оружия для инвентаря: `{ Название, weaponId, appliedMods, quantity, ...weapon fields }`
    - _Requirements: 7.3_

- [x] 4. Обновить `ammoLogic.js` — удалить устаревшие импорты





  - Удалить импорты `light_weapons.json`, `heavy_weapons.json`, `energy_weapons.json`, `melee_weapons.json`
  - Удалить функцию `getAmmoTypeForWeapon` (заменена логикой через `weapon.ammo_id` в `kitResolver.js`)
  - Функция `resolveLoot` с тегом `<ammo>` может остаться для обратной совместимости, но должна принимать `weaponId` вместо `weaponName` или быть помечена как deprecated
  - _Requirements: 7.2_

- [x] 5. Проверить использование устаревших JSON-файлов в остальном коде





  - Найти все импорты `light_weapons.json`, `heavy_weapons.json`, `energy_weapons.json`, `melee_weapons.json` в проекте (кроме `seed.js` — он их использует правомерно)
  - Для каждого найденного использования — заменить на запрос к БД через `Database.js`
  - Если файлы больше нигде не используются кроме `seed.js` — удалить их из `assets/Equipment/`
  - _Requirements: 7.4_
