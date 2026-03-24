# Requirements Document

## Introduction

Приложение вылетает при открытии модального окна выбора комплектов снаряжения для персонажей с определёнными происхождениями (например, "Житель НКР"). Корневая причина — `originsData.js` и `EquipmentKitModal.js` ссылаются на оружие, патроны и моды по текстовым именам через устаревшие файлы (`light_weapons.json`, `heavy_weapons.json`, `energy_weapons.json`, `melee_weapons.json`), тогда как актуальные данные хранятся в SQLite базе данных (таблицы `weapons`, `ammo_types`, `weapon_mods`, `weapon_mod_slots`, `items`), заполняемой из `weapons.json`, `ammo_types.json`, `weapon_mods.json` через `seed.js`. Поиск по имени не находит нужные записи, возвращает `undefined`, и последующие обращения к свойствам вызывают краш.

Необходимо перевести всю систему комплектов снаряжения на единый источник данных — базу данных через функции `Database.js` — и удалить все прямые импорты устаревших JSON-файлов из кода комплектов снаряжения.

## Requirements

### Requirement 1

**User Story:** Как разработчик, я хочу единый источник данных об оружии через базу данных, чтобы поиск оружия в комплектах снаряжения был надёжным.

#### Acceptance Criteria

1. WHEN приложение загружается THEN система SHALL использовать базу данных (таблица `weapons`, функция `getWeaponById` из `Database.js`) как единственный источник данных об оружии.
2. WHEN выполняется поиск оружия по `id` THEN система SHALL возвращать корректный объект оружия или `null` без выброса исключений.
3. IF оружие не найдено по `id` THEN система SHALL логировать предупреждение и продолжать работу без краша.
4. WHEN база данных возвращает оружие THEN объект SHALL содержать поля `id`, `name`, `damage`, `ammo_id`, `weight`, `cost`, `rarity`, `qualities`, `fire_rate`.

### Requirement 2

**User Story:** Как разработчик, я хочу единый источник данных о патронах через базу данных, чтобы расчёт патронов для оружия в комплектах был корректным.

#### Acceptance Criteria

1. WHEN система разрешает патроны для оружия THEN она SHALL использовать поле `ammo_id` из объекта оружия (таблица `weapons`) для поиска через `getAmmoById` из `Database.js`.
2. WHEN патрон найден по `id` THEN система SHALL возвращать объект с полями `id`, `name`, `cost`, `rarity`.
3. IF патрон не найден по `id` THEN система SHALL возвращать `null` без краша.

### Requirement 3

**User Story:** Как разработчик, я хочу единый источник данных о модификациях через базу данных, чтобы поиск модов в комплектах был корректным.

#### Acceptance Criteria

1. WHEN система разрешает моды для оружия THEN она SHALL использовать `getWeaponModById` из `Database.js` для поиска по `id` из `weapon_mods`.
2. WHEN мод найден по `id` THEN система SHALL возвращать объект с полями `id`, `name`, `prefix`, `slot`, `effects`.
3. IF мод не найден по `id` THEN система SHALL возвращать `null` без краша.

### Requirement 4

**User Story:** Как разработчик, я хочу чтобы `originsData.js` ссылался на оружие и моды по `id` из базы данных, чтобы данные комплектов снаряжения были корректными.

#### Acceptance Criteria

1. WHEN в комплекте снаряжения указано оружие THEN оно SHALL быть задано через поле `weaponId` содержащее `id` из таблицы `weapons` (например `"weapon_007"`).
2. WHEN в комплекте снаряжения указаны моды THEN они SHALL быть заданы через поле `modIds` содержащее массив `id` из таблицы `weapon_mods` (например `["mod_012", "mod_034"]`).
3. WHEN в комплекте снаряжения указаны патроны THEN формула SHALL оставаться строкой вида `"Nfn{CD}<ammo>"`, а тип патрона SHALL определяться автоматически из поля `ammo_id` оружия в базе данных.
4. IF в `originsData.js` используется `name` для предмета (без `weaponId`) THEN это SHALL быть допустимо только для предметов из таблицы `items` (броня, одежда, разное, химикаты).

### Requirement 5

**User Story:** Как разработчик, я хочу чтобы `EquipmentKitModal.js` корректно разрешал оружие, патроны и моды через базу данных, чтобы модальное окно не вылетало.

#### Acceptance Criteria

1. WHEN `EquipmentKitModal` обрабатывает элемент с `weaponId` THEN он SHALL вызывать `getWeaponById(weaponId)` из `Database.js`.
2. WHEN `EquipmentKitModal` разрешает патроны для оружия THEN он SHALL вызывать `getAmmoById(weapon.ammo_id)` из `Database.js`.
3. WHEN `EquipmentKitModal` обрабатывает моды THEN он SHALL вызывать `getWeaponModById(modId)` из `Database.js` для каждого `id` из `modIds`.
4. IF любой из запросов к базе данных возвращает `null` THEN система SHALL продолжать работу, используя fallback-значения, без краша.
5. WHEN пользователь открывает модальное окно комплектов снаряжения для происхождения "Житель НКР" THEN оно SHALL отображаться без ошибок.
6. WHEN `EquipmentKitModal` обрабатывает предмет без `weaponId` (броня, одежда, разное) THEN он SHALL вызывать `getItemByName(name)` из `Database.js`.

### Requirement 6

**User Story:** Как разработчик, я хочу чтобы `EquipmentKitModal.js` корректно разрешал броню, одежду, химикаты и разные предметы через базу данных.

#### Acceptance Criteria

1. WHEN `EquipmentKitModal` обрабатывает предмет без `weaponId` THEN он SHALL вызывать `getItemByName(name)` из `Database.js` для поиска в таблице `items`.
2. WHEN предмет найден в таблице `items` THEN система SHALL использовать его поля `name`, `item_type`, `weight`, `price`, `rarity`.
3. IF предмет не найден в таблице `items` THEN система SHALL использовать переданное `name` как fallback без краша.
4. WHEN `EquipmentKitModal` обрабатывает химикат (chem) THEN он SHALL искать его в таблице `items` по `item_type = 'chem'`.
5. WHEN `EquipmentKitModal` обрабатывает расходник с формулой (например `d20<food>`) THEN логика `resolveRandomLoot` SHALL оставаться без изменений, но результат SHALL обогащаться данными из таблицы `items` если предмет там найден.

### Requirement 7

**User Story:** Как разработчик, я хочу удалить все прямые импорты устаревших JSON-файлов из кода комплектов снаряжения, чтобы исключить дублирование источников данных.

#### Acceptance Criteria

1. WHEN рефакторинг завершён THEN `EquipmentKitModal.js` SHALL NOT импортировать `light_weapons.json`, `heavy_weapons.json`, `energy_weapons.json`, `melee_weapons.json`, `ammoData.json`, `light_weapon_mods.json`, `armor.json`, `Clothes.json`, `miscellaneous.json`, `chems.json`.
2. WHEN рефакторинг завершён THEN `ammoLogic.js` SHALL NOT импортировать `light_weapons.json`, `heavy_weapons.json`, `energy_weapons.json`, `melee_weapons.json` для поиска типа патронов.
3. WHEN рефакторинг завершён THEN `weaponModificationUtils.js` SHALL NOT использовать устаревшие JSON-файлы оружия как источник данных для комплектов снаряжения.
4. IF файлы `light_weapons.json`, `heavy_weapons.json`, `energy_weapons.json`, `melee_weapons.json` больше не используются нигде в проекте THEN они SHALL быть удалены из `assets/Equipment/`.

### Requirement 8

**User Story:** Как игрок, я хочу видеть корректные названия оружия с модификациями в комплектах снаряжения, чтобы понимать что именно я выбираю.

#### Acceptance Criteria

1. WHEN оружие имеет моды THEN отображаемое имя SHALL формироваться из базового `name` оружия и поля `prefix` модов из базы данных.
2. WHEN оружие не имеет модов THEN отображается только базовое `name` из таблицы `weapons`.
3. WHEN выбранный комплект передаётся в инвентарь THEN объект оружия SHALL содержать корректные поля `Название`, `weaponId`, `appliedMods`, `quantity`.
