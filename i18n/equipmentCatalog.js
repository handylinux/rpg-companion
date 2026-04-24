// Locale-specific display data (names, descriptions, flavour text)
import ruWeapons from './ru-RU/data/equipment/weapons/weapons.json';
import ruWeaponMods from './ru-RU/data/equipment/weapons/weapon_mods.json';
import ruModsOverrides from './ru-RU/data/equipment/weapons/mods_overrides.json';
import ruArmor from './ru-RU/data/equipment/armor/armor.json';
import ruArmorMods from './ru-RU/data/equipment/armor/armor_mods.json';
import ruUniqArmorMods from './ru-RU/data/equipment/armor/uniq_armor_mods.json';
import ruArmorEffects from './ru-RU/data/equipment/armor/armor_effects.json';
import ruClothes from './ru-RU/data/equipment/armor/clothes.json';
import ruAmmoTypes from './ru-RU/data/equipment/ammo/ammo_types.json';
import ruAmmoData from './ru-RU/data/equipment/ammo/ammoData.json';
import ruMiscItems from './ru-RU/data/equipment/items.json';
import ruRobotWeapons from './ru-RU/data/equipment/robot/weapons.json';
import ruRobotArmor from './ru-RU/data/equipment/robot/armor.json';
import ruRobotModules from './ru-RU/data/equipment/robot/modules.json';
import ruRobotItems from './ru-RU/data/equipment/robot/items.json';
import ruRobotPartsUpgrade from './ru-RU/data/equipment/robot/partsUpgrade.json';
import ruChems from './ru-RU/data/consumables/chems.json';
import ruDrinks from './ru-RU/data/consumables/drinks.json';
import ruQualities from './ru-RU/data/system/qualities.json';
import ruEffects from './ru-RU/data/system/effects.json';
import ruEquipmentKits from './ru-RU/data/system/equipmentKits.json';

import enWeapons from './en-EN/data/equipment/weapons/weapons.json';
import enWeaponMods from './en-EN/data/equipment/weapons/weapon_mods.json';
import enModsOverrides from './en-EN/data/equipment/weapons/mods_overrides.json';
import enArmor from './en-EN/data/equipment/armor/armor.json';
import enArmorMods from './en-EN/data/equipment/armor/armor_mods.json';
import enUniqArmorMods from './en-EN/data/equipment/armor/uniq_armor_mods.json';
import enArmorEffects from './en-EN/data/equipment/armor/armor_effects.json';
import enClothes from './en-EN/data/equipment/armor/clothes.json';
import enAmmoTypes from './en-EN/data/equipment/ammo/ammo_types.json';
import enAmmoData from './en-EN/data/equipment/ammo/ammoData.json';
import enMiscItems from './en-EN/data/equipment/items.json';
import enRobotWeapons from './en-EN/data/equipment/robot/weapons.json';
import enRobotArmor from './en-EN/data/equipment/robot/armor.json';
import enRobotModules from './en-EN/data/equipment/robot/modules.json';
import enRobotItems from './en-EN/data/equipment/robot/items.json';
import enRobotPartsUpgrade from './en-EN/data/equipment/robot/partsUpgrade.json';
import enChems from './en-EN/data/consumables/chems.json';
import enDrinks from './en-EN/data/consumables/drinks.json';
import enQualities from './en-EN/data/system/qualities.json';
import enEffects from './en-EN/data/system/effects.json';
import enEquipmentKits from './en-EN/data/system/equipmentKits.json';

// Locale-independent technical data (stats, ids, game mechanics)
import dataWeapons from '../data/equipment/weapons.json';
import dataArmor from '../data/equipment/armor.json';
import dataWeaponMods from '../data/equipment/weapon_mods.json';
import dataArmorMods from '../data/equipment/armor_mods.json';
import dataUniqArmorMods from '../data/equipment/uniq_armor_mods.json';
import dataArmorEffects from '../data/equipment/armor_effects.json';
import dataClothes from '../data/equipment/clothes.json';
import dataAmmo from '../data/equipment/ammo.json';
import dataRobotParts from '../data/equipment/robotparts.json';
import dataChems from '../data/consumables/chems.json';
import dataDrinks from '../data/consumables/drinks.json';

import { getCurrentLocale, normalizeLocale } from './locale';

const EQUIPMENT_BY_LOCALE = {
  'ru-RU': {
    weapons: ruWeapons,
    weaponMods: ruWeaponMods,
    ammoTypes: ruAmmoTypes,
    qualities: ruQualities,
    effects: ruEffects,
    equipmentKits: ruEquipmentKits,
    modsOverrides: ruModsOverrides,
    armor: ruArmor,
    armorMods: ruArmorMods,
    uniqArmorMods: ruUniqArmorMods,
    armorEffects: ruArmorEffects,
    clothes: ruClothes,
    chems: ruChems,
    drinks: ruDrinks,
    miscellaneous: ruMiscItems,
    ammoData: ruAmmoData,
    robotWeapons: ruRobotWeapons,
    robotArmor: ruRobotArmor,
    robotModules: ruRobotModules,
    robotItems: ruRobotItems,
    robotPartsUpgrade: ruRobotPartsUpgrade,
  },
  'en-EN': {
    weapons: enWeapons,
    weaponMods: enWeaponMods,
    ammoTypes: enAmmoTypes,
    qualities: enQualities,
    effects: enEffects,
    equipmentKits: enEquipmentKits,
    modsOverrides: enModsOverrides,
    armor: enArmor,
    armorMods: enArmorMods,
    uniqArmorMods: enUniqArmorMods,
    armorEffects: enArmorEffects,
    clothes: enClothes,
    chems: enChems,
    drinks: enDrinks,
    miscellaneous: enMiscItems,
    ammoData: enAmmoData,
    robotWeapons: enRobotWeapons,
    robotArmor: enRobotArmor,
    robotModules: enRobotModules,
    robotItems: enRobotItems,
    robotPartsUpgrade: enRobotPartsUpgrade,
  },
};

/**
 * Merges two arrays by `id`, with i18n fields (name, etc.) overlaid on data fields.
 * Items present only in data are included with a fallback name of their id.
 */
const mergeById = (dataArr, i18nArr) => {
  const i18nMap = Object.fromEntries((i18nArr || []).map((item) => [item.id, item]));
  return (dataArr || []).map((dataItem) => {
    const i18nItem = i18nMap[dataItem.id] || {};
    if (!i18nItem.name && process.env.NODE_ENV !== 'production') {
      console.warn(`[equipmentCatalog] No i18n entry for id: ${dataItem.id}`);
    }
    return { ...dataItem, ...i18nItem, name: i18nItem.name || dataItem.id };
  });
};

/**
 * Flattens armor groups array into a single list of items.
 * Expects {armor: [{type, categoryKey, items}]} format.
 */
const flattenArmorGroups = (armorData) =>
  (armorData?.armor || []).flatMap((group) =>
    (group.items || []).map((item) => ({ ...item, armorCategoryKey: item.armorCategoryKey || group.categoryKey })),
  );

/**
 * Builds a Map index of armor items by id.
 */
const buildArmorIndex = (items) => {
  const byId = new Map();
  items.forEach((item) => { if (item.id) byId.set(item.id, item); });
  return { byId };
};

const validateConsumablesContract = (items, allowedTypes, fallbackType) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const normalizedType = item.itemType === 'chems' ? 'chem' : item.itemType;
      const finalType = allowedTypes.includes(normalizedType) ? normalizedType : fallbackType;
      return { ...item, itemType: finalType };
    })
    .filter((item) => typeof item.name === 'string' && allowedTypes.includes(item.itemType));
};

export const getEquipmentCatalog = (locale = getCurrentLocale()) => {
  const normalized = normalizeLocale(locale);
  const i18n = EQUIPMENT_BY_LOCALE[normalized] || EQUIPMENT_BY_LOCALE['ru-RU'];

  // Weapons: merge data/ stats with i18n names/flavour
  const weapons = mergeById(dataWeapons, i18n.weapons).map((w) => ({ ...w, itemType: 'weapon' }));
  const robotWeapons = (i18n.robotWeapons || []).map((w) => ({ ...w, itemType: 'weapon' }));
  const allWeapons = [...weapons, ...robotWeapons];

  // Armor: i18n file has {armor:[{type, categoryKey, items}]}, data file has allowedModCategories per categoryKey
  const armorGroups = [
    ...(i18n.armor?.armor || []).map((g) => ({
      ...g,
      items: (g.items || []).map((item) => ({ ...item, armorCategoryKey: g.categoryKey })),
    })),
    ...(i18n.robotArmor?.armor || []),
  ];
  const armorList = flattenArmorGroups({ armor: armorGroups });
  const armorIndex = buildArmorIndex(armorList);

  // Clothes: merge data/ mechanics with i18n names per item, grouped by clothingType
  const i18nClothesMap = Object.fromEntries(
    (i18n.clothes?.clothes || []).flatMap((g) => (g.items || []).map((item) => [item.id, item]))
  );
  const clothes = (dataClothes.clothes || []).map((group) => ({
    ...group,
    type: (i18n.clothes?.clothes || []).find((g) => g.clothingType === group.clothingType)?.type || group.type,
    items: (group.items || []).map((dataItem) => {
      const i18nItem = i18nClothesMap[dataItem.id] || {};
      if (!i18nItem.name && process.env.NODE_ENV !== 'production') {
        console.warn(`[equipmentCatalog] No i18n entry for clothes id: ${dataItem.id}`);
      }
      return { ...dataItem, ...i18nItem, name: i18nItem.name || dataItem.id };
    }),
  }));

  // Consumables
  const mergedAmmo = mergeById(dataAmmo, i18n.ammoTypes);
  const mergedChems = mergeById(dataChems, i18n.chems);
  const mergedDrinks = mergeById(dataDrinks, i18n.drinks);
  const mergedWeaponMods = mergeById(dataWeaponMods, i18n.weaponMods);
  const mergedArmorMods = mergeById(dataArmorMods, i18n.armorMods);
  const mergedUniqArmorMods = mergeById(dataUniqArmorMods, i18n.uniqArmorMods);

  return {
    ...i18n,
    weapons: allWeapons,
    // armorRaw keyed by categoryKey for ArmorModificationModal allowedModCategories lookup
    armorRaw: dataArmor,
    armor: { armor: armorGroups },
    armorList,
    armorIndex,
    clothes: { clothes },
    ammoTypes: mergedAmmo,
    chems: validateConsumablesContract(mergedChems, ['chem'], 'chem'),
    drinks: validateConsumablesContract(mergedDrinks, ['drinks'], 'drinks'),
    weaponMods: mergedWeaponMods,
    armorMods: mergedArmorMods,
    uniqArmorMods: mergedUniqArmorMods,
    armorEffects: dataArmorEffects,
    robotModules: Array.isArray(i18n.robotModules) ? i18n.robotModules : [],
    robotItems: Array.isArray(i18n.robotItems) ? i18n.robotItems : [],
    robotPartsUpgrade: Array.isArray(i18n.robotPartsUpgrade) ? i18n.robotPartsUpgrade : [],
  };
};

/**
 * Returns locale-independent technical equipment data from data/equipment/.
 * Use this when you need game mechanics data without display strings.
 */
export const getEquipmentData = () => ({
  weapons: dataWeapons,
  armor: dataArmor,
  weaponMods: dataWeaponMods,
  armorMods: dataArmorMods,
  uniqArmorMods: dataUniqArmorMods,
  ammo: dataAmmo,
  robotItems: dataRobotParts.robotItems,
  robotModules: dataRobotParts.robotModules,
  robotPartsUpgrade: dataRobotParts.robotPartsUpgrade,
});
