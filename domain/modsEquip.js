// domain/modsEquip.js
// Weapon and armor modification logic.
// Pure functions — no React, no UI dependencies.

// ---------------------------------------------------------------------------
// WEAPON MODIFICATIONS
// ---------------------------------------------------------------------------

// Return the prefix string for a mod. The Prefix field in i18n data is
// already localized — no declension table needed.
export const declinePrefix = (prefix /*, _weaponName */) => prefix;

// Return the base code / identifier for a weapon (currently its name).
export const getWeaponBaseCode = (weaponName) => weaponName;

// ---------------------------------------------------------------------------
// Internal helpers for dual-format weapon/mod objects
// ---------------------------------------------------------------------------

const getWeaponName = (weapon) => weapon.name || weapon.Name || weapon.Название || '';

const getModPrefix = (mod) => {
    if (!mod) return null;
    return mod.Prefix || mod.prefix || mod['Префикс имени'] || null;
};

// ---------------------------------------------------------------------------
// Weapon modification functions
// ---------------------------------------------------------------------------

// Build the display name for a weapon with all its applied modifications.
export const getModifiedWeaponName = (weapon, modifications) => {
    const weaponName = getWeaponName(weapon);
    if (!modifications || modifications.length === 0) return weaponName;

    const prefixes = modifications.map(getModPrefix).filter(Boolean);
    if (prefixes.length === 0) return weaponName;

    const declined = prefixes.map((p) => declinePrefix(p, weaponName));
    return `${declined.join(' ')} ${weaponName}`;
};

// Apply a single modification's stat effects to a weapon object.
// Reads structured fields: damageModifier, fireRateModifier, rangeModifier,
// ammoOverride, qualityChanges, Weight/weight, Cost/cost.
export const applyModification = (weapon, modification) => {
    if (!modification) return weapon;
    const result = { ...weapon };

    // --- damage ---
    const dm = modification.damageModifier;
    if (dm) {
        const base = Number(result.damage ?? result.Урон ?? 0);
        if (dm.op === 'set') {
            result.damage = dm.value;
            result.Урон = dm.value;
        } else {
            const next = dm.op === '-' ? base - dm.value : base + dm.value;
            result.damage = Math.max(0, next);
            result.Урон = result.damage;
        }
    }

    // --- fire rate ---
    const fr = modification.fireRateModifier;
    if (fr) {
        const base = Number(result.fire_rate ?? result['Скорость стрельбы'] ?? 0);
        const next = fr.op === '-' ? base - fr.value : base + fr.value;
        result.fire_rate = Math.max(0, next);
        result['Скорость стрельбы'] = result.fire_rate;
    }

    // --- range ---
    const rm = modification.rangeModifier;
    if (rm) {
        // range_index is a 0-based integer; range_name is the display key resolved by UI
        const base = Number(result.range_index ?? 0);
        const next = rm.op === '-' ? base - rm.value : base + rm.value;
        result.range_index = Math.max(0, next);
    }

    // --- ammo override ---
    if (modification.ammoOverride) {
        result.ammo = modification.ammoOverride;
        result.Патроны = modification.ammoOverride;
    }

    // --- quality changes: gain / lose ---
    const qc = modification.qualityChanges;
    if (Array.isArray(qc) && qc.length > 0) {
        // qualities stored as a Set of strings like "Piercing 1", "Vicious", etc.
        const qualitySet = new Set(
            String(result.qualities ?? result.Качества ?? '')
                .split(',').map((q) => q.trim()).filter(Boolean).filter((q) => q !== '–')
        );

        qc.forEach(({ op, name, value }) => {
            const token = value != null ? `${name} ${value}` : name;
            if (op === 'gain') {
                // For stackable qualities like Piercing, bump the level if already present
                const existing = [...qualitySet].find((q) => q.startsWith(name));
                if (existing && value != null) {
                    const currentLevel = parseInt(existing.split(' ')[1] ?? '0', 10);
                    qualitySet.delete(existing);
                    qualitySet.add(`${name} ${currentLevel + value}`);
                } else {
                    qualitySet.add(token);
                }
            } else if (op === 'lose') {
                // Remove any entry that starts with this quality name
                [...qualitySet].filter((q) => q === name || q.startsWith(name + ' ')).forEach((q) => qualitySet.delete(q));
            }
        });

        const joined = qualitySet.size ? [...qualitySet].join(', ') : '–';
        result.qualities = joined;
        result.Качества = joined;
    }

    // --- weight / cost ---
    const wMod = modification.Weight ?? modification.weight;
    if (wMod != null) {
        result.weight = Number(result.weight ?? result.Вес ?? 0) + Number(wMod);
        result.Вес = result.weight;
    }
    const cMod = modification.Cost ?? modification.cost;
    if (cMod != null) {
        result.cost = Number(result.cost ?? result.Цена ?? 0) + Number(cMod);
        result.Цена = result.cost;
    }

    return result;
};

// Reverse the stat effects of a modification (for removal).
export const removeModificationEffects = (weapon, modification) => {
    if (!modification) return weapon;
    const result = { ...weapon };

    const dm = modification.damageModifier;
    if (dm && dm.op !== 'set') {
        const base = Number(result.damage ?? result.Урон ?? 0);
        const next = dm.op === '-' ? base + dm.value : base - dm.value;
        result.damage = Math.max(0, next);
        result.Урон = result.damage;
    }

    const fr = modification.fireRateModifier;
    if (fr) {
        const base = Number(result.fire_rate ?? result['Скорость стрельбы'] ?? 0);
        const next = fr.op === '-' ? base + fr.value : base - fr.value;
        result.fire_rate = Math.max(0, next);
        result['Скорость стрельбы'] = result.fire_rate;
    }

    const rm = modification.rangeModifier;
    if (rm) {
        const base = Number(result.range_index ?? 0);
        const next = rm.op === '-' ? base + rm.value : base - rm.value;
        result.range_index = Math.max(0, next);
    }

    const qc = modification.qualityChanges;
    if (Array.isArray(qc) && qc.length > 0) {
        const qualitySet = new Set(
            String(result.qualities ?? result.Качества ?? '')
                .split(',').map((q) => q.trim()).filter(Boolean).filter((q) => q !== '–')
        );
        // Reverse: undo gains and losses
        qc.forEach(({ op, name, value }) => {
            if (op === 'gain') {
                [...qualitySet].filter((q) => q === name || q.startsWith(name + ' ')).forEach((q) => qualitySet.delete(q));
            } else if (op === 'lose') {
                const token = value != null ? `${name} ${value}` : name;
                qualitySet.add(token);
            }
        });
        const joined = qualitySet.size ? [...qualitySet].join(', ') : '–';
        result.qualities = joined;
        result.Качества = joined;
    }

    const wMod = modification.Weight ?? modification.weight;
    if (wMod != null) {
        result.weight = Math.max(0, Number(result.weight ?? result.Вес ?? 0) - Number(wMod));
        result.Вес = result.weight;
    }
    const cMod = modification.Cost ?? modification.cost;
    if (cMod != null) {
        result.cost = Math.max(0, Number(result.cost ?? result.Цена ?? 0) - Number(cMod));
        result.Цена = result.cost;
    }

    return result;
};

// Snapshot the weapon's base stats before any mods are applied.
export const getOrCreateBaseStats = (weapon) => {
    if (weapon._baseStats) return weapon._baseStats;
    return {
        name: weapon.name ?? weapon.Name ?? weapon.Название,
        damage: weapon.damage ?? weapon.Урон,
        fire_rate: weapon.fire_rate ?? weapon['Скорость стрельбы'],
        range_index: weapon.range_index ?? 0,
        range_name: weapon.range_name,
        weight: weapon.weight ?? weapon.Вес,
        cost: weapon.cost ?? weapon.Цена,
        qualities: weapon.qualities ?? weapon.Качества,
        ammo: weapon.ammo ?? weapon.Патроны,
        // legacy Cyrillic mirrors — kept so old consumers don't break
        Название: weapon.Название ?? weapon.name ?? weapon.Name,
        Урон: weapon.Урон ?? weapon.damage,
        'Скорость стрельбы': weapon['Скорость стрельбы'] ?? weapon.fire_rate,
        Вес: weapon.Вес ?? weapon.weight,
        Цена: weapon.Цена ?? weapon.cost,
        Качества: weapon.Качества ?? weapon.qualities,
        Патроны: weapon.Патроны ?? weapon.ammo,
    };
};

// Apply a mod to a specific slot, re-applying all installed mods from base stats.
export const applyModificationToSlot = (weapon, category, mod) => {
    const baseStats = getOrCreateBaseStats(weapon);
    const installedMods = { ...(weapon._installedMods || {}), [category]: mod };

    let result = { ...weapon, ...baseStats, _baseStats: baseStats, _installedMods: installedMods };

    for (const installedMod of Object.values(installedMods)) {
        result = applyModification(result, installedMod.data || installedMod);
    }

    const modsForName = Object.values(installedMods).map((m) => m.data || m);
    result.Название = getModifiedWeaponName({ ...baseStats }, modsForName);

    return result;
};

// Return all available modifications for a weapon, grouped by category.
export const getAvailableModifications = (weapon, modsData) => {
    if (!weapon || !weapon.Модификации || !modsData) return {};

    // Mapping for mismatched mod names between weapon data and mods catalog.
    const nameMapping = {
        'Продвинутый': 'Улучшенный',
        'Обрезанный': 'Укороченный',
        'Полная': 'С компенсатором отдачи',
        'Для автоогня': 'Ресивер для автоогня',
        'Короткий Оптический': 'Короткий оптический',
        'Длинный оптический': 'Длинный оптический',
        'Большой Быстросъемный': 'Большой быстросъемный',
        'Большой магазин': 'Большой',
        'Настроенный': 'Чувствительный',
        'Стрелка': 'Ложа стрелка',
    };

    const available = {};
    Object.entries(weapon.Модификации).forEach(([category, modNames]) => {
        if (!modsData[category]) return;
        const categoryMods = modNames
            .map((modName) => {
                const data = modsData[category][modName] || modsData[category][nameMapping[modName]];
                return data ? { name: modName, data } : null;
            })
            .filter(Boolean);
        if (categoryMods.length > 0) available[category] = categoryMods;
    });

    return available;
};

// Apply multiple modifications to a weapon (one per category).
export const applyMultipleModifications = (weapon, modifications) => {
    let modified = { ...weapon };

    const byCategory = {};
    modifications.forEach((mod) => {
        for (const [category, modNames] of Object.entries(weapon.Модификации || {})) {
            if (modNames.includes(mod.name)) {
                if (!byCategory[category]) byCategory[category] = [];
                byCategory[category].push(mod);
                break;
            }
        }
    });

    Object.values(byCategory).forEach((categoryMods) => {
        modified = applyModification(modified, categoryMods[categoryMods.length - 1]);
    });

    const modsForName = Object.values(byCategory).map((mods) => mods[mods.length - 1].data);
    modified.Название = getModifiedWeaponName(modified, modsForName);
    modified.weaponConfig = createWeaponConfig(weapon.Название, byCategory);

    return modified;
};

// Encode weapon + installed mods as a config string.
export const createWeaponConfig = (baseWeaponName, modificationsByCategory) => {
    let config = baseWeaponName;
    Object.entries(modificationsByCategory).forEach(([category, mods]) => {
        config += `+${category.toLowerCase()}=${mods[mods.length - 1].name}`;
    });
    return config;
};

// Decode a weapon config string back to base name + mod map.
export const parseWeaponConfig = (configString) => {
    const parts = configString.split('+');
    const baseWeaponName = parts[0];
    const modifications = {};
    for (let i = 1; i < parts.length; i++) {
        const [category, modName] = parts[i].split('=');
        if (category && modName) modifications[category] = modName;
    }
    return { baseWeaponName, modifications };
};

// Strip all modifications from a weapon, returning the base version.
export const getBaseWeapon = (weapon) => {
    if (!weapon.weaponConfig) return weapon;
    const { baseWeaponName } = parseWeaponConfig(weapon.weaponConfig);
    return { ...weapon, Название: baseWeaponName, weaponConfig: baseWeaponName };
};

// Build a display label for a removed mod.
// The caller is responsible for i18n formatting; this returns a plain key tuple.
export const getRemovedModificationName = (modificationName, weaponName) =>
    ({ modificationName, weaponName });

// Check whether a mod is compatible with a weapon slot.
export const isModificationCompatible = (weapon, modificationName, modificationCategory) => {
    if (!weapon.Модификации) return false;
    const available = weapon.Модификации[modificationCategory];
    return !!(available && available.includes(modificationName));
};

// Parse a weapon+mods config string and return the fully modified weapon.
export const parseWeaponWithModifications = (weaponString, weaponsData, modsData) => {
    if (!weaponString.includes('+')) {
        return { weapon: weaponsData.find((w) => w.Название === weaponString), weaponConfig: weaponString };
    }

    const { baseWeaponName, modifications } = parseWeaponConfig(weaponString);
    const baseWeapon = weaponsData.find((w) => w.Название === baseWeaponName);
    if (!baseWeapon) return null;

    const nameMapping = {
        'Продвинутый': 'Улучшенный',
        'Обрезанный': 'Укороченный',
        'Полная': 'С компенсатором отдачи',
        'Для автоогня': 'Ресивер для автоогня',
        'Короткий Оптический': 'Короткий оптический',
        'Длинный оптический': 'Длинный оптический',
        'Большой Быстросъемный': 'Большой быстросъемный',
        'Большой магазин': 'Большой',
        'Настроенный': 'Чувствительный',
        'Стрелка': 'Ложа стрелка',
    };

    const modsArray = Object.entries(modifications)
        .map(([category, modName]) => {
            const data = modsData[category]?.[modName] || modsData[category]?.[nameMapping[modName]];
            return data ? { name: modName, data } : null;
        })
        .filter(Boolean);

    return { weapon: applyMultipleModifications(baseWeapon, modsArray), weaponConfig: weaponString };
};

// ---------------------------------------------------------------------------
// ARMOR MODIFICATIONS
// ---------------------------------------------------------------------------

const DEFAULT_EFFECTS = { bonusEffects: [], rules: [] };

const normalizeModifierValue = (mod) => {
    if (!mod) return 0;
    const sign = mod.op === '-' ? -1 : 1;
    return sign * Number(mod.value || 0);
};

// Format armor mod bonuses into human-readable strings.
// Labels are passed in so callers can supply i18n-translated strings.
export const formatModBonuses = (mod, labels = {}) => {
    const improvementsLabel = labels.improvements || 'Improvements';
    const effectsLabel = labels.effects || 'Effects';
    const p = normalizeModifierValue(mod?.statModifiers?.physicalDamageRating);
    const e = normalizeModifierValue(mod?.statModifiers?.energyDamageRating);
    const r = normalizeModifierValue(mod?.statModifiers?.radiationDamageRating);
    const effectsText = (mod?.specialEffects || []).map((x) => x.description).filter(Boolean).join(' | ');
    return {
        bonuses: `${improvementsLabel}: ${p >= 0 ? '+' : ''}${p} Phys. DR; ${e >= 0 ? '+' : ''}${e} Energy DR; ${r >= 0 ? '+' : ''}${r} Rad. DR`,
        effects: effectsText ? `${effectsLabel}: ${effectsText}` : `${effectsLabel}: —`,
    };
};

// Apply a single armor mod's stat deltas to an armor item.
export const applyArmorModToItem = (armorItem, mod) => {
    if (!armorItem || !mod) return armorItem;
    const next = { ...armorItem };
    next.physicalDamageRating = Number(next.physicalDamageRating || 0) + normalizeModifierValue(mod.statModifiers?.physicalDamageRating);
    next.energyDamageRating = Number(next.energyDamageRating || 0) + normalizeModifierValue(mod.statModifiers?.energyDamageRating);
    next.radiationDamageRating = Number(next.radiationDamageRating || 0) + normalizeModifierValue(mod.statModifiers?.radiationDamageRating);
    next.weight = Number(next.weight || 0) + normalizeModifierValue(mod.weightModifier);
    next.cost = Number(next.cost || 0) + normalizeModifierValue(mod.costModifier);
    next.appliedArmorModsMeta = [...(next.appliedArmorModsMeta || []), mod];
    return next;
};

// Apply standard and unique armor mods from a catalog to an armor item.
export const applyArmorMods = (armorItem, catalog, opts = {}) => {
    if (!armorItem) return { item: armorItem, effects: DEFAULT_EFFECTS };

    const stdKey = opts.standardKey || 'appliedArmorModId';
    const uniqKey = opts.uniqueKey || 'appliedUniqueArmorModId';
    const stdModId = armorItem[stdKey] || armorItem.appliedArmorMod?.id;
    const uniqModId = armorItem[uniqKey] || armorItem.appliedUniqueArmorMod?.id;

    const allStd = Array.isArray(opts.standardMods) ? opts.standardMods : (Array.isArray(catalog?.armorMods) ? catalog.armorMods : []);
    const allUniq = Array.isArray(opts.uniqueMods) ? opts.uniqueMods : (Array.isArray(catalog?.uniqArmorMods) ? catalog.uniqArmorMods : []);
    const stdMod = stdModId ? allStd.find((m) => m.id === stdModId) : (armorItem.appliedArmorMod || null);
    const uniqMod = uniqModId ? allUniq.find((m) => m.id === uniqModId) : (armorItem.appliedUniqueArmorMod || null);

    const used = [stdMod, uniqMod].filter(Boolean).slice(0, 2);
    let modified = { ...armorItem };
    used.forEach((m) => { modified = applyArmorModToItem(modified, m); });

    const bonusEffects = [];
    used.forEach((m) => {
        (m.specialEffects || []).forEach((effect) => {
            const baseRule = catalog?.armorEffects?.[effect.id];
            bonusEffects.push({ ...baseRule, ...effect, sourceModId: m.id });
        });
    });

    return { item: modified, effects: { bonusEffects, rules: bonusEffects } };
};
