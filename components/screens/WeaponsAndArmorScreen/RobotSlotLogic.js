// RobotSlotLogic.js
// Pure logic extracted from RobotSlot for testability (no React, no UI deps).

import { tWeaponsAndArmorScreen } from './weaponsAndArmorScreenI18n';

/**
 * Builds the slot title, limb name, and stats array for a RobotSlot.
 *
 * Stats shown (in order):
 *   1. Физ.СУ  — physicalDR from limb
 *   2. Энрг.СУ — energyDR from limb
 *   3. Рад.СУ  — radDR from limb
 *   4. Встроенное оружие — only if limb.builtinWeaponId (no "Удерживаемое")
 *   5. Кнопка "Модернизировать конечность"
 *   6. Кнопка "Улучшить обшивку"
 *   7. Кнопка "Улучшить броню"
 *   8. Кнопка "Улучшить раму"
 *
 * @param {string} slotKey
 * @param {object|null|undefined} slotData - { limb, armor, plating, frame, heldWeapon }
 * @param {object} callbacks - { onUpgradeLimb, onUpgradeArmor, onWeaponPress, t }
 * @returns {{ slotTitle: string, limbName: string|null, stats: object[] }}
 */
export const buildRobotSlotStats = (slotKey, slotData, callbacks = {}) => {
  const { onUpgradeLimb, onUpgradeArmor, onWeaponPress, t = tWeaponsAndArmorScreen } = callbacks;

  const limb = slotData?.limb;

  const limbName = limb != null
    ? (limb.name ?? limb.Name ?? null)
    : t('robotSlot.noLimb');

  const slotTitle = t(`robotSlot.slotNames.${slotKey}`) || slotKey;

  const stats = [];

  // --- DR из конечности ---
  const physDR = limb?.physicalDR ?? null;
  const energyDR = limb?.energyDR ?? null;
  const radDR = limb?.radDR ?? null;

  stats.push({
    label: t('armor.fields.physical'),
    value: physDR !== null ? String(physDR) : t('common.none'),
    type: 'value',
  });
  stats.push({
    label: t('armor.fields.energy'),
    value: energyDR !== null ? String(energyDR) : t('common.none'),
    type: 'value',
  });
  stats.push({
    label: t('armor.fields.radiation'),
    value: radDR !== null ? String(radDR) : t('common.none'),
    type: 'value',
  });

  // --- Встроенное оружие (только builtinWeaponId, не heldWeapon) ---
  if (limb?.builtinWeaponId) {
    const builtinWeapon = { id: limb.builtinWeaponId, isBuiltin: true, ...limb._builtinWeapon };
    const weaponName = builtinWeapon.name ?? builtinWeapon.Name ?? builtinWeapon.id ?? t('common.empty');

    if (onWeaponPress) {
      stats.push({
        label: t('robotSlot.weapon.builtin'),
        value: weaponName,
        type: 'button',
        onPress: () => onWeaponPress(builtinWeapon),
      });
    } else {
      stats.push({
        label: t('robotSlot.weapon.builtin'),
        value: weaponName,
        type: 'value',
      });
    }
  }

  // --- Кнопки апгрейда ---
  stats.push({
    label: t('robotSlot.buttons.upgradeLimb'),
    value: '⋯',
    type: 'button',
    onPress: () => onUpgradeLimb && onUpgradeLimb(slotKey),
  });
  stats.push({
    label: t('robotSlot.buttons.upgradePlating'),
    value: '⋯',
    type: 'button',
    onPress: () => onUpgradeArmor && onUpgradeArmor('plating'),
  });
  stats.push({
    label: t('robotSlot.buttons.upgradeArmor'),
    value: '⋯',
    type: 'button',
    onPress: () => onUpgradeArmor && onUpgradeArmor('armor'),
  });
  stats.push({
    label: t('robotSlot.buttons.upgradeFrame'),
    value: '⋯',
    type: 'button',
    onPress: () => onUpgradeArmor && onUpgradeArmor('frame'),
  });

  return { slotTitle, limbName, stats };
};
