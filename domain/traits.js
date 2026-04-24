// domain/traits.js
// Pure trait logic: loading data, reading modifiers, display helpers.
// No React, no UI dependencies. All identifiers and code in English.

import traitsJson from '../data/traits/traits.json';
import originsJson from '../data/origins/origins.json';

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------

/**
 * Returns the full traits array from data/traits/traits.json.
 * Synchronous — JSON is bundled at build time.
 */
export function loadTraitsData() {
  return traitsJson;
}

/**
 * Returns the full origins array from data/origins/origins.json.
 * Synchronous — JSON is bundled at build time.
 */
export function loadOriginsData() {
  return originsJson;
}

// ---------------------------------------------------------------------------
// Trait lookup helpers
// ---------------------------------------------------------------------------

/**
 * Find a trait entry by its id.
 * Returns undefined if not found.
 */
export function findTraitByName(name) {
  if (!name) return undefined;
  return traitsJson.find((t) => t.id === name);
}

/**
 * Find a trait entry by its id.
 */
export function findTraitById(id) {
  if (!id) return undefined;
  return traitsJson.find((t) => t.id === id);
}

// ---------------------------------------------------------------------------
// Modifiers
// ---------------------------------------------------------------------------

/**
 * Returns the modifiers object for a trait.
 * Accepts either a trait data object (from JSON) or a runtime trait object
 * (which has a `name` field matching cyrillicName and a `modifiers` field).
 *
 * @param {object} trait - trait object (runtime or data)
 * @returns {object} modifiers map (never null)
 */
export function getTraitModifiers(trait) {
  if (!trait) return {};

  // Runtime trait objects already carry modifiers directly
  if (trait.modifiers && typeof trait.modifiers === 'object') {
    return trait.modifiers;
  }

  // Data-layer trait (from JSON) — modifiers are on the object itself
  const dataEntry = findTraitByName(trait.name) || findTraitById(trait.id);
  return dataEntry?.modifiers ?? {};
}

/**
 * Returns attribute min/max limits imposed by a trait.
 * Shape: { STR: { min, max }, END: { min, max }, ... }
 * Only attributes that have overrides are included.
 */
export function getTraitAttributeLimits(trait) {
  const modifiers = getTraitModifiers(trait);
  const result = {};

  // Legacy flat format: minLimits / maxLimits maps
  const minLimits = modifiers.minLimits || {};
  const maxLimits = modifiers.maxLimits || {};

  // New JSON format: attributes[key].min / attributes[key].max
  const attrMods = modifiers.attributes || {};
  for (const [key, val] of Object.entries(attrMods)) {
    if (val && (val.min !== undefined || val.max !== undefined)) {
      result[key] = {
        min: val.min ?? minLimits[key],
        max: val.max ?? maxLimits[key],
      };
    }
  }

  // Merge legacy flat limits for keys not already covered
  for (const [key, val] of Object.entries(minLimits)) {
    if (!result[key]) result[key] = {};
    result[key].min = val;
  }
  for (const [key, val] of Object.entries(maxLimits)) {
    if (!result[key]) result[key] = {};
    result[key].max = val;
  }

  return result;
}

/**
 * Returns the list of immunities granted by a trait.
 * @returns {string[]} e.g. ['radiation', 'poison']
 */
export function getTraitImmunities(trait) {
  const modifiers = getTraitModifiers(trait);
  return Array.isArray(modifiers.immunities) ? modifiers.immunities : [];
}

/**
 * Returns the max skill rank allowed by a trait (default 6).
 */
export function getTraitSkillMaxValue(trait) {
  const modifiers = getTraitModifiers(trait);
  return modifiers.skillMaxValue ?? 6;
}

/**
 * Returns the number of extra tagged skills granted by a trait (default 0).
 */
export function getTraitExtraSkills(trait) {
  const modifiers = getTraitModifiers(trait);
  return modifiers.extraSkills ?? 0;
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

/**
 * Returns the i18n key for the trait's display description.
 * Callers should pass this key to their t() function.
 *
 * For runtime trait objects that carry a pre-built description string,
 * the function returns the descriptionKey from the data layer if available,
 * falling back to the trait's own descriptionKey field.
 *
 * @param {object} trait - runtime or data trait object
 * @returns {string} i18n key, or empty string if not found
 */
export function getTraitDescriptionKey(trait) {
  if (!trait) return '';

  // Try to find the canonical data entry
  const dataEntry = findTraitByName(trait.name) || findTraitById(trait.id);
  if (dataEntry?.descriptionKey) return dataEntry.descriptionKey;

  // Fallback: trait object may carry descriptionKey directly
  return trait.descriptionKey || '';
}

/**
 * Returns the i18n key for the trait's display name.
 *
 * @param {object} trait - runtime or data trait object
 * @returns {string} i18n key, or empty string if not found
 */
export function getTraitNameKey(trait) {
  if (!trait) return '';
  const dataEntry = findTraitByName(trait.name) || findTraitById(trait.id);
  if (dataEntry?.displayNameKey) return dataEntry.displayNameKey;
  return trait.displayNameKey || '';
}

/**
 * Returns the trait description i18n key for UI display.
 * The UI can pass this key to t() directly.
 *
 * @param {object} trait - runtime or data trait object
 * @returns {string}
 */
export function getTraitDisplayDescription(trait) {
  return getTraitDescriptionKey(trait);
}
