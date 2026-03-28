import type { SlotDef, SlotId } from '../types';

// ─── Heads ────────────────────────────────────────────────────────────────────
const HEAD_ITEMS = [
  // Tissu
  { id: 'HEAD_CLOTH_SET1',     label: 'Scholar Cowl',       category: 'Tissu' },
  { id: 'HEAD_CLOTH_SET2',     label: 'Cleric Cowl',        category: 'Tissu' },
  { id: 'HEAD_CLOTH_SET3',     label: 'Mage Cowl',          category: 'Tissu' },
  { id: 'HEAD_CLOTH_ROYAL',    label: 'Royal Cowl',         category: 'Tissu' },
  { id: 'HEAD_CLOTH_KEEPER',   label: 'Druid Cowl',         category: 'Tissu' },
  { id: 'HEAD_CLOTH_HELL',     label: 'Fiend Cowl',         category: 'Tissu' },
  { id: 'HEAD_CLOTH_MORGANA',  label: 'Cultist Cowl',       category: 'Tissu' },
  { id: 'HEAD_CLOTH_FEY',      label: 'Feyscale Hat',       category: 'Tissu' },
  { id: 'HEAD_CLOTH_AVALON',   label: 'Cowl of Purity',     category: 'Tissu' },
  // Cuir
  { id: 'HEAD_LEATHER_SET1',   label: 'Mercenary Hood',     category: 'Cuir' },
  { id: 'HEAD_LEATHER_SET2',   label: 'Hunter Hood',        category: 'Cuir' },
  { id: 'HEAD_LEATHER_SET3',   label: 'Assassin Hood',      category: 'Cuir' },
  { id: 'HEAD_LEATHER_ROYAL',  label: 'Royal Hood',         category: 'Cuir' },
  { id: 'HEAD_LEATHER_MORGANA',label: 'Stalker Hood',       category: 'Cuir' },
  { id: 'HEAD_LEATHER_HELL',   label: 'Hellion Hood',       category: 'Cuir' },
  { id: 'HEAD_LEATHER_UNDEAD', label: 'Specter Hood',       category: 'Cuir' },
  { id: 'HEAD_LEATHER_FEY',    label: 'Mistwalker Hood',    category: 'Cuir' },
  { id: 'HEAD_LEATHER_AVALON', label: 'Hood of Tenacity',   category: 'Cuir' },
  // Plaque
  { id: 'HEAD_PLATE_SET1',     label: 'Soldier Helmet',     category: 'Plaque' },
  { id: 'HEAD_PLATE_SET2',     label: 'Knight Helmet',      category: 'Plaque' },
  { id: 'HEAD_PLATE_SET3',     label: 'Guardian Helmet',    category: 'Plaque' },
  { id: 'HEAD_PLATE_ROYAL',    label: 'Royal Helmet',       category: 'Plaque' },
  { id: 'HEAD_PLATE_UNDEAD',   label: 'Graveguard Helmet',  category: 'Plaque' },
  { id: 'HEAD_PLATE_HELL',     label: 'Demon Helmet',       category: 'Plaque' },
  { id: 'HEAD_PLATE_KEEPER',   label: 'Judicator Helmet',   category: 'Plaque' },
  { id: 'HEAD_PLATE_FEY',      label: 'Duskweaver Helmet',  category: 'Plaque' },
  { id: 'HEAD_PLATE_AVALON',   label: 'Helmet of Valor',    category: 'Plaque' },
];

// ─── Armors ───────────────────────────────────────────────────────────────────
const ARMOR_ITEMS = [
  // Tissu
  { id: 'ARMOR_CLOTH_SET1',    label: 'Scholar Robe',       category: 'Tissu' },
  { id: 'ARMOR_CLOTH_SET2',    label: 'Cleric Robe',        category: 'Tissu' },
  { id: 'ARMOR_CLOTH_SET3',    label: 'Mage Robe',          category: 'Tissu' },
  { id: 'ARMOR_CLOTH_ROYAL',   label: 'Royal Robe',         category: 'Tissu' },
  { id: 'ARMOR_CLOTH_KEEPER',  label: 'Druid Robe',         category: 'Tissu' },
  { id: 'ARMOR_CLOTH_HELL',    label: 'Fiend Robe',         category: 'Tissu' },
  { id: 'ARMOR_CLOTH_MORGANA', label: 'Cultist Robe',       category: 'Tissu' },
  { id: 'ARMOR_CLOTH_FEY',     label: 'Feyscale Robe',      category: 'Tissu' },
  { id: 'ARMOR_CLOTH_AVALON',  label: 'Robe of Purity',     category: 'Tissu' },
  // Cuir
  { id: 'ARMOR_LEATHER_SET1',  label: 'Mercenary Jacket',   category: 'Cuir' },
  { id: 'ARMOR_LEATHER_SET2',  label: 'Hunter Jacket',      category: 'Cuir' },
  { id: 'ARMOR_LEATHER_SET3',  label: 'Assassin Jacket',    category: 'Cuir' },
  { id: 'ARMOR_LEATHER_ROYAL', label: 'Royal Jacket',       category: 'Cuir' },
  { id: 'ARMOR_LEATHER_MORGANA',label:'Stalker Jacket',     category: 'Cuir' },
  { id: 'ARMOR_LEATHER_HELL',  label: 'Hellion Jacket',     category: 'Cuir' },
  { id: 'ARMOR_LEATHER_UNDEAD',label: 'Specter Jacket',     category: 'Cuir' },
  { id: 'ARMOR_LEATHER_FEY',   label: 'Mistwalker Jacket',  category: 'Cuir' },
  { id: 'ARMOR_LEATHER_AVALON',label: 'Jacket of Tenacity', category: 'Cuir' },
  // Plaque
  { id: 'ARMOR_PLATE_SET1',    label: 'Soldier Armor',      category: 'Plaque' },
  { id: 'ARMOR_PLATE_SET2',    label: 'Knight Armor',       category: 'Plaque' },
  { id: 'ARMOR_PLATE_SET3',    label: 'Guardian Armor',     category: 'Plaque' },
  { id: 'ARMOR_PLATE_ROYAL',   label: 'Royal Armor',        category: 'Plaque' },
  { id: 'ARMOR_PLATE_UNDEAD',  label: 'Graveguard Armor',   category: 'Plaque' },
  { id: 'ARMOR_PLATE_HELL',    label: 'Demon Armor',        category: 'Plaque' },
  { id: 'ARMOR_PLATE_KEEPER',  label: 'Judicator Armor',    category: 'Plaque' },
  { id: 'ARMOR_PLATE_FEY',     label: 'Duskweaver Armor',   category: 'Plaque' },
  { id: 'ARMOR_PLATE_AVALON',  label: 'Armor of Valor',     category: 'Plaque' },
];

// ─── Feet ─────────────────────────────────────────────────────────────────────
const FEET_ITEMS = [
  // Tissu
  { id: 'SHOES_CLOTH_SET1',    label: 'Scholar Sandals',    category: 'Tissu' },
  { id: 'SHOES_CLOTH_SET2',    label: 'Cleric Sandals',     category: 'Tissu' },
  { id: 'SHOES_CLOTH_SET3',    label: 'Mage Sandals',       category: 'Tissu' },
  { id: 'SHOES_CLOTH_ROYAL',   label: 'Royal Sandals',      category: 'Tissu' },
  { id: 'SHOES_CLOTH_KEEPER',  label: 'Druid Sandals',      category: 'Tissu' },
  { id: 'SHOES_CLOTH_HELL',    label: 'Fiend Sandals',      category: 'Tissu' },
  { id: 'SHOES_CLOTH_MORGANA', label: 'Cultist Sandals',    category: 'Tissu' },
  { id: 'SHOES_CLOTH_FEY',     label: 'Feyscale Sandals',   category: 'Tissu' },
  { id: 'SHOES_CLOTH_AVALON',  label: 'Shoes of Purity',    category: 'Tissu' },
  // Cuir
  { id: 'SHOES_LEATHER_SET1',  label: 'Mercenary Shoes',    category: 'Cuir' },
  { id: 'SHOES_LEATHER_SET2',  label: 'Hunter Shoes',       category: 'Cuir' },
  { id: 'SHOES_LEATHER_SET3',  label: 'Assassin Shoes',     category: 'Cuir' },
  { id: 'SHOES_LEATHER_ROYAL', label: 'Royal Shoes',        category: 'Cuir' },
  { id: 'SHOES_LEATHER_MORGANA',label:'Stalker Shoes',      category: 'Cuir' },
  { id: 'SHOES_LEATHER_HELL',  label: 'Hellion Shoes',      category: 'Cuir' },
  { id: 'SHOES_LEATHER_UNDEAD',label: 'Specter Shoes',      category: 'Cuir' },
  { id: 'SHOES_LEATHER_FEY',   label: 'Mistwalker Shoes',   category: 'Cuir' },
  { id: 'SHOES_LEATHER_AVALON',label: 'Shoes of Tenacity',  category: 'Cuir' },
  // Plaque
  { id: 'SHOES_PLATE_SET1',    label: 'Soldier Boots',      category: 'Plaque' },
  { id: 'SHOES_PLATE_SET2',    label: 'Knight Boots',       category: 'Plaque' },
  { id: 'SHOES_PLATE_SET3',    label: 'Guardian Boots',     category: 'Plaque' },
  { id: 'SHOES_PLATE_ROYAL',   label: 'Royal Boots',        category: 'Plaque' },
  { id: 'SHOES_PLATE_UNDEAD',  label: 'Graveguard Boots',   category: 'Plaque' },
  { id: 'SHOES_PLATE_HELL',    label: 'Demon Boots',        category: 'Plaque' },
  { id: 'SHOES_PLATE_KEEPER',  label: 'Judicator Boots',    category: 'Plaque' },
  { id: 'SHOES_PLATE_FEY',     label: 'Duskweaver Boots',   category: 'Plaque' },
  { id: 'SHOES_PLATE_AVALON',  label: 'Boots of Valor',     category: 'Plaque' },
];

// ─── Weapons (1H + 2H merged, sorted by category) ─────────────────────────────
// is2H is determined automatically by checking if the selected ID starts with '2H_'
const WEAPON_ITEMS = [
  // Épée
  { id: 'MAIN_SWORD',                  label: 'Broadsword',            category: 'Épée' },
  { id: 'MAIN_SCIMITAR_MORGANA',       label: 'Clarent Blade',         category: 'Épée' },
  { id: 'MAIN_SWORD_CRYSTAL',          label: 'Infinity Blade',        category: 'Épée' },
  { id: '2H_CLAYMORE',                 label: 'Claymore',              category: 'Épée' },
  { id: '2H_DUALSWORD',                label: 'Dual Swords',           category: 'Épée' },
  { id: '2H_CLEAVER_HELL',             label: 'Carving Sword',         category: 'Épée' },
  { id: '2H_DUALSCIMITAR_UNDEAD',      label: 'Galatine Pair',         category: 'Épée' },
  { id: '2H_CLAYMORE_AVALON',          label: 'Kingmaker',             category: 'Épée' },
  // Hache
  { id: 'MAIN_AXE',                    label: 'Battleaxe',             category: 'Hache' },
  { id: '2H_AXE',                      label: 'Greataxe',              category: 'Hache' },
  { id: '2H_HALBERD',                  label: 'Halberd',               category: 'Hache' },
  { id: '2H_HALBERD_MORGANA',          label: 'Carrioncaller',         category: 'Hache' },
  { id: '2H_SCYTHE_HELL',              label: 'Infernal Scythe',       category: 'Hache' },
  { id: '2H_SCYTHE_CRYSTAL',           label: 'Crystal Reaper',        category: 'Hache' },
  { id: '2H_TWINSCYTHE_HELL',          label: 'Soulscythe',            category: 'Hache' },
  { id: '2H_DUALAXE_KEEPER',           label: 'Bear Paws',             category: 'Hache' },
  { id: '2H_AXE_AVALON',               label: 'Realmbreaker',          category: 'Hache' },
  // Marteau
  { id: 'MAIN_HAMMER',                 label: 'Hammer',                category: 'Marteau' },
  { id: '2H_POLEHAMMER',               label: 'Polehammer',            category: 'Marteau' },
  { id: '2H_HAMMER',                   label: 'Great Hammer',          category: 'Marteau' },
  { id: '2H_HAMMER_UNDEAD',            label: 'Tombhammer',            category: 'Marteau' },
  { id: '2H_HAMMER_CRYSTAL',           label: 'Truebolt Hammer',       category: 'Marteau' },
  { id: '2H_DUALHAMMER_HELL',          label: 'Forge Hammers',         category: 'Marteau' },
  { id: '2H_HAMMER_AVALON',            label: 'Hand of Justice',       category: 'Marteau' },
  // Masse
  { id: 'MAIN_MACE',                   label: 'Mace',                  category: 'Masse' },
  { id: 'MAIN_ROCKMACE_KEEPER',        label: 'Bedrock Mace',          category: 'Masse' },
  { id: 'MAIN_MACE_HELL',              label: 'Incubus Mace',          category: 'Masse' },
  { id: 'MAIN_MACE_CRYSTAL',           label: 'Dreadstorm Monarch',    category: 'Masse' },
  { id: '2H_MACE',                     label: 'Heavy Mace',            category: 'Masse' },
  { id: '2H_FLAIL',                    label: 'Morning Star',          category: 'Masse' },
  { id: '2H_MACE_MORGANA',             label: 'Camlann Mace',          category: 'Masse' },
  { id: '2H_DUALMACE_AVALON',          label: 'Oathkeepers',           category: 'Masse' },
  // Dague
  { id: 'MAIN_DAGGER',                 label: 'Dagger',                category: 'Dague' },
  { id: 'MAIN_RAPIER_MORGANA',         label: 'Bloodletter',           category: 'Dague' },
  { id: 'MAIN_DAGGER_HELL',            label: 'Demonfang',             category: 'Dague' },
  { id: '2H_DAGGERPAIR',               label: 'Dagger Pair',           category: 'Dague' },
  { id: '2H_CLAWPAIR',                 label: 'Claws',                 category: 'Dague' },
  { id: '2H_DUALSICKLE_UNDEAD',        label: 'Deathgivers',           category: 'Dague' },
  { id: '2H_DAGGERPAIR_CRYSTAL',       label: 'Twin Slayers',          category: 'Dague' },
  { id: '2H_DAGGER_KATAR_AVALON',      label: 'Bridled Fury',          category: 'Dague' },
  // Lance
  { id: 'MAIN_SPEAR',                  label: 'Spear',                 category: 'Lance' },
  { id: 'MAIN_SPEAR_KEEPER',           label: 'Heron Spear',           category: 'Lance' },
  { id: 'MAIN_SPEAR_LANCE_AVALON',     label: 'Daybreaker',            category: 'Lance' },
  { id: '2H_SPEAR',                    label: 'Pike',                  category: 'Lance' },
  { id: '2H_GLAIVE',                   label: 'Glaive',                category: 'Lance' },
  { id: '2H_HARPOON_HELL',             label: 'Spirithunter',          category: 'Lance' },
  { id: '2H_GLAIVE_CRYSTAL',           label: 'Rift Glaive',           category: 'Lance' },
  { id: '2H_TRIDENT_UNDEAD',           label: 'Trinity Spear',         category: 'Lance' },
  // Arc
  { id: '2H_BOW',                      label: 'Bow',                   category: 'Arc' },
  { id: '2H_WARBOW',                   label: 'Warbow',                category: 'Arc' },
  { id: '2H_LONGBOW',                  label: 'Longbow',               category: 'Arc' },
  { id: '2H_LONGBOW_UNDEAD',           label: 'Whispering Bow',        category: 'Arc' },
  { id: '2H_BOW_HELL',                 label: 'Wailing Bow',           category: 'Arc' },
  { id: '2H_BOW_KEEPER',               label: 'Bow of Badon',          category: 'Arc' },
  { id: '2H_BOW_CRYSTAL',              label: 'Skystrider Bow',        category: 'Arc' },
  { id: '2H_BOW_AVALON',               label: 'Mistpiercer',           category: 'Arc' },
  // Arbalète
  { id: 'MAIN_1HCROSSBOW',             label: 'Light Crossbow',        category: 'Arbalète' },
  { id: '2H_CROSSBOW',                 label: 'Crossbow',              category: 'Arbalète' },
  { id: '2H_CROSSBOWLARGE',            label: 'Heavy Crossbow',        category: 'Arbalète' },
  { id: '2H_REPEATINGCROSSBOW_UNDEAD', label: 'Weeping Repeater',      category: 'Arbalète' },
  { id: '2H_CROSSBOWLARGE_MORGANA',    label: 'Siegebow',              category: 'Arbalète' },
  { id: '2H_DUALCROSSBOW_CRYSTAL',     label: 'Arclight Blasters',     category: 'Arbalète' },
  { id: '2H_DUALCROSSBOW_HELL',        label: 'Boltcasters',           category: 'Arbalète' },
  { id: '2H_CROSSBOW_CANNON_AVALON',   label: 'Energy Shaper',         category: 'Arbalète' },
  // Bâton
  { id: '2H_QUARTERSTAFF',             label: 'Quarterstaff',          category: 'Bâton' },
  { id: '2H_IRONCLADEDSTAFF',          label: 'Iron-clad Staff',       category: 'Bâton' },
  { id: '2H_DOUBLEBLADEDSTAFF',        label: 'Double Bladed Staff',   category: 'Bâton' },
  { id: '2H_COMBATSTAFF_MORGANA',      label: 'Black Monk Stave',      category: 'Bâton' },
  { id: '2H_DOUBLEBLADEDSTAFF_CRYSTAL',label: 'Phantom Twinblade',     category: 'Bâton' },
  { id: '2H_RAM_KEEPER',               label: 'Grovekeeper',           category: 'Bâton' },
  { id: '2H_ROCKSTAFF_KEEPER',         label: 'Staff of Balance',      category: 'Bâton' },
  { id: '2H_QUARTERSTAFF_AVALON',      label: 'Grailseeker',           category: 'Bâton' },
  // Poing
  { id: '2H_KNUCKLES_SET1',            label: 'Brawler Gloves',        category: 'Poing' },
  { id: '2H_KNUCKLES_SET2',            label: 'Battle Bracers',        category: 'Poing' },
  { id: '2H_KNUCKLES_SET3',            label: 'Spiked Gauntlets',      category: 'Poing' },
  { id: '2H_KNUCKLES_KEEPER',          label: 'Ursine Maulers',        category: 'Poing' },
  { id: '2H_KNUCKLES_MORGANA',         label: 'Ravenstrike Cestus',    category: 'Poing' },
  { id: '2H_KNUCKLES_HELL',            label: 'Hellfire Hands',        category: 'Poing' },
  { id: '2H_IRONGAUNTLETS_HELL',       label: 'Black Hands',           category: 'Poing' },
  { id: '2H_KNUCKLES_AVALON',          label: 'Fists of Avalon',       category: 'Poing' },
  { id: '2H_KNUCKLES_CRYSTAL',         label: 'Forcepulse Bracers',    category: 'Poing' },
  // Shapeshifter
  { id: '2H_SHAPESHIFTER_SET1',        label: 'Prowling Staff',        category: 'Shapeshifter' },
  { id: '2H_SHAPESHIFTER_SET2',        label: 'Rootbound Staff',       category: 'Shapeshifter' },
  { id: '2H_SHAPESHIFTER_SET3',        label: 'Primal Staff',          category: 'Shapeshifter' },
  { id: '2H_SHAPESHIFTER_KEEPER',      label: 'Earthrune Staff',       category: 'Shapeshifter' },
  { id: '2H_SHAPESHIFTER_HELL',        label: 'Hellspawn Staff',       category: 'Shapeshifter' },
  { id: '2H_SHAPESHIFTER_MORGANA',     label: 'Bloodmoon Staff',       category: 'Shapeshifter' },
  { id: '2H_SHAPESHIFTER_AVALON',      label: 'Lightcaller',           category: 'Shapeshifter' },
  { id: '2H_SHAPESHIFTER_CRYSTAL',     label: 'Stillgaze Staff',       category: 'Shapeshifter' },
  // Magie
  { id: 'MAIN_FIRESTAFF',              label: 'Fire Staff',            category: 'Magie' },
  { id: 'MAIN_FIRESTAFF_KEEPER',       label: 'Wildfire Staff',        category: 'Magie' },
  { id: 'MAIN_FIRESTAFF_CRYSTAL',      label: 'Flamewalker Staff',     category: 'Magie' },
  { id: 'MAIN_FROSTSTAFF',             label: 'Frost Staff',           category: 'Magie' },
  { id: 'MAIN_FROSTSTAFF_KEEPER',      label: 'Hoarfrost Staff',       category: 'Magie' },
  { id: 'MAIN_FROSTSTAFF_AVALON',      label: 'Chillhowl',            category: 'Magie' },
  { id: 'MAIN_ARCANESTAFF',            label: 'Arcane Staff',          category: 'Magie' },
  { id: 'MAIN_ARCANESTAFF_UNDEAD',     label: 'Witchwork Staff',       category: 'Magie' },
  { id: 'MAIN_CURSEDSTAFF',            label: 'Cursed Staff',          category: 'Magie' },
  { id: 'MAIN_CURSEDSTAFF_UNDEAD',     label: 'Lifecurse Staff',       category: 'Magie' },
  { id: 'MAIN_CURSEDSTAFF_AVALON',     label: 'Shadowcaller',          category: 'Magie' },
  { id: 'MAIN_CURSEDSTAFF_CRYSTAL',    label: 'Rotcaller Staff',       category: 'Magie' },
  { id: 'MAIN_HOLYSTAFF',              label: 'Holy Staff',            category: 'Magie' },
  { id: 'MAIN_HOLYSTAFF_MORGANA',      label: 'Lifetouch Staff',       category: 'Magie' },
  { id: 'MAIN_HOLYSTAFF_AVALON',       label: 'Hallowfall',            category: 'Magie' },
  { id: 'MAIN_NATURESTAFF',            label: 'Nature Staff',          category: 'Magie' },
  { id: 'MAIN_NATURESTAFF_KEEPER',     label: 'Druidic Staff',         category: 'Magie' },
  { id: 'MAIN_NATURESTAFF_AVALON',     label: 'Ironroot Staff',        category: 'Magie' },
  { id: 'MAIN_NATURESTAFF_CRYSTAL',    label: 'Forgebark Staff',       category: 'Magie' },
  { id: '2H_FIRESTAFF',                label: 'Great Fire Staff',      category: 'Magie' },
  { id: '2H_INFERNOSTAFF',             label: 'Infernal Staff',        category: 'Magie' },
  { id: '2H_FIRESTAFF_HELL',           label: 'Brimstone Staff',       category: 'Magie' },
  { id: '2H_INFERNOSTAFF_MORGANA',     label: 'Blazing Staff',         category: 'Magie' },
  { id: '2H_FIRE_RINGPAIR_AVALON',     label: 'Dawnsong',              category: 'Magie' },
  { id: '2H_FROSTSTAFF',               label: 'Great Frost Staff',     category: 'Magie' },
  { id: '2H_GLACIALSTAFF',             label: 'Glacial Staff',         category: 'Magie' },
  { id: '2H_ICECRYSTAL_UNDEAD',        label: 'Permafrost Prism',      category: 'Magie' },
  { id: '2H_ICEGAUNTLETS_HELL',        label: 'Icicle Staff',          category: 'Magie' },
  { id: '2H_FROSTSTAFF_CRYSTAL',       label: 'Arctic Staff',          category: 'Magie' },
  { id: '2H_ARCANESTAFF',              label: 'Great Arcane Staff',    category: 'Magie' },
  { id: '2H_ENIGMATICSTAFF',           label: 'Enigmatic Staff',       category: 'Magie' },
  { id: '2H_ENIGMATICORB_MORGANA',     label: 'Malevolent Locus',      category: 'Magie' },
  { id: '2H_ARCANESTAFF_HELL',         label: 'Occult Staff',          category: 'Magie' },
  { id: '2H_ARCANESTAFF_CRYSTAL',      label: 'Astral Staff',          category: 'Magie' },
  { id: '2H_ARCANE_RINGPAIR_AVALON',   label: 'Evensong',              category: 'Magie' },
  { id: '2H_CURSEDSTAFF',              label: 'Great Cursed Staff',    category: 'Magie' },
  { id: '2H_DEMONICSTAFF',             label: 'Demonic Staff',         category: 'Magie' },
  { id: '2H_SKULLORB_HELL',            label: 'Cursed Skull',          category: 'Magie' },
  { id: '2H_CURSEDSTAFF_MORGANA',      label: 'Damnation Staff',       category: 'Magie' },
  { id: '2H_HOLYSTAFF',                label: 'Great Holy Staff',      category: 'Magie' },
  { id: '2H_DIVINESTAFF',              label: 'Divine Staff',          category: 'Magie' },
  { id: '2H_HOLYSTAFF_UNDEAD',         label: 'Redemption Staff',      category: 'Magie' },
  { id: '2H_HOLYSTAFF_HELL',           label: 'Fallen Staff',          category: 'Magie' },
  { id: '2H_HOLYSTAFF_CRYSTAL',        label: 'Exalted Staff',         category: 'Magie' },
  { id: '2H_NATURESTAFF',              label: 'Great Nature Staff',    category: 'Magie' },
  { id: '2H_WILDSTAFF',                label: 'Wild Staff',            category: 'Magie' },
  { id: '2H_NATURESTAFF_KEEPER',       label: 'Rampant Staff',         category: 'Magie' },
  { id: '2H_NATURESTAFF_HELL',         label: 'Blight Staff',          category: 'Magie' },
];

// ─── Offhand (prefix: OFF_) ───────────────────────────────────────────────────
const OFFHAND_ITEMS = [
  // Bouclier
  { id: 'OFF_SHIELD',                  label: 'Shield',              category: 'Bouclier' },
  { id: 'OFF_TOWERSHIELD_UNDEAD',      label: 'Sarcophagus',         category: 'Bouclier' },
  { id: 'OFF_SHIELD_HELL',             label: 'Caitiff Shield',      category: 'Bouclier' },
  { id: 'OFF_SPIKEDSHIELD_MORGANA',    label: 'Facebreaker',         category: 'Bouclier' },
  { id: 'OFF_SHIELD_AVALON',           label: 'Astral Aegis',        category: 'Bouclier' },
  { id: 'OFF_SHIELD_CRYSTAL',          label: 'Unbreakable Ward',    category: 'Bouclier' },
  // Tome / Livre
  { id: 'OFF_BOOK',                    label: 'Tome of Spells',      category: 'Tome' },
  { id: 'OFF_ORB_MORGANA',             label: 'Eye of Secrets',      category: 'Tome' },
  { id: 'OFF_DEMONSKULL_HELL',         label: 'Muisak',              category: 'Tome' },
  { id: 'OFF_TOTEM_KEEPER',            label: 'Taproot',             category: 'Tome' },
  { id: 'OFF_CENSER_AVALON',           label: 'Celestial Censer',    category: 'Tome' },
  { id: 'OFF_TOME_CRYSTAL',            label: 'Timelocked Grimoire', category: 'Tome' },
  // Torche / Autre
  { id: 'OFF_TORCH',                   label: 'Torch',               category: 'Torche' },
  { id: 'OFF_HORN_KEEPER',             label: 'Mistcaller',          category: 'Torche' },
  { id: 'OFF_LAMP_UNDEAD',             label: 'Cryptcandle',         category: 'Torche' },
  { id: 'OFF_JESTERCANE_HELL',         label: 'Leering Cane',        category: 'Torche' },
  { id: 'OFF_TALISMAN_AVALON',         label: 'Sacred Scepter',      category: 'Torche' },
  { id: 'OFF_TORCH_CRYSTAL',           label: 'Blueflame Torch',     category: 'Torche' },
];

// ─── Bags ─────────────────────────────────────────────────────────────────────
const BAG_ITEMS = [
  { id: 'BAG',          label: 'Bag',              category: 'Sac' },
  { id: 'BAG_INSIGHT',  label: 'Satchel of Insight', category: 'Sac' },
];

// ─── Capes ────────────────────────────────────────────────────────────────────
const CAPE_ITEMS = [
  { id: 'CAPE',                         label: 'Cape',               category: 'Simple' },
  // Faction
  { id: 'CAPEITEM_FW_BRIDGEWATCH',      label: 'Bridgewatch Cape',   category: 'Faction' },
  { id: 'CAPEITEM_FW_FORTSTERLING',     label: 'Fort Sterling Cape', category: 'Faction' },
  { id: 'CAPEITEM_FW_LYMHURST',         label: 'Lymhurst Cape',      category: 'Faction' },
  { id: 'CAPEITEM_FW_MARTLOCK',         label: 'Martlock Cape',      category: 'Faction' },
  { id: 'CAPEITEM_FW_THETFORD',         label: 'Thetford Cape',      category: 'Faction' },
  // Artefact
  { id: 'CAPEITEM_UNDEAD',              label: 'Undead Cape',        category: 'Artefact' },
  { id: 'CAPEITEM_HERETIC',             label: 'Heretic Cape',       category: 'Artefact' },
  { id: 'CAPEITEM_KEEPER',              label: 'Keeper Cape',        category: 'Artefact' },
  { id: 'CAPEITEM_MORGANA',             label: 'Morgana Cape',       category: 'Artefact' },
  { id: 'CAPEITEM_AVALON',              label: 'Avalonian Cape',     category: 'Artefact' },
];

// ─── Potions ──────────────────────────────────────────────────────────────────
// Full IDs (consumables are tier-specific, not T4-T8 enchantable equipment)
const POTION_ITEMS = [
  // Soin
  { id: 'T4_POTION_HEAL',        label: 'Potion de soin',            category: 'Soin' },
  { id: 'T6_POTION_HEAL',        label: 'Potion de soin majeure',    category: 'Soin' },
  { id: 'T4_POTION_ENERGY',      label: "Potion d'énergie",          category: 'Soin' },
  { id: 'T6_POTION_ENERGY',      label: "Potion d'énergie majeure",  category: 'Soin' },
  { id: 'T3_POTION_REVIVE',      label: 'Potion de gigantisme min.', category: 'Soin' },
  { id: 'T5_POTION_REVIVE',      label: 'Potion de gigantisme',      category: 'Soin' },
  { id: 'T7_POTION_REVIVE',      label: 'Potion de gigantisme maj.', category: 'Soin' },
  // Défense
  { id: 'T3_POTION_STONESKIN',   label: 'Potion de résistance min.', category: 'Défense' },
  { id: 'T5_POTION_STONESKIN',   label: 'Potion de résistance',      category: 'Défense' },
  { id: 'T7_POTION_STONESKIN',   label: 'Potion de résistance maj.', category: 'Défense' },
  { id: 'T3_POTION_CLEANSE2',    label: 'Potion de purification min.',category: 'Défense' },
  { id: 'T5_POTION_CLEANSE2',    label: 'Potion de purification',    category: 'Défense' },
  { id: 'T7_POTION_CLEANSE2',    label: 'Potion de purification maj.',category: 'Défense' },
  { id: 'T8_POTION_CLEANSE',     label: "Potion d'invisibilité",     category: 'Défense' },
  // Attaque
  { id: 'T4_POTION_BERSERK',     label: 'Potion de berserker min.',  category: 'Attaque' },
  { id: 'T6_POTION_BERSERK',     label: 'Potion de berserker',       category: 'Attaque' },
  { id: 'T8_POTION_BERSERK',     label: 'Potion de berserker maj.',  category: 'Attaque' },
  { id: 'T3_POTION_ACID',        label: "Potion d'acide min.",       category: 'Attaque' },
  { id: 'T5_POTION_ACID',        label: "Potion d'acide",            category: 'Attaque' },
  { id: 'T7_POTION_ACID',        label: "Potion d'acide maj.",       category: 'Attaque' },
  { id: 'T4_POTION_COOLDOWN',    label: 'Potion de poison min.',     category: 'Attaque' },
  { id: 'T6_POTION_COOLDOWN',    label: 'Potion de poison',          category: 'Attaque' },
  { id: 'T8_POTION_COOLDOWN',    label: 'Potion de poison maj.',     category: 'Attaque' },
  // Utilitaire
  { id: 'T4_POTION_GATHER',      label: 'Potion de récolte min.',    category: 'Utilitaire' },
  { id: 'T6_POTION_GATHER',      label: 'Potion de récolte',         category: 'Utilitaire' },
  { id: 'T8_POTION_GATHER',      label: 'Potion de récolte maj.',    category: 'Utilitaire' },
  { id: 'T3_POTION_MOB_RESET',   label: 'Potion de calme min.',      category: 'Utilitaire' },
  { id: 'T5_POTION_MOB_RESET',   label: 'Potion de calme',           category: 'Utilitaire' },
  { id: 'T7_POTION_MOB_RESET',   label: 'Potion de calme maj.',      category: 'Utilitaire' },
  { id: 'T4_ESSENCE_POTION',     label: 'Essence arcanique (T4)',    category: 'Utilitaire' },
  { id: 'T5_ESSENCE_POTION',     label: 'Essence arcanique (T5)',    category: 'Utilitaire' },
  { id: 'T6_ESSENCE_POTION',     label: 'Essence arcanique (T6)',    category: 'Utilitaire' },
  { id: 'T7_ESSENCE_POTION',     label: 'Essence arcanique (T7)',    category: 'Utilitaire' },
  { id: 'T8_ESSENCE_POTION',     label: 'Essence arcanique (T8)',    category: 'Utilitaire' },
];

// ─── Food ─────────────────────────────────────────────────────────────────────
// Full IDs — meals are tier-specific (not standard T4-T8 equipment)
const FOOD_ITEMS = [
  // Plat (volaille → cochon)
  { id: 'T3_MEAL_OMELETTE',      label: 'Omelette au poulet',        category: 'Plat' },
  { id: 'T5_MEAL_OMELETTE',      label: "Omelette à l'oie",          category: 'Plat' },
  { id: 'T7_MEAL_OMELETTE',      label: 'Omelette au porc',          category: 'Plat' },
  { id: 'T3_MEAL_PIE',           label: 'Tourte au poulet',          category: 'Plat' },
  { id: 'T5_MEAL_PIE',           label: "Tourte à l'oie",            category: 'Plat' },
  { id: 'T7_MEAL_PIE',           label: 'Tourte au porc',            category: 'Plat' },
  { id: 'T3_MEAL_ROAST',         label: 'Poulet rôti',               category: 'Plat' },
  { id: 'T5_MEAL_ROAST',         label: 'Oie rôtie',                 category: 'Plat' },
  { id: 'T7_MEAL_ROAST',         label: 'Porc rôti',                 category: 'Plat' },
  { id: 'T4_MEAL_STEW',          label: 'Ragoût de chèvre',          category: 'Plat' },
  { id: 'T6_MEAL_STEW',          label: 'Ragoût de mouton',          category: 'Plat' },
  { id: 'T8_MEAL_STEW',          label: 'Ragoût de bœuf',            category: 'Plat' },
  { id: 'T4_MEAL_SANDWICH',      label: 'Sandwich à la chèvre',      category: 'Plat' },
  { id: 'T6_MEAL_SANDWICH',      label: 'Sandwich au mouton',        category: 'Plat' },
  { id: 'T8_MEAL_SANDWICH',      label: 'Sandwich au bœuf',          category: 'Plat' },
  { id: 'T4_MEAL_SALAD',         label: 'Salade de navets',          category: 'Plat' },
  { id: 'T6_MEAL_SALAD',         label: 'Salade de patates',         category: 'Plat' },
  { id: 'T3_MEAL_SOUP',          label: 'Soupe de blé',              category: 'Plat' },
  { id: 'T5_MEAL_SOUP',          label: 'Soupe aux choux',           category: 'Plat' },
  // Poisson
  { id: 'T3_MEAL_OMELETTE_FISH', label: 'Omelette au crabe fouisseur', category: 'Poisson' },
  { id: 'T5_MEAL_OMELETTE_FISH', label: 'Omelette au crabe de rivière',category: 'Poisson' },
  { id: 'T7_MEAL_OMELETTE_FISH', label: 'Omelette au crabe mantou',  category: 'Poisson' },
  { id: 'T3_MEAL_PIE_FISH',      label: 'Tourte au sar noirtête',    category: 'Poisson' },
  { id: 'T5_MEAL_PIE_FISH',      label: 'Tourte au cavernicole',     category: 'Poisson' },
  { id: 'T7_MEAL_PIE_FISH',      label: 'Tourte au sar boréal',      category: 'Poisson' },
  { id: 'T3_MEAL_ROAST_FISH',    label: 'Lutjan albruine rôti',      category: 'Poisson' },
  { id: 'T5_MEAL_ROAST_FISH',    label: 'Lutjan clairebrumasse rôti',category: 'Poisson' },
  { id: 'T7_MEAL_ROAST_FISH',    label: 'Lutjan purebrume rôti',     category: 'Poisson' },
  { id: 'T4_MEAL_STEW_FISH',     label: "Ragoût d'anguille verte",   category: 'Poisson' },
  { id: 'T6_MEAL_STEW_FISH',     label: "Ragoût d'anguille rosée",   category: 'Poisson' },
  { id: 'T8_MEAL_STEW_FISH',     label: "Ragoût d'anguille morteaux",category: 'Poisson' },
  { id: 'T4_MEAL_SANDWICH_FISH', label: 'Sandwich à la loche pétrée',category: 'Poisson' },
  { id: 'T6_MEAL_SANDWICH_FISH', label: 'Sandwich à la loche franche',category: 'Poisson' },
  { id: 'T8_MEAL_SANDWICH_FISH', label: 'Sandwich à la loche léopard',category: 'Poisson' },
  { id: 'T4_MEAL_SALAD_FISH',    label: 'Salade de petites pieuvres',category: 'Poisson' },
  { id: 'T6_MEAL_SALAD_FISH',    label: 'Salade de krakens',         category: 'Poisson' },
  { id: 'T3_MEAL_SOUP_FISH',     label: 'Soupe de palourdes vaseuses',category: 'Poisson' },
  { id: 'T5_MEAL_SOUP_FISH',     label: 'Soupe de palourdes noirebières',category: 'Poisson' },
  { id: 'T1_MEAL_GRILLEDFISH',   label: 'Poisson grillé',            category: 'Poisson' },
  { id: 'T1_MEAL_SEAWEEDSALAD',  label: "Salade d'algues",           category: 'Poisson' },
  // Avalonien
  { id: 'T3_MEAL_OMELETTE_AVALON', label: 'Omelette avalonienne (T3)', category: 'Avalonien' },
  { id: 'T5_MEAL_OMELETTE_AVALON', label: 'Omelette avalonienne (T5)', category: 'Avalonien' },
  { id: 'T7_MEAL_OMELETTE_AVALON', label: 'Omelette avalonienne (T7)', category: 'Avalonien' },
  { id: 'T4_MEAL_STEW_AVALON',   label: 'Ragoût avalonien (T4)',     category: 'Avalonien' },
  { id: 'T6_MEAL_STEW_AVALON',   label: 'Ragoût avalonien (T6)',     category: 'Avalonien' },
  { id: 'T8_MEAL_STEW_AVALON',   label: 'Ragoût avalonien (T8)',     category: 'Avalonien' },
  { id: 'T4_MEAL_SANDWICH_AVALON', label: 'Sandwich avalonien (T4)', category: 'Avalonien' },
  { id: 'T6_MEAL_SANDWICH_AVALON', label: 'Sandwich avalonien (T6)', category: 'Avalonien' },
  { id: 'T8_MEAL_SANDWICH_AVALON', label: 'Sandwich avalonien (T8)', category: 'Avalonien' },
];

// ─── Slot definitions ─────────────────────────────────────────────────────────
// Layout:
//   Row 1: [BAG]    [HEAD]  [CAPE]
//   Row 2: [WEAPON] [ARMOR] [OFFHAND]
//   Row 3: [ — ]   [FEET]  [ — ]
//   Row 4: [POTION] [ — ]  [FOOD]
export const SLOTS: SlotDef[] = [
  {
    id: 'bag',
    label: 'Sac',
    matCount1H: 192,
    matCount2H: 192,
    items1H: BAG_ITEMS,
    items2H: BAG_ITEMS,
  },
  {
    id: 'head',
    label: 'Tête',
    matCount1H: 96,
    matCount2H: 96,
    items1H: HEAD_ITEMS,
    items2H: HEAD_ITEMS,
  },
  {
    id: 'cape',
    label: 'Cape',
    matCount1H: 96,
    matCount2H: 96,
    items1H: CAPE_ITEMS,
    items2H: CAPE_ITEMS,
  },
  {
    id: 'weapon',
    label: 'Arme',
    matCount1H: 288,
    matCount2H: 384,
    items1H: WEAPON_ITEMS,
    items2H: WEAPON_ITEMS,
  },
  {
    id: 'armor',
    label: 'Armure',
    matCount1H: 192,
    matCount2H: 192,
    items1H: ARMOR_ITEMS,
    items2H: ARMOR_ITEMS,
  },
  {
    id: 'offhand',
    label: 'Offhand',
    matCount1H: 96,
    matCount2H: 96,
    items1H: OFFHAND_ITEMS,
    items2H: OFFHAND_ITEMS,
  },
  {
    id: 'feet',
    label: 'Pieds',
    matCount1H: 96,
    matCount2H: 96,
    items1H: FEET_ITEMS,
    items2H: FEET_ITEMS,
  },
  {
    id: 'potion',
    label: 'Potion',
    matCount1H: 0,
    matCount2H: 0,
    isConsumable: true,
    items1H: POTION_ITEMS,
    items2H: POTION_ITEMS,
  },
  {
    id: 'food',
    label: 'Nourriture',
    matCount1H: 0,
    matCount2H: 0,
    isConsumable: true,
    items1H: FOOD_ITEMS,
    items2H: FOOD_ITEMS,
  },
];

export const SLOT_MAP = Object.fromEntries(SLOTS.map((s) => [s.id, s])) as Record<string, SlotDef>;

export const TIERS = [4, 5, 6, 7, 8] as const;
export const ENCHANTS = [0, 1, 2, 3] as const;

export const EQUIPMENT_SLOT_IDS: SlotId[] = ['head', 'armor', 'feet', 'weapon', 'offhand', 'bag', 'cape'];
export const CONSUMABLE_SLOT_IDS: SlotId[] = ['potion', 'food'];
/** Slots where mastery/specialization combat bonus applies (not bag/cape). */
export const COMBAT_SPEC_SLOT_IDS: SlotId[] = ['head', 'armor', 'feet', 'weapon', 'offhand'];
/** Slots that count toward the in-game average IP (bag/satchel excluded). */
export const AVERAGE_IP_SLOT_IDS: SlotId[] = ['head', 'armor', 'feet', 'weapon', 'offhand', 'cape'];
