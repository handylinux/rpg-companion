# Fallout Character Sheet App

## Overview
This is a React Native Expo application that serves as a character sheet companion for Fallout RPG. The app provides a comprehensive interface for managing character stats, equipment, inventory, and perks in a Fallout-themed UI.

## Project Architecture
- **Framework**: React Native with Expo SDK 53.0.0
- **UI Library**: React Native Paper, React Navigation
- **Platform**: Cross-platform (Web, iOS, Android)
- **Language**: JavaScript with Russian localization
- **Assets**: JSON data files for equipment, perks, origins, and random loot

## Key Features
- Character creation and management
- Equipment and weapon tracking
- Inventory management
- Perks and traits system
- Multiple character origins (Vault Dweller, Brotherhood, NCR, etc.)
- Random loot generation
- Russian language interface

## Project Structure
```
├── components/
│   ├── screens/           # Main application screens
│   │   ├── HomeScreen/    # Character manager (grid of saved characters)
│   │   ├── CharacterScreen/
│   │   ├── InventoryScreen/
│   │   ├── PerksAndTraitsScreen/
│   │   └── WeaponsAndArmorScreen/
│   └── CharacterContext.js
├── db/                   # Database layer
│   ├── index.js          # Re-exports all db functions
│   ├── Database.js       # Facade + high-level query functions
│   ├── schema.js         # Table definitions (DDL)
│   ├── seed.js           # Populates tables from JSON on first run
│   └── adapters/
│       ├── SQLiteAdapter.js  # expo-sqlite (iOS/Android)
│       └── WebAdapter.js     # AsyncStorage-backed (Web)
├── assets/               # Images and data files
│   ├── Equipment/        # Source JSON (weapons, armor, items)
│   ├── origins/          # Character origin images
│   ├── Perks/           # Source JSON (perks)
│   └── RandomLoot/      # Loot tables
├── App.js               # Main app component + DB init on startup
├── index.js             # Entry point
└── package.json         # Dependencies
```

## Recent Changes (March 13, 2026)
- **Updated Weapons Data**: All 101 weapons with new id-based format (weapon_001..weapon_101); English keys, Russian names
- **Updated Weapon Mods**: 197 mods with id-system (mod_001..mod_197), `applies_to_ids` arrays, slot groupings
- **Added Ammo Types**: 36 ammo types with id-refs (ammo_001..ammo_036)
- **Added Weapon Qualities**: 37 weapon qualities with rules descriptions
- **Added Mod Overrides**: slot-based mod assignments for 32 weapons
- **Schema v2**: New tables: `weapon_mod_slots`, `ammo_types`, `weapon_qualities`; all weapons/mods tables use id-primary-keys
- **Auto-Reseed**: Schema version bump triggers automatic data refresh on both Web (AsyncStorage) and Native (SQLite)
- **WebAdapter Fix**: `readTable` now always returns array; `schema_meta` stored as row-array compatible with SQL queries

## Development Setup
- **Port**: 5000 (web development server)
- **Workflow**: Expo Web Server
- **Command**: `npx expo start --web --port 5000`
- **Environment**: Replit NixOS with Node.js 20

## Dependencies (Current Working Configuration)
- expo: ~53.0.22 
- react: 19.0.0
- react-native: 0.79.6 (minor version mismatch warning with SDK 53)
- react-native-paper: 4.9.2
- @react-navigation/native & material-top-tabs (using wildcard versions)
- expo-asset, expo-font, react-dom, react-native-web

## Production Setup
- **Build Scripts**: Added `npm run build` (expo export --platform web) and `npm run serve`
- **Static Serving**: Uses serve package for production-ready static file serving
- **Deployment**: Can be configured for static web hosting

## Completed Features (March 11, 2026 Session)
- ✅ Character naming system with validation (requires at least 1 character)
- ✅ Skills counting bug fixed - proper separation of main (3) vs extra skills
- ✅ Intensive Training perk temporary attribute allocation
- ✅ Form state gating - name must be saved before other fields accessible
- ✅ PerkSelectModal improvements

## Planned Features (Future)
- Character save/load system (saving to components/chars directory)
- Character manager startup screen with grid layout
- Character thumbnails display on startup screen
- Real-time character file updates

## Known Issues & Future Improvements
- Minor React text node warning (doesn't affect functionality)
- Navigation packages use wildcard versions (should be pinned for production)
- Consider updating to exact Expo SDK 53 dependency versions
- Shadow props deprecation warnings (cosmetic)

## User Preferences
- Russian language interface
- Fallout-themed dark UI with yellow accents
- Tab-based navigation (Character, Equipment, Inventory, Perks)
- Mobile-first design that works on web

## Notes
- Application successfully loads and displays character management interface
- All navigation tabs functional
- Asset loading working correctly
- Minor warnings in console (shadow props deprecation) but no critical errors