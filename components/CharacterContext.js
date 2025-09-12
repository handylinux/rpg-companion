import React, { createContext, useState, useContext } from 'react';
import { 
  createInitialAttributes, 
  ALL_SKILLS, 
  getLuckPoints, 
  calculateMaxHealth,
  calculateInitiative,
  calculateDefense,
  calculateMeleeBonus,
  calculateCarryWeight
} from './screens/CharacterScreen/logic/characterLogic';
import { meetsPerkRequirements, getPerkUnmetReasons, annotatePerks } from './screens/CharacterScreen/logic/perksLogic';
import { createModifiedWeaponFromId, createWeaponId, getAllWeapons, getWeaponModifications, clearWeaponCache } from './screens/WeaponsAndArmorScreen/weaponModificationUtils';

const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [attributes, setAttributes] = useState(createInitialAttributes());
  const [skills, setSkills] = useState(ALL_SKILLS.map(s => ({...s, value: 0})));
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [forcedSelectedSkills, setForcedSelectedSkills] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [trait, setTrait] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [effects, setEffects] = useState([]);
  const [equippedWeapons, setEquippedWeapons] = useState([null, null]);
  const [equippedArmor, setEquippedArmor] = useState({
    head: { armor: null, clothing: null },
    body: { armor: null, clothing: null },
    leftArm: { armor: null, clothing: null },
    rightArm: { armor: null, clothing: null },
    leftLeg: { armor: null, clothing: null },
    rightLeg: { armor: null, clothing: null },
  });
  const [caps, setCaps] = useState(0);
  const [currentHealth, setCurrentHealth] = useState(0);
  
  // Состояние для модифицированных предметов и очков атрибутов от перков
  const [modifiedItems, setModifiedItems] = useState(new Map()); // itemId -> modifiedItem
  const [availablePerkAttributePoints, setAvailablePerkAttributePoints] = useState(0); // Очки атрибутов от перков
  
  const [luckPoints, setLuckPoints] = useState(0);
  const [maxLuckPoints, setMaxLuckPoints] = useState(0);
  const [attributesSaved, setAttributesSaved] = useState(false);
  const [skillsSaved, setSkillsSaved] = useState(false);
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [carryWeight, setCarryWeight] = useState(150 + (10 * attributes.find(a => a.name === 'СИЛ')?.value || 0));
  const [meleeBonus, setMeleeBonus] = useState(0);
  const [initiative, setInitiative] = useState(0);
  const [defense, setDefense] = useState(1);

  // Функции для работы с модифицированными предметами
  const getItemId = (item) => {
    // Для уникальных экземпляров (экипированных) используем их ID
    if (item.uniqueId) {
      return item.uniqueId;
    }
    // Для стаков в инвентаре используем ID стака
    return item.weaponId || item.code || item.Название;
  };

  const getModifiedItem = (item) => {
    const itemId = getItemId(item);
    
    // Если у оружия уже есть weaponId, создаем модифицированное оружие из него
    if (item.itemType === 'weapon' && item.weaponId) {
      const modifiedWeapon = createModifiedWeaponFromId(item.weaponId, getAllWeapons(), getWeaponModifications());
      if (modifiedWeapon) {
        return modifiedWeapon;
      }
    }
    
    // Проверяем сохраненные модификации
    const modifiedItem = modifiedItems.get(itemId);
    
    if (modifiedItem) {
      console.log('getModifiedItem: found modified item:', { 
        originalName: item.Название || item.name, 
        itemId, 
        modifiedName: modifiedItem.Название || modifiedItem.name,
        modifiedItem: modifiedItem
      });
      return modifiedItem;
    } else {
      // Если предмет не является оружием или броней, он не может быть модифицирован.
      // Просто возвращаем его и не выводим лог.
      if (item.itemType !== 'weapon' && item.itemType !== 'armor' && item.itemType !== 'clothing') {
          return item;
      }
      
      // Логируем только если это оружие/броня, для которых мы ожидали найти модификацию
      console.log('getModifiedItem: no modification found for:', { 
        originalName: item.Название || item.name, 
        itemId 
      });
      return item;
    }
  };

  const saveModifiedItem = (originalItem, modifiedItem) => {
    const itemId = getItemId(originalItem);
    
    // Если у модифицированного предмета есть weaponId, используем его
    if (modifiedItem.weaponId) {
      console.log('saveModifiedItem: using existing weaponId:', modifiedItem.weaponId);
    }
    
    console.log('saveModifiedItem:', { 
      originalName: originalItem.Название || originalItem.name, 
      modifiedName: modifiedItem.Название || modifiedItem.name, 
      itemId,
      weaponId: modifiedItem.weaponId,
      originalItem: originalItem,
      modifiedItem: modifiedItem
    });
    setModifiedItems(prev => new Map(prev).set(itemId, modifiedItem));
  };

  const removeModifiedItem = (item) => {
    const itemId = getItemId(item);
    setModifiedItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
  };

  // Добавляем очки атрибутов от перка
  const addPerkAttributePoints = (points) => {
    console.log('addPerkAttributePoints called with points:', points);
    console.log('Current availablePerkAttributePoints:', availablePerkAttributePoints);
    setAvailablePerkAttributePoints(prev => {
      console.log('Setting availablePerkAttributePoints from', prev, 'to', prev + points);
      return prev + points;
    });
  };

  // Применяем изменения атрибутов после распределения очков от перков
  const commitAttributeChanges = (newAttributes, pointsSpent) => {
    setAttributes(newAttributes);
    setAvailablePerkAttributePoints(prev => prev - pointsSpent);

    // Пересчитываем все зависимые характеристики
    const newLuck = getLuckPoints(newAttributes);
    setMaxLuckPoints(newLuck);
    setLuckPoints(prevLuck => Math.min(prevLuck, newLuck));
    
    setCarryWeight(calculateCarryWeight(newAttributes, trait));
    setMeleeBonus(calculateMeleeBonus(newAttributes));
    setInitiative(calculateInitiative(newAttributes));
    setDefense(calculateDefense(newAttributes));
    
    const newMaxHealth = calculateMaxHealth(newAttributes, level);
    setCurrentHealth(prevHealth => Math.min(prevHealth, newMaxHealth));
  };

  const resetCharacter = (preserveOrigin = false) => {
    const initialAttributes = createInitialAttributes();
    setAttributes(initialAttributes);
    setSkills(ALL_SKILLS.map(s => ({...s, value: 0})));
    setSelectedSkills([]);
    setForcedSelectedSkills([]);
    setAttributesSaved(false);
    setSkillsSaved(false);
    const initialLuck = getLuckPoints(initialAttributes);
    setMaxLuckPoints(initialLuck);
    setLuckPoints(initialLuck);
    if (!preserveOrigin) {
      setOrigin(null);
    }
    setTrait(null);
    setEquipment(null);
    setEffects([]);
    setEquippedWeapons([null, null]);
    setEquippedArmor({
      head: { armor: null, clothing: null },
      body: { armor: null, clothing: null },
      leftArm: { armor: null, clothing: null },
      rightArm: { armor: null, clothing: null },
      leftLeg: { armor: null, clothing: null },
      rightLeg: { armor: null, clothing: null },
    });
    setCaps(0);
    setSelectedPerks([]);
    setMeleeBonus(0);
    setInitiative(calculateInitiative(initialAttributes));
    setDefense(calculateDefense(initialAttributes));
    
    const currentMaxHealth = calculateMaxHealth(initialAttributes, level);
    setCurrentHealth(currentMaxHealth);
    
    setModifiedItems(new Map());
    clearWeaponCache();
  };

  const value = {
    level, setLevel,
    attributes, setAttributes,
    skills, setSkills,
    selectedSkills, setSelectedSkills,
    forcedSelectedSkills, setForcedSelectedSkills,
    origin, setOrigin,
    trait, setTrait,
    equipment, setEquipment,
    effects, setEffects,
    equippedWeapons, setEquippedWeapons,
    equippedArmor, setEquippedArmor,
    caps, setCaps,
    currentHealth, setCurrentHealth,
    luckPoints, setLuckPoints,
    maxLuckPoints, setMaxLuckPoints,
    attributesSaved, setAttributesSaved,
    skillsSaved, setSkillsSaved,
    selectedPerks, setSelectedPerks,
    modifiedItems, setModifiedItems,
    carryWeight,
    meleeBonus,
    initiative,
    defense,
    // Helpers for trait-driven display rules
    hasTrait: (traitName) => !!(trait && (trait.name === traitName)),
    getItemId,
    getModifiedItem,
    saveModifiedItem,
    removeModifiedItem,
    resetCharacter,
    availablePerkAttributePoints,
    addPerkAttributePoints,
    commitAttributeChanges,
    // Perk requirement helpers
    meetsPerkRequirements: (perk) => meetsPerkRequirements(perk, attributes, level),
    getPerkUnmetReasons: (perk) => getPerkUnmetReasons(perk, attributes, level),
    annotatePerks: (perks) => annotatePerks(perks, attributes, level),
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  return useContext(CharacterContext);
};