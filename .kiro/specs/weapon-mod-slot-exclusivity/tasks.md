# Implementation Plan

- [x] 1. Добавить утилиты для работы со слотами модификаций в `weaponModificationUtils.js`





  - Реализовать функцию `getOrCreateBaseStats(weapon)` — возвращает `_baseStats` если есть, иначе создаёт снимок текущих характеристик (Урон, Скорость стрельбы, Дистанция, Вес, Цена, Эффекты, Качества, Патроны, Название)
  - Реализовать функцию `applyModificationToSlot(weapon, category, mod)` — обновляет `_installedMods[category]`, затем пересчитывает все характеристики от `_baseStats` применяя все моды из `_installedMods` через существующую `applyModification`, обновляет название через `getModifiedWeaponName`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 4.1, 4.2_

- [x] 2. Обновить `WeaponModificationModal.js` для корректной работы со слотами





- [x] 2.1 Инициализировать `selectedModifications` из `weapon._installedMods` при открытии модального окна


  - В `useEffect` при изменении `weapon` и `visible`: загружать `weapon._installedMods || {}` как начальное значение `selectedModifications`
  - Это обеспечит отображение уже установленных модов как выбранных при повторном открытии
  - _Requirements: 2.2, 3.2_

- [x] 2.2 Заменить логику `handleSelectModification` на использование `applyModificationToSlot`


  - Убрать `getBaseWeaponFromCode` и `applyMultipleModifications` из обработчика
  - Вызывать `applyModificationToSlot(weapon, mod.category, mod)` для получения нового состояния оружия с учётом уже выбранных модов из других категорий
  - При выборе мода объединять с уже выбранными модами из других категорий: применять `applyModificationToSlot` последовательно для каждого выбранного мода
  - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.3, 4.1, 4.2_

- [x] 3. Убедиться что `_baseStats` и `_installedMods` сохраняются при снятии/надевании оружия





  - Проверить в `InventoryScreen.js` что при снятии оружия (`handleUnequipWeapon`) объект оружия передаётся в инвентарь без изменений (поля `_baseStats` и `_installedMods` не удаляются)
  - Проверить что при надевании оружия из инвентаря объект также передаётся без изменений
  - Если где-то объект оружия пересоздаётся через spread без этих полей — исправить
  - _Requirements: 3.1, 3.3, 3.4_
