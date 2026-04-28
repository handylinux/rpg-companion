// domain/robotEquip.js
// Pure functions for robot equipment logic.
// No React, no UI dependencies. All reason strings are i18n keys.

// ---------------------------------------------------------------------------
// Slot schemas per body plan
// ---------------------------------------------------------------------------

const BODY_PLAN_SLOTS = {
  protectron:  ['leftArm', 'head', 'rightArm', 'leftLeg', 'body', 'rightLeg'],
  assaultron:  ['leftArm', 'head', 'rightArm', 'leftLeg', 'body', 'rightLeg'],
  sentryBot:   ['leftArm', 'head', 'rightArm', 'leftLeg', 'body', 'rightLeg'],
  misterHandy: ['arm1', 'head', 'arm2', 'arm3', 'body', 'thruster'],
  robobrain:   ['leftArm', 'head', 'rightArm', 'chassis', 'body'],
};

// Slots that can hold a weapon (arm-type slots)
const isArmSlot = (slotKey) =>
  slotKey.toLowerCase().includes('arm') || /^arm\d+$/.test(slotKey);

// ---------------------------------------------------------------------------
// robotLocation → slot keys mapping
// Maps armor robotLocation strings to the slot keys they cover
// ---------------------------------------------------------------------------

const LOCATION_TO_SLOTS = {
  'Main Body': ['body'],
  'Optics':    ['head'],
  'Arms':      ['leftArm', 'rightArm', 'arm1', 'arm2', 'arm3'],
  'Thruster':  ['thruster'],
  'Legs':      ['leftLeg', 'rightLeg', 'chassis'],
};

// slot → "left"|"right" direction for kit item.slot mapping
const SLOT_DIRECTION = {
  leftArm:  'left',
  rightArm: 'right',
  arm1:     'left',
  arm2:     'right',
  arm3:     null,
  leftLeg:  'left',
  rightLeg: 'right',
};

// ---------------------------------------------------------------------------
// isRobotCharacter
// ---------------------------------------------------------------------------

/**
 * Returns true if the character is a robot.
 * Checks origin.isRobot only (trait checks are redundant per design notes).
 *
 * @param {object} character - { origin }
 * @returns {boolean}
 */
export function isRobotCharacter(character) {
  return Boolean(character?.origin?.isRobot);
}

// ---------------------------------------------------------------------------
// getRobotSlotKeys
// ---------------------------------------------------------------------------

/**
 * Returns the ordered list of slot keys for a given body plan.
 *
 * @param {string} bodyPlan
 * @returns {string[]}
 */
export function getRobotSlotKeys(bodyPlan) {
  return BODY_PLAN_SLOTS[bodyPlan] ?? BODY_PLAN_SLOTS.protectron;
}

// ---------------------------------------------------------------------------
// createEmptyRobotSlots
// ---------------------------------------------------------------------------

/**
 * Creates an empty slot object for the given body plan.
 * Each slot has: limb, armor, plating, frame, heldWeapon — all null.
 *
 * @param {string} bodyPlan
 * @returns {object}
 */
export function createEmptyRobotSlots(bodyPlan) {
  const keys = getRobotSlotKeys(bodyPlan);
  return keys.reduce((slots, key) => {
    slots[key] = { limb: null, armor: null, plating: null, frame: null, heldWeapon: null };
    return slots;
  }, {});
}

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

  // Helpers ----------------------------------------------------------------

  // Returns the first arm slot key that is still empty (no limb set)
  const firstFreeArmSlot = () =>
    slotKeys.find((k) => isArmSlot(k) && slots[k].limb === null);

  // Maps item.slot ("left"|"right") to the matching slot key for this body plan
  const slotKeyForDirection = (direction) => {
    if (!direction) return firstFreeArmSlot();
    return slotKeys.find(
      (k) => isArmSlot(k) && SLOT_DIRECTION[k] === direction,
    ) ?? firstFreeArmSlot();
  };

  // Returns all slot keys that match a robotLocation string
  const slotsForLocation = (robotLocation) => {
    const candidates = LOCATION_TO_SLOTS[robotLocation] ?? [];
    return slotKeys.filter((k) => candidates.includes(k));
  };

  // Step 1: process kit items ----------------------------------------------

  for (const item of resolvedKitItems) {
    const itype = item.itemType;

    // --- Limb items --------------------------------------------------------
    if (['robotArm', 'robotHead', 'robotBody', 'robotLeg', 'robotLegs'].includes(itype)) {
      let targetKey = null;

      if (itype === 'robotHead') {
        targetKey = 'head';
      } else if (itype === 'robotBody') {
        targetKey = 'body';
      } else if (itype === 'robotLeg' || itype === 'robotLegs') {
        // Assign to first free leg slot
        targetKey = slotKeys.find(
          (k) => (k.toLowerCase().includes('leg') || k === 'chassis' || k === 'thruster') &&
                 slots[k].limb === null,
        );
      } else {
        // robotArm — use item.slot direction or first free arm slot
        targetKey = slotKeyForDirection(item.slot ?? null);
      }

      if (targetKey && slots[targetKey] !== undefined) {
        slots[targetKey].limb = item;
      }
      continue;
    }

    // --- Weapon items ------------------------------------------------------
    if (itype === 'weapon') {
      const weaponData = item._weapon ?? item;

      // selfDestruct: goes into body slot as builtinWeaponId reference
      if (weaponData.selfDestruct || item.selfDestruct) {
        if (slots['body'] !== undefined) {
          slots['body'].limb = slots['body'].limb
            ? { ...slots['body'].limb, builtinWeaponId: weaponData.id, _builtinWeapon: weaponData }
            : { id: '_body_weapon', builtinWeaponId: weaponData.id, _builtinWeapon: weaponData };
        }
        continue;
      }

      // builtinToHead: weapon is built into a specific head — attach to head slot
      if (weaponData.builtinToHead || item.builtinToHead) {
        if (slots['head'] !== undefined) {
          slots['head'].limb = slots['head'].limb
            ? { ...slots['head'].limb, builtinWeaponId: weaponData.id, _builtinWeapon: weaponData }
            : { id: '_head_weapon', builtinWeaponId: weaponData.id, _builtinWeapon: weaponData };
        }
        continue;
      }

      // builtinToArm: weapon is built into a specific arm — attach to matching arm slot
      if (weaponData.builtinToArm || item.builtinToArm) {
        const armId = weaponData.builtinToArm || item.builtinToArm;
        const targetKey = slotKeys.find((k) => isArmSlot(k) && slots[k].limb?.id === armId)
          ?? firstFreeArmSlot();
        if (targetKey && slots[targetKey] !== undefined) {
          slots[targetKey].limb = slots[targetKey].limb
            ? { ...slots[targetKey].limb, builtinWeaponId: weaponData.id, _builtinWeapon: weaponData }
            : { id: '_arm_weapon', builtinWeaponId: weaponData.id, _builtinWeapon: weaponData };
        }
        continue;
      }

      // replacesArm: weapon occupies the limb slot itself (claw, drill, saw, etc.)
      // fillsAllArmSlots: weapon fills ALL arm slots (shocker-arms, smoke-claws)
      if (weaponData.replacesArm || item.replacesArm) {
        if (weaponData.fillsAllArmSlots || item.fillsAllArmSlots) {
          // Fill every arm slot with this weapon, show only once in equippedWeapons
          const armSlotKeys = slotKeys.filter((k) => isArmSlot(k));
          for (const k of armSlotKeys) {
            slots[k].limb = { ...weaponData, replacesArm: true };
          }
        } else {
          const targetKey = slotKeyForDirection(item.slot ?? null);
          if (targetKey && slots[targetKey] !== undefined) {
            slots[targetKey].limb = { ...weaponData, replacesArm: true };
          }
        }
        continue;
      }

      // shocker_arms style: occupies BOTH arm slots, no manipulator needed
      // Detected by: robotOnly + no replacesArm + no slot direction + UNARMED skill
      if (weaponData.robotOnly && !weaponData.replacesArm && !item.slot &&
          weaponData.mainSkill === 'UNARMED' && !weaponData.builtinManipulator) {
        // Fill all free arm slots with this weapon as limb
        const armSlotKeys = slotKeys.filter((k) => isArmSlot(k));
        for (const k of armSlotKeys) {
          if (slots[k].limb === null) {
            slots[k].limb = { ...weaponData, replacesArm: true };
          }
        }
        continue;
      }

      // requiresWeaponId: find the slot whose limb.id matches
      if (item.requiresWeaponId) {
        const targetKey = slotKeys.find(
          (k) => slots[k].limb?.id === item.requiresWeaponId ||
                 slots[k].limb?.itemId === item.requiresWeaponId ||
                 slots[k].limb?.builtinManipulator && slots[k].limb?.id === item.requiresWeaponId,
        );
        if (targetKey) {
          slots[targetKey].heldWeapon = weaponData;
        }
        // If no matching slot found yet, defer — handled in second pass below
        continue;
      }

      // slot: "left"|"right" — place as heldWeapon in that arm slot
      if (item.slot === 'left' || item.slot === 'right') {
        const targetKey = slotKeyForDirection(item.slot);
        if (targetKey && slots[targetKey] !== undefined) {
          slots[targetKey].heldWeapon = weaponData;
        }
        continue;
      }

      // builtinManipulator weapons — treat as arm limb
      if (weaponData.builtinManipulator) {
        const targetKey = firstFreeArmSlot();
        if (targetKey) {
          slots[targetKey].limb = weaponData;
        }
        continue;
      }

      // Generic weapon — place as heldWeapon in first free arm slot
      const targetKey = firstFreeArmSlot();
      if (targetKey) {
        slots[targetKey].heldWeapon = weaponData;
      } else {
        // No arm slot available — goes to inventory
        inventoryItems.push(item);
      }
      continue;
    }

    // --- Armor layers ------------------------------------------------------
    if (['plating', 'armor', 'frame'].includes(itype)) {
      const armorData = item._armor ?? item;
      const location = armorData.robotLocation ?? item.robotLocation;
      const layer = armorData.layer ?? itype;
      const targetSlotKeys = location ? slotsForLocation(location) : slotKeys;

      for (const k of targetSlotKeys) {
        if (slots[k] !== undefined) {
          slots[k][layer] = armorData;
        }
      }
      continue;
    }

    // --- Modules -----------------------------------------------------------
    if (itype === 'module') {
      modules.push(item);
      continue;
    }

    // --- Everything else → inventory --------------------------------------
    // Skip hidden/auto-injected body parts (robotPart type from kitResolver)
    if (itype === 'robotPart') continue;

    inventoryItems.push(item);
  }

  // Step 2: second pass for requiresWeaponId items that weren't placed yet
  // (limbs may have been placed after the weapon entry in the kit array)
  for (const item of resolvedKitItems) {
    if (item.itemType !== 'weapon' || !item.requiresWeaponId) continue;
    const weaponData = item._weapon ?? item;
    // Check if it was already placed
    const alreadyPlaced = slotKeys.some((k) => slots[k].heldWeapon?.id === weaponData.id);
    if (alreadyPlaced) continue;

    const targetKey = slotKeys.find(
      (k) => slots[k].limb?.id === item.requiresWeaponId ||
             slots[k].limb?.itemId === item.requiresWeaponId,
    );
    if (targetKey) {
      slots[targetKey].heldWeapon = weaponData;
    }
  }

  // Step 3: auto-add default limbs for slots still empty -------------------
  const { heads = [], bodies = [], arms = [], legs = [] } = robotCatalog;

  const defaultHead = heads.find((h) => h.defaultForBodyPlan === bodyPlan);
  const defaultBody = bodies.find((b) => b.robotBodyPlan === bodyPlan);
  // arms are intentionally not referenced here — they must come from the kit
  void arms;
  const defaultLeg  = legs.find(
    (l) => l.compatibleBodyPlans?.includes(bodyPlan) || l.defaultForBodyPlan === bodyPlan,
  );

  for (const k of slotKeys) {
    if (slots[k].limb !== null) continue;

    if (k === 'head' && defaultHead) {
      slots[k].limb = defaultHead;
    } else if (k === 'body' && defaultBody) {
      slots[k].limb = defaultBody;
    } else if (
      (k === 'leftLeg' || k === 'rightLeg' || k === 'chassis' || k === 'thruster') &&
      defaultLeg
    ) {
      slots[k].limb = defaultLeg;
    }
    // Arms are intentionally NOT auto-filled — they come from the kit
  }

  // Step 4: build weapons array from final slot state ----------------------
  const weapons = getBuiltinWeaponsFromSlots(slots);

  return { slots, weapons, modules, inventoryItems };
}

// ---------------------------------------------------------------------------
// getBuiltinWeaponsFromSlots
// ---------------------------------------------------------------------------

/**
 * Builds the equippedWeapons array from the current robot slot state.
 * Sources:
 *  - limb.builtinWeaponId  → weapon with isBuiltin: true
 *  - limb.builtinManipulator: true + no heldWeapon → manipulator as weapon
 *  - slot.heldWeapon        → held weapon with sourceSlot
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

    if (limb) {
      // Limb IS the weapon (replacesArm: claw, drill, saw, shocker-arms, etc.)
      if (limb.replacesArm) {
        // Avoid duplicates: fillsAllArmSlots weapons appear in multiple slots
        if (!weapons.some((w) => w.id === limb.id)) {
          weapons.push({
            ...limb,
            sourceSlot: slotKey,
            isBuiltin: true,
          });
        }
        continue;
      }

      // Built-in weapon referenced by id (head laser, mesmetron, self-destruct, smoke claws)
      if (limb.builtinWeaponId) {
        weapons.push({
          id: limb.builtinWeaponId,
          sourceSlot: slotKey,
          isBuiltin: true,
          ...(limb._builtinWeapon ?? {}),
        });
      }

      // Manipulator with no held weapon — the manipulator itself is the weapon
      if (limb.builtinManipulator && !heldWeapon) {
        weapons.push({
          id: limb.id,
          ...limb,
          sourceSlot: slotKey,
          isManipulator: true,
        });
      }
    }

    // Held weapon in an arm slot
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

  if (!limb?.canHoldWeapons) {
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
