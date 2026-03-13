// Утилиты для работы с модификациями оружия

// Словарь для склонения префиксов в зависимости от рода оружия
const prefixDeclensions = {
  // Мужской род (пистолет, карабин, револьвер)
  masculine: {
    'Укреплённый': 'Укреплённый',
    'Усиленный': 'Усиленный', 
    'Улучшенный': 'Улучшенный',
    'Калиброванный': 'Калиброванный',
    'Автоматический': 'Автоматический',
    'Чувствительный': 'Чувствительный',
    'Толстостенный': 'Толстостенный',
    'Длинный': 'Длинный',
    'Перфорированный': 'Перфорированный',
    'Вентилируемый': 'Вентилируемый',
    'Сверхкороткий': 'Сверхкороткий',
    'Ребристый': 'Ребристый',
    'Демпфированный': 'Демпфированный',
    'Тактический': 'Тактический',
    'Прицельный': 'Прицельный',
    'Ночного видения': 'Ночного видения',
    'Разведывательный': 'Разведывательный',
    'Штыковой': 'Штыковой',
    'Компенсированный': 'Компенсированный',
    'Пламегасительный': 'Пламегасительный',
    'Тихий': 'Тихий',
    'Стрелковый': 'Стрелковый',
    'Меткий': 'Меткий',
    'Удобный': 'Удобный'
  },
  // Женский род (винтовка, пушка)
  feminine: {
    'Укреплённый': 'Укреплённая',
    'Усиленный': 'Усиленная',
    'Улучшенный': 'Улучшенная', 
    'Калиброванный': 'Калиброванная',
    'Автоматический': 'Автоматическая',
    'Чувствительный': 'Чувствительная',
    'Толстостенный': 'Толстостенная',
    'Длинный': 'Длинная',
    'Перфорированный': 'Перфорированная',
    'Вентилируемый': 'Вентилируемая',
    'Сверхкороткий': 'Сверхкороткая',
    'Ребристый': 'Ребристая',
    'Демпфированный': 'Демпфированная',
    'Тактический': 'Тактическая',
    'Прицельный': 'Прицельная',
    'Ночного видения': 'Ночного видения',
    'Разведывательный': 'Разведывательная',
    'Штыковой': 'Штыковая',
    'Компенсированный': 'Компенсированная',
    'Пламегасительный': 'Пламегасительная',
    'Тихий': 'Тихая',
    'Стрелковый': 'Стрелковая',
    'Меткий': 'Меткая',
    'Удобный': 'Удобная'
  }
};

// Определение рода оружия по названию
const getWeaponGender = (weaponName) => {
  const feminineEndings = ['винтовка', 'пушка', 'ракета', 'мина'];
  const lowerName = weaponName.toLowerCase();
  
  for (const ending of feminineEndings) {
    if (lowerName.includes(ending)) {
      return 'feminine';
    }
  }
  
  return 'masculine'; // По умолчанию мужской род
};

// Функция для получения базового кода оружия
export const getWeaponBaseCode = (weaponName) => {
  // Простая реализация - возвращаем название оружия как базовый код
  // В будущем можно расширить для более сложной логики
  return weaponName;
};

// Функция для склонения префикса
export const declinePrefix = (prefix, weaponName) => {
  const gender = getWeaponGender(weaponName);
  return prefixDeclensions[gender][prefix] || prefix;
};

// Хелпер: получить название оружия из любого формата
const getWeaponName = (weapon) => weapon.Название || weapon.name || '';

// Хелпер: получить префикс мода из любого формата
const getModPrefix = (mod) => {
  if (!mod) return null;
  return mod['Префикс имени'] || mod['Prefix'] || null;
};

// Хелпер: получить эффекты мода из любого формата (русский текст > english текст)
const getModEffects = (mod) => {
  if (!mod) return null;
  return mod['Эффекты'] || mod['EffectDescription'] || null;
};

// Хелпер: получить вес мода из любого формата
const getModWeight = (mod) => {
  if (!mod) return undefined;
  const w = mod['Вес'] ?? mod['Weight'];
  return w !== undefined ? Number(w) : undefined;
};

// Хелпер: получить цену мода из любого формата
const getModCost = (mod) => {
  if (!mod) return undefined;
  const c = mod['Цена'] ?? mod['Cost'];
  return c !== undefined ? Number(c) : undefined;
};

// Функция для получения полного названия модифицированного оружия
export const getModifiedWeaponName = (weapon, modifications) => {
  const weaponName = getWeaponName(weapon);
  if (!modifications || modifications.length === 0) {
    return weaponName;
  }
  
  // Собираем все префиксы из модификаций (поддерживаем оба формата)
  const prefixes = modifications.map(mod => getModPrefix(mod)).filter(Boolean);
  
  if (prefixes.length === 0) {
    return weaponName;
  }
  
  // Склоняем префиксы
  const declinedPrefixes = prefixes.map(prefix => declinePrefix(prefix, weaponName));
  
  // Объединяем префиксы и название оружия
  return `${declinedPrefixes.join(' ')} ${weaponName}`;
};

// Функция для применения модификации к оружию
export const applyModification = (weapon, modification) => {
  const modifiedWeapon = { ...weapon };
  
  // Применяем эффекты модификации (поддержка обоих форматов)
  const effectsStr = getModEffects(modification);
  if (effectsStr) {
    const effects = effectsStr.split(', ');
    
    effects.forEach(effect => {
      if (effect.includes('+') && effect.includes('урона')) {
        // Изменение урона
        const damageChange = parseInt(effect.match(/\+(\d+)/)[1]);
        modifiedWeapon.Урон = (modifiedWeapon.Урон || 0) + damageChange;
      } else if (effect.includes('-') && effect.includes('урона')) {
        // Уменьшение урона
        const damageChange = parseInt(effect.match(/-(\d+)/)[1]);
        modifiedWeapon.Урон = Math.max(0, (modifiedWeapon.Урон || 0) - damageChange);
      } else if (effect.includes('Изменяет урон на')) {
        // Замена урона
        const newDamage = parseInt(effect.match(/на (\d+)/)[1]);
        modifiedWeapon.Урон = newDamage;
      } else if (effect.includes('+') && effect.includes('Скорострельность')) {
        // Изменение скорости стрельбы
        const fireRateChange = parseInt(effect.match(/\+(\d+)/)[1]);
        modifiedWeapon['Скорость стрельбы'] = (modifiedWeapon['Скорость стрельбы'] || 0) + fireRateChange;
      } else if (effect.includes('Увеличение дистанции на') || effect.includes('Увеличение дистанцию на')) {
        // Изменение дистанции
        const distanceChange = parseInt(effect.match(/на (\d+) зон/)[1]);
        const currentDistance = modifiedWeapon['Дистанция'] || 'Близкая';
        
        const distanceLevels = ['Близкая', 'Средняя', 'Дальняя', 'Экстремальная'];
        const currentIndex = distanceLevels.indexOf(currentDistance);
        
        if (currentIndex !== -1) {
          const newIndex = Math.min(currentIndex + distanceChange, distanceLevels.length - 1);
          modifiedWeapon['Дистанция'] = distanceLevels[newIndex];
        }
      } else if (effect.includes('Уменьшите дистанцию на') || effect.includes('Уменьшение дистанции на')) {
        // Уменьшение дистанции
        const distanceChange = parseInt(effect.match(/на (\d+) зон/)[1]);
        const currentDistance = modifiedWeapon['Дистанция'] || 'Близкая';
        
        const distanceLevels = ['Близкая', 'Средняя', 'Дальняя', 'Экстремальная'];
        const currentIndex = distanceLevels.indexOf(currentDistance);
        
        if (currentIndex !== -1) {
          const newIndex = Math.max(currentIndex - distanceChange, 0);
          modifiedWeapon['Дистанция'] = distanceLevels[newIndex];
        }
      } else if (effect.includes('Добавляет')) {
        // Добавление эффектов или качеств
        const addedEffect = effect.match(/Добавляет '([^']+)'/);
        if (addedEffect) {
          const effectName = addedEffect[1];
          if (['Очередь', 'Порочный', 'Проникающий', 'Разрушающий', 'Разброс'].includes(effectName)) {
            // Это эффект
            if (effectName === 'Проникающий') {
              // Специальная обработка для Проникающего эффекта
              const currentEffects = modifiedWeapon.Эффекты || '–';
              if (currentEffects.includes('Проникающий')) {
                // Если Проникающий уже есть, увеличиваем уровень
                const match = currentEffects.match(/Проникающий(\s+\d+)?/);
                if (match) {
                  const currentLevel = match[1] ? parseInt(match[1]) : 1;
                  const newLevel = currentLevel + 1;
                  modifiedWeapon.Эффекты = currentEffects.replace(/Проникающий(\s+\d+)?/, `Проникающий ${newLevel}`);
                }
              } else {
                // Добавляем Проникающий впервые
                if (currentEffects && currentEffects !== '–') {
                  modifiedWeapon.Эффекты += ', Проникающий';
                } else {
                  modifiedWeapon.Эффекты = 'Проникающий';
                }
              }
            } else {
              // Обычная обработка для других эффектов
              if (modifiedWeapon.Эффекты && modifiedWeapon.Эффекты !== '–') {
                modifiedWeapon.Эффекты += `, ${effectName}`;
              } else {
                modifiedWeapon.Эффекты = effectName;
              }
            }
          } else {
            // Это качество
            if (modifiedWeapon.Качества && modifiedWeapon.Качества !== '–') {
              modifiedWeapon.Качества += `, ${effectName}`;
            } else {
              modifiedWeapon.Качества = effectName;
            }
          }
        }
      } else if (effect.includes('Убирает')) {
        // Удаление эффектов или качеств
        const removedEffect = effect.match(/Убирает '([^']+)'/);
        if (removedEffect) {
          const effectName = removedEffect[1];
          if (modifiedWeapon.Эффекты) {
            modifiedWeapon.Эффекты = modifiedWeapon.Эффекты.replace(new RegExp(`\\b${effectName}\\b`, 'g'), '').replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/\s*,$/, '') || '–';
          }
          if (modifiedWeapon.Качества) {
            modifiedWeapon.Качества = modifiedWeapon.Качества.replace(new RegExp(`\\b${effectName}\\b`, 'g'), '').replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/\s*,$/, '') || '–';
          }
        }
      }
    });
  }
  
  // Изменяем вес и цену
  if (modification.Вес !== undefined) {
    modifiedWeapon.Вес = (modifiedWeapon.Вес || 0) + modification.Вес;
  }
  
  if (modification.Цена !== undefined) {
    modifiedWeapon.Цена = (modifiedWeapon.Цена || 0) + modification.Цена;
  }
  
  // Изменяем патроны если указано
  if (modification.Эффекты && modification.Эффекты.includes('Смените патроны на')) {
    const newAmmo = modification.Эффекты.match(/на калибр ([^,]+)/);
    if (newAmmo) {
      modifiedWeapon.Патроны = newAmmo[1];
    }
  }
  
  return modifiedWeapon;
};

// Функция для удаления эффектов модификации
export const removeModificationEffects = (weapon, modification) => {
  const modifiedWeapon = { ...weapon };
  
  if (modification.Эффекты) {
    const effects = modification.Эффекты.split(', ');
    
    effects.forEach(effect => {
      if (effect.includes('+') && effect.includes('урона')) {
        // Отменяем изменение урона
        const damageChange = parseInt(effect.match(/\+(\d+)/)[1]);
        modifiedWeapon.Урон = Math.max(0, (modifiedWeapon.Урон || 0) - damageChange);
      } else if (effect.includes('-') && effect.includes('урона')) {
        // Отменяем уменьшение урона
        const damageChange = parseInt(effect.match(/-(\d+)/)[1]);
        modifiedWeapon.Урон = (modifiedWeapon.Урон || 0) + damageChange;
      } else if (effect.includes('Изменяет урон на')) {
        // Возвращаем исходный урон (нужно хранить базовый урон)
        // Пока просто оставляем как есть
      } else if (effect.includes('+') && effect.includes('Скорострельность')) {
        // Отменяем изменение скорости стрельбы
        const fireRateChange = parseInt(effect.match(/\+(\d+)/)[1]);
        modifiedWeapon['Скорость стрельбы'] = Math.max(0, (modifiedWeapon['Скорость стрельбы'] || 0) - fireRateChange);
      } else if (effect.includes('Увеличение дистанции на') || effect.includes('Увеличение дистанцию на')) {
        // Отменяем увеличение дистанции
        const distanceChange = parseInt(effect.match(/на (\d+) зон/)[1]);
        const currentDistance = modifiedWeapon['Дистанция'] || 'Близкая';
        
        const distanceLevels = ['Близкая', 'Средняя', 'Дальняя', 'Экстремальная'];
        const currentIndex = distanceLevels.indexOf(currentDistance);
        
        if (currentIndex !== -1) {
          const newIndex = Math.max(currentIndex - distanceChange, 0);
          modifiedWeapon['Дистанция'] = distanceLevels[newIndex];
        }
      } else if (effect.includes('Уменьшите дистанцию на') || effect.includes('Уменьшение дистанции на')) {
        // Отменяем уменьшение дистанции
        const distanceChange = parseInt(effect.match(/на (\d+) зон/)[1]);
        const currentDistance = modifiedWeapon['Дистанция'] || 'Близкая';
        
        const distanceLevels = ['Близкая', 'Средняя', 'Дальняя', 'Экстремальная'];
        const currentIndex = distanceLevels.indexOf(currentDistance);
        
        if (currentIndex !== -1) {
          const newIndex = Math.min(currentIndex + distanceChange, distanceLevels.length - 1);
          modifiedWeapon['Дистанция'] = distanceLevels[newIndex];
        }
      } else if (effect.includes('Добавляет')) {
        // Удаляем добавленные эффекты или качества
        const addedEffect = effect.match(/Добавляет '([^']+)'/);
        if (addedEffect) {
          const effectName = addedEffect[1];
          if (['Очередь', 'Порочный', 'Проникающий', 'Разрушающий', 'Разброс'].includes(effectName)) {
            // Это эффект
            if (modifiedWeapon.Эффекты) {
              modifiedWeapon.Эффекты = modifiedWeapon.Эффекты.replace(new RegExp(`\\b${effectName}\\b`, 'g'), '').replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/\s*,$/, '') || '–';
            }
          } else {
            // Это качество
            if (modifiedWeapon.Качества) {
              modifiedWeapon.Качества = modifiedWeapon.Качества.replace(new RegExp(`\\b${effectName}\\b`, 'g'), '').replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/\s*,$/, '') || '–';
            }
          }
        }
      }
    });
  }
  
  // Отменяем изменения веса и цены
  if (modification.Вес !== undefined) {
    modifiedWeapon.Вес = Math.max(0, (modifiedWeapon.Вес || 0) - modification.Вес);
  }
  
  if (modification.Цена !== undefined) {
    modifiedWeapon.Цена = Math.max(0, (modifiedWeapon.Цена || 0) - modification.Цена);
  }
  
  return modifiedWeapon;
};

// Функция для применения нескольких модификаций к оружию
export const applyMultipleModifications = (weapon, modifications) => {
  let modifiedWeapon = { ...weapon };
  
  // Группируем модификации по категориям
  const modificationsByCategory = {};
  modifications.forEach(mod => {
    // Находим категорию модификации
    for (const [category, modNames] of Object.entries(weapon.Модификации || {})) {
      if (modNames.includes(mod.name)) {
        if (!modificationsByCategory[category]) {
          modificationsByCategory[category] = [];
        }
        modificationsByCategory[category].push(mod);
        break;
      }
    }
  });
  
  // Для каждой категории применяем только последнюю выбранную модификацию
  // Это обеспечивает замену модификаций из одной категории, а не накопление
  Object.values(modificationsByCategory).forEach(categoryMods => {
    // Берем последнюю модификацию из категории (если выбрано несколько)
    const lastMod = categoryMods[categoryMods.length - 1];
    
    // Применяем модификацию
    modifiedWeapon = applyModification(modifiedWeapon, lastMod);
  });
  
  // Обновляем название оружия с учетом всех модификаций
  // Преобразуем модификации в правильный формат для getModifiedWeaponName
  const modificationsForName = Object.values(modificationsByCategory).map(categoryMods => {
    const lastMod = categoryMods[categoryMods.length - 1];
    return lastMod.data; // Передаем данные модификации, которые содержат 'Префикс имени'
  });
  const newName = getModifiedWeaponName(modifiedWeapon, modificationsForName);
  modifiedWeapon.Название = newName;
  
  // Создаем конфигурационную строку
  const configString = createWeaponConfig(weapon.Название, modificationsByCategory);
  modifiedWeapon.weaponConfig = configString;
  
  return modifiedWeapon;
};

// Функция для создания конфигурационной строки оружия
export const createWeaponConfig = (baseWeaponName, modificationsByCategory) => {
  let config = baseWeaponName;
  
  Object.entries(modificationsByCategory).forEach(([category, mods]) => {
    const lastMod = mods[mods.length - 1];
    config += `+${category.toLowerCase()}=${lastMod.name}`;
  });
  
  return config;
};

// Функция для парсинга конфигурационной строки
export const parseWeaponConfig = (configString) => {
  const parts = configString.split('+');
  const baseWeaponName = parts[0];
  const modifications = {};
  
  for (let i = 1; i < parts.length; i++) {
    const [category, modName] = parts[i].split('=');
    if (category && modName) {
      modifications[category] = modName;
    }
  }
  
  return {
    baseWeaponName,
    modifications
  };
};

// Функция для получения базового оружия без модификаций
export const getBaseWeapon = (weapon) => {
  // Если у оружия есть конфигурация, возвращаем базовое оружие
  if (weapon.weaponConfig) {
    const { baseWeaponName } = parseWeaponConfig(weapon.weaponConfig);
    return {
      ...weapon,
      Название: baseWeaponName,
      weaponConfig: baseWeaponName
    };
  }
  
  // Для обычного оружия возвращаем его как есть
  return weapon;
};

// Функция для получения названия снятой модификации
export const getRemovedModificationName = (modificationName, weaponName) => {
  return `${modificationName} (снят с ${weaponName})`;
};

// Функция для проверки совместимости модификации с оружием
export const isModificationCompatible = (weapon, modificationName, modificationCategory) => {
  if (!weapon.Модификации) return false;
  
  const availableMods = weapon.Модификации[modificationCategory];
  return availableMods && availableMods.includes(modificationName);
};

// Функция для получения всех доступных модификаций для оружия
export const getAvailableModifications = (weapon, modsData) => {
  if (!weapon || !weapon.Модификации || !modsData) return {};
  
  const available = {};
  
  // Маппинг для несовпадающих названий модификаций
  const modificationMapping = {
    'Продвинутый': 'Улучшенный',
    'Обрезанный': 'Укороченный',
    'Полная': 'С компенсатором отдачи',
    'Для автоогня': 'Ресивер для автоогня',
    'Короткий Оптический': 'Короткий оптический',
    'Длинный оптический': 'Длинный оптический',
    'Большой Быстросъемный': 'Большой быстросъемный',
    'Большой магазин': 'Большой',
    'Настроенный': 'Чувствительный',
    'Стрелка': 'Ложа стрелка'
  };
  
  Object.entries(weapon.Модификации).forEach(([category, modNames]) => {
    if (modsData[category]) {
      const categoryMods = modNames.map(modName => {
        // Проверяем оригинальное название
        let data = modsData[category][modName];
        
        // Если не найдено, проверяем маппинг
        if (!data && modificationMapping[modName]) {
          const mappedName = modificationMapping[modName];
          data = modsData[category][mappedName];
        }
        
        return {
          name: modName,
          data: data
        };
      }).filter(mod => mod.data); // Фильтруем только существующие модификации
      
      if (categoryMods.length > 0) {
        available[category] = categoryMods;
      }
    }
  });
  
  return available;
};

// Функция для парсинга строки с модификациями (например: "10-мм Пистолет+ресивер=Для автоогня")
export const parseWeaponWithModifications = (weaponString, weaponsData, modsData) => {
  if (!weaponString.includes('+')) {
    // Обычное оружие без модификаций
    return {
      weapon: weaponsData.find(w => w.Название === weaponString),
      weaponConfig: weaponString
    };
  }
  
  const { baseWeaponName, modifications } = parseWeaponConfig(weaponString);
  const baseWeapon = weaponsData.find(w => w.Название === baseWeaponName);
  
  if (!baseWeapon) {
    return null;
  }
  
  // Применяем модификации
  const modificationsArray = Object.entries(modifications).map(([category, modName]) => {
    // Находим данные модификации
    let modData = modsData[category]?.[modName];
    
    // Проверяем маппинг
    const modificationMapping = {
      'Продвинутый': 'Улучшенный',
      'Обрезанный': 'Укороченный',
      'Полная': 'С компенсатором отдачи',
      'Для автоогня': 'Ресивер для автоогня',
      'Короткий Оптический': 'Короткий оптический',
      'Длинный оптический': 'Длинный оптический',
      'Большой Быстросъемный': 'Большой быстросъемный',
      'Большой магазин': 'Большой',
      'Настроенный': 'Чувствительный',
      'Стрелка': 'Ложа стрелка'
    };
    
    if (!modData && modificationMapping[modName]) {
      const mappedName = modificationMapping[modName];
      modData = modsData[category]?.[mappedName];
    }
    
    return {
      name: modName,
      data: modData
    };
  }).filter(mod => mod.data);
  
  const modifiedWeapon = applyMultipleModifications(baseWeapon, modificationsArray);
  
  return {
    weapon: modifiedWeapon,
    weaponConfig: weaponString
  };
}; 