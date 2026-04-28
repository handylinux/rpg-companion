// domain/robotEquip.js
// Pure functions for robot equipment logic.
// No React, no UI dependencies. All reason strings are i18n keys.

// ---------------------------------------------------------------------------
// Slot schemas per body plan
// ---------------------------------------------------------------------------

const BODY_PLAN_SLOTS = {
  protectron:  ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
  assaultron:  ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
  sentryBot:   ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
  misterHandy: ['head', 'body', 'arm1', 'arm2', 'arm3', 'thruster'],
  robobrain:   ['head', 'body', 'leftArm', 'rightArm', 'chassis'],
};

const SLOT_ALIASES = {
  head: ['head', 'optics'],
  body: ['body', 'mainbody', 'main_body'],
  leftarm: ['leftarm', 'arm1'],
  rightarm: ['rightarm', 'arm2'],
  arm3: ['arm3'],
  leftleg: ['leftleg'],
  rightleg: ['rightleg'],
  legs: ['legs'],
  arms: ['arms'],
  thruster: ['thruster'],
  chassis: ['chassis'],
};

// ---------------------------------------------------------------------------
// Простые хелперы
// ---------------------------------------------------------------------------

export function isRobotCharacter(character) {
  return Boolean(character?.origin?.isRobot);
}

export function getRobotSlotKeys(bodyPlan) {
  return BODY_PLAN_SLOTS[bodyPlan] ?? BODY_PLAN_SLOTS.protectron;
}

export function createEmptyRobotSlots(bodyPlan) {
  const keys = getRobotSlotKeys(bodyPlan);
  return keys.reduce((slots, key) => {
    slots[key] = { limb: null, armor: null, plating: null, frame: null, heldWeapon: null };
    return slots;
  }, {});
}

export function getSlotForDirection(bodyPlan, direction) {
  const slotKeys = getRobotSlotKeys(bodyPlan);
  if (direction === 'left') return slotKeys.find((k) => k === 'leftArm' || k === 'arm1') ?? null;
  if (direction === 'right') return slotKeys.find((k) => k === 'rightArm' || k === 'arm2') ?? null;
  if (direction === 'center') return slotKeys.find((k) => k === 'arm3') ?? null;
  return null;
}

// ---------------------------------------------------------------------------
// Простая инициализация слотов
// ---------------------------------------------------------------------------



// ---------------------------------------------------------------------------
// initRobotSlots
// ---------------------------------------------------------------------------

/**
 * Resolves a kit's already-resolved items into robot slot state.
 *
 * @param {string} bodyPlan - e.g. "protectron", "misterHandy", "robobrain"
 * @param {object[]} resolvedKitItems - items already resolved by kitResolver
 * @param {object} robotCatalog - { heads, bodies, arms, legs } arrays of limb catalog entries
 * @returns {{ slots: object, weapons: object[], modules: object[], inventoryItems: object[] }}
 */
export function initRobotSlots(bodyPlan, resolvedKitItems = [], robotCatalog = {}) {
  const slots = createEmptyRobotSlots(bodyPlan);
  const slotKeys = getRobotSlotKeys(bodyPlan);
  const modules = [];
  const inventoryItems = [];

  const armSlotKeys = slotKeys.filter((key) => key.toLowerCase().includes('arm'));
  const legSlotKeys = slotKeys.filter((key) => key.toLowerCase().includes('leg') || key === 'chassis' || key === 'thruster');

  const parseLimbSlots = (limbSlot, explicitSlot) => {
    if (!limbSlot && explicitSlot) return [explicitSlot];
    const rawTokens = Array.isArray(limbSlot)
      ? limbSlot
      : String(limbSlot || '')
        .split('+')
        .map((token) => token.trim())
        .filter(Boolean);

    const resolved = new Set();
    for (const rawToken of rawTokens) {
      const normalized = rawToken.toLowerCase().replace(/[\s_-]/g, '');
      const aliasKey = Object.keys(SLOT_ALIASES).find((key) => SLOT_ALIASES[key].includes(normalized));
      const token = aliasKey || normalized;

      if (token === 'arms') armSlotKeys.forEach((slot) => resolved.add(slot));
      else if (token === 'legs') legSlotKeys.forEach((slot) => resolved.add(slot));
      else if (slotKeys.includes(token)) resolved.add(token);
      else if (token === 'leftarm' && slotKeys.includes('leftArm')) resolved.add('leftArm');
      else if (token === 'rightarm' && slotKeys.includes('rightArm')) resolved.add('rightArm');
      else if (token === 'leftleg' && slotKeys.includes('leftLeg')) resolved.add('leftLeg');
      else if (token === 'rightleg' && slotKeys.includes('rightLeg')) resolved.add('rightLeg');
      else if (token === 'arm1' && slotKeys.includes('arm1')) resolved.add('arm1');
      else if (token === 'arm2' && slotKeys.includes('arm2')) resolved.add('arm2');
      else if (token === 'arm3' && slotKeys.includes('arm3')) resolved.add('arm3');
      else if (token === 'head' && slotKeys.includes('head')) resolved.add('head');
      else if (token === 'body' && slotKeys.includes('body')) resolved.add('body');
      else if (token === 'thruster' && slotKeys.includes('thruster')) resolved.add('thruster');
      else if (token === 'chassis' && slotKeys.includes('chassis')) resolved.add('chassis');
    }

    return [...resolved];
  };

  const buildBuiltinWeapons = (weaponData) => {
    if (Array.isArray(weaponData?.builtinWeapons) && weaponData.builtinWeapons.length > 0) {
      return weaponData.builtinWeapons;
    }

    const details = Object.entries(weaponData || {})
      .filter(([key, value]) => /^weaponDetails\d+$/i.test(key) && value && typeof value === 'object')
      .map(([, value]) => value);
    if (details.length > 0) return details;

    // Weapon-as-limb defaults to one attack card based on itself.
    return [{ ...weaponData }];
  };

  // Простая обработка предметов
  for (const item of resolvedKitItems) {
    const itype = item.itemType;

    // Конечности
    if (['robotArm', 'robotHead', 'robotBody', 'robotLeg', 'robotLegs'].includes(itype)) {
      let targetKey = null;

      if (itype === 'robotHead') {
        targetKey = 'head';
      } else if (itype === 'robotBody') {
        targetKey = 'body';
      } else if (itype === 'robotLeg' || itype === 'robotLegs') {
        targetKey = slotKeys.find(k => 
          k.toLowerCase().includes('leg') || k === 'chassis' || k === 'thruster'
        );
      } else if (itype === 'robotArm') {
        // Просто: left/right или первый свободный
        if (item.slot === 'left') {
          targetKey = slotKeys.find(k => k === 'leftArm' || k === 'arm1');
        } else if (item.slot === 'right') {
          targetKey = slotKeys.find(k => k === 'rightArm' || k === 'arm2');
        } else {
          targetKey = slotKeys.find(k => 
            k.toLowerCase().includes('arm') && slots[k].limb === null
          );
        }
      }

      if (targetKey && slots[targetKey] !== undefined) {
        slots[targetKey].limb = item;
      }
      continue;
    }

    // Оружие
    if (itype === 'weapon') {
      const weaponData = item._weapon ?? item;

      // Weapon-as-limb schema: limbSlot + optional weaponSlot/weaponDetailsN.
      const explicitSlot = getSlotForDirection(bodyPlan, item.slot);
      const limbSlots = parseLimbSlots(weaponData.limbSlot ?? item.limbSlot, explicitSlot);
      if (limbSlots.length > 0) {
        const weaponLimb = {
          ...weaponData,
          itemType: weaponData.itemType || 'robotArm',
          canHoldWeapons: (weaponData.weaponSlot ?? weaponData.weaponSlots ?? 0) > 0,
          weaponSlots: weaponData.weaponSlot ?? weaponData.weaponSlots ?? 0,
          builtinWeapons: buildBuiltinWeapons(weaponData),
        };
        for (const targetKey of limbSlots) {
          if (slots[targetKey] !== undefined) {
            slots[targetKey].limb = weaponLimb;
            slots[targetKey].heldWeapon = null;
          }
        }
        continue;
      }

      // Иначе как обычное оружие в руке.
      const targetKey = slotKeys.find((k) =>
        k.toLowerCase().includes('arm') && slots[k].limb?.canHoldWeapons && slots[k].heldWeapon == null
      );
      if (targetKey && slots[targetKey] !== undefined) slots[targetKey].heldWeapon = weaponData;
      else inventoryItems.push(item);
      continue;
    }

    // Броня
    if (['plating', 'armor', 'frame'].includes(itype)) {
      const armorData = item._armor ?? item;
      const location = armorData.robotLocation ?? item.robotLocation;
      const layer = armorData.layer ?? itype;
      
      // Простое распределение
      for (const k of slotKeys) {
        if (location === 'Main Body' && k === 'body') {
          slots[k][layer] = armorData;
        } else if (location === 'Optics' && k === 'head') {
          slots[k][layer] = armorData;
        } else if (location === 'Arms' && k.toLowerCase().includes('arm')) {
          slots[k][layer] = armorData;
        } else if (location === 'Legs' && (k.toLowerCase().includes('leg') || k === 'chassis' || k === 'thruster')) {
          slots[k][layer] = armorData;
        } else if (location === 'Thruster' && k === 'thruster') {
          slots[k][layer] = armorData;
        }
      }
      continue;
    }

    // Модули
    if (itype === 'module') {
      modules.push(item);
      continue;
    }

    // Всё остальное → инвентарь
    if (itype !== 'robotPart') {
      inventoryItems.push(item);
    }
  }

  // Автозаполнение недостающих конечностей
  const { heads = [], bodies = [], legs = [] } = robotCatalog;

  const defaultHead = heads.find(h => h.defaultForBodyPlan === bodyPlan);
  const defaultBody = bodies.find(b => b.robotBodyPlan === bodyPlan);
  const defaultLeg = legs.find(l => 
    l.compatibleBodyPlans?.includes(bodyPlan) || l.defaultForBodyPlan === bodyPlan
  );

  for (const k of slotKeys) {
    if (slots[k].limb !== null) continue;

    if (k === 'head' && defaultHead) {
      slots[k].limb = defaultHead;
    } else if (k === 'body' && defaultBody) {
      slots[k].limb = defaultBody;
    } else if (
      (k.toLowerCase().includes('leg') || k === 'chassis' || k === 'thruster') &&
      defaultLeg
    ) {
      slots[k].limb = defaultLeg;
    }
  }

  // Собираем оружия
  const weapons = getBuiltinWeaponsFromSlots(slots);

  return { slots, weapons, modules, inventoryItems };
}

// ---------------------------------------------------------------------------
// getBuiltinWeaponsFromSlots
// ---------------------------------------------------------------------------

/**
 * Builds the equippedWeapons array from the current robot slot state.
 * Sources:
 *  - limb.builtinWeapons  → встроенные оружия
 *  - slot.heldWeapon      → оружие в руке
 *
 * @param {object} slots - RobotSlotsObject
 * @returns {object[]}
 */
export function getBuiltinWeaponsFromSlots(slots) {
  if (!slots || typeof slots !== 'object') return [];

  const weapons = [];

  for (const [slotKey, slotData] of Object.entries(slots)) {
    if (!slotData) continue;
    const { limb, heldWeapon } = slotData;

    // Встроенные оружия конечности
    if (limb?.builtinWeapons) {
      limb.builtinWeapons.forEach(weapon => {
        weapons.push({
          ...weapon,
          sourceSlot: slotKey,
          sourceLimb: limb.id,
          isBuiltin: true,
          ...(limb._builtinWeapon ?? {}),
        });
      });
    }

    // Оружие в руке
    if (heldWeapon) {
      weapons.push({
        ...heldWeapon,
        sourceSlot: slotKey,
      });
    }
  }

  return weapons;
}

// ---------------------------------------------------------------------------
// canEquipRobotArmor
// ---------------------------------------------------------------------------

/**
 * Checks whether an armor item can be equipped in the given layer of a slot.
 * Uses armorItem.incompatibleLayers to detect conflicts with existing layers.
 *
 * @param {object} armorItem - { incompatibleLayers?: string[], layer?: string }
 * @param {string} slotKey
 * @param {string} layer - 'plating' | 'armor' | 'frame'
 * @param {object} slots - RobotSlotsObject
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function canEquipRobotArmor(armorItem, slotKey, layer, slots) {
  const slotData = slots?.[slotKey];
  if (!slotData) {
    return { allowed: false, reason: 'equip.error.invalidSlot' };
  }

  const incompatible = armorItem?.incompatibleLayers ?? [];

  for (const blockedLayer of incompatible) {
    if (slotData[blockedLayer] != null) {
      return {
        allowed: false,
        reason: 'equip.error.armorLayerIncompatible',
      };
    }
  }

  // Also check: if the slot already has this layer occupied, it will be replaced (allowed)
  return { allowed: true, reason: null };
}

// ---------------------------------------------------------------------------
// canReplaceLimb
// ---------------------------------------------------------------------------

/**
 * Checks whether a new limb can be placed in the given slot.
 * Validates compatibleBodyPlans / defaultForBodyPlan against the character's body plan.
 *
 * @param {string} slotKey
 * @param {object} newLimb - { compatibleBodyPlans?: string[], defaultForBodyPlan?: string }
 * @param {object} character - { origin: { robotBodyPlan } }
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function canReplaceLimb(slotKey, newLimb, character) {
  if (!newLimb) {
    return { allowed: false, reason: 'equip.error.noLimb' };
  }

  const bodyPlan = character?.origin?.robotBodyPlan;

  const compatiblePlans = newLimb.compatibleBodyPlans;
  const defaultPlan = newLimb.defaultForBodyPlan;

  // If the limb declares compatibility constraints, enforce them
  if (compatiblePlans && Array.isArray(compatiblePlans)) {
    if (!compatiblePlans.includes(bodyPlan)) {
      return { allowed: false, reason: 'equip.error.limbIncompatibleBodyPlan' };
    }
  } else if (defaultPlan && defaultPlan !== bodyPlan) {
    return { allowed: false, reason: 'equip.error.limbIncompatibleBodyPlan' };
  }

  return { allowed: true, reason: null };
}

// ---------------------------------------------------------------------------
// applyLimbReplacement
// ---------------------------------------------------------------------------

/**
 * Replaces the limb in a slot and rebuilds the weapons array.
 * The old limb's built-in weapons are removed; held weapons are kept if compatible.
 *
 * @param {object} slots   - RobotSlotsObject
 * @param {string} slotKey
 * @param {object} newLimb
 * @returns {{ slots: object, weapons: object[] }}
 */
export function applyLimbReplacement(slots, slotKey, newLimb) {
  const updatedSlots = {
    ...slots,
    [slotKey]: {
      ...slots[slotKey],
      limb: newLimb,
      // Keep held weapon if the new limb can hold weapons; otherwise clear it
      heldWeapon:
        newLimb?.canHoldWeapons ? (slots[slotKey]?.heldWeapon ?? null) : null,
    },
  };

  const weapons = getBuiltinWeaponsFromSlots(updatedSlots);
  return { slots: updatedSlots, weapons };
}

// ---------------------------------------------------------------------------
// canEquipWeaponToSlot
// ---------------------------------------------------------------------------

/**
 * Checks whether a weapon can be held by the given slot's limb.
 * Validates weight limit and two-handed restrictions.
 *
 * @param {object} weapon   - { weight?: number, twoHanded?: boolean }
 * @param {object} slotData - { limb: { canHoldWeapons, maxHandelWeaponWeight, excludeTwoHanded } }
 * @param {object} _character - reserved for future use
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function canEquipWeaponToSlot(weapon, slotData, _character) {
  const limb = slotData?.limb;

  const hasFreeWeaponSlot = (limb?.weaponSlots ?? (limb?.canHoldWeapons ? 1 : 0)) > 0;
  if (!hasFreeWeaponSlot) {
    return { allowed: false, reason: 'equip.error.limbCannotHoldWeapons' };
  }

  const maxWeight = limb.maxHandelWeaponWeight;
  if (maxWeight != null && (weapon?.weight ?? 0) > maxWeight) {
    return { allowed: false, reason: 'equip.error.weaponTooHeavyForLimb' };
  }

  if (limb.excludeTwoHanded && weapon?.twoHanded) {
    return { allowed: false, reason: 'equip.error.limbExcludesTwoHandedWeapons' };
  }

  return { allowed: true, reason: null };
}
