// Enums
import { BiomeID } from './Enums/BiomeID.js';
import { CloudID } from './Enums/CloudID.js';
import { DashID } from './Enums/DashID.js';
import { EmoteBubbleCategory } from './Enums/EmoteBubbleCategory.js';
import { ItemRarityID } from './Enums/ItemRarityID.js';
import { MoonPhases } from './Enums/MoonPhases.js';
import { MusicID } from './Enums/MusicID.js';
import { ProjAIStyleID } from './Enums/ProjAIStyleID.js';
import { NPCAIStyleID } from './Enums/NPCAIStyleID.js';

// Modules
import { Color } from './Modules/Color.js';
import { Effects } from './Modules/Effects.js';
import { Camera } from './Modules/Camera.js';
import { MathHelper } from './Modules/MathHelper.js';
import { Point } from './Modules/Point.js';
import { Point16 } from './Modules/Point16.js';
import { Rand } from './Modules/Rand.js';
import { Rectangle } from './Modules/Rectangle.js';
import { SpriteBatch } from './Modules/SpriteBatch.js';
import { TileData } from './Modules/TileData.js';
import { Vector2 } from './Modules/Vector2.js';
import { WorldGenRand } from './Modules/WorldGenRand.js';

export const Modules = {
    Color,
    Effects,
    Camera,
    MathHelper,
    Point,
    Point16,
    Rand,
    Rectangle,
    SpriteBatch,
    TileData,
    Vector2,
    WorldGenRand
};

const Get = (namespace, className) => new NativeClass(namespace, className);

export const Terraria = {
    Player: Get('Terraria', 'Player'),
    Item: Get('Terraria', 'Item'),
    Projectile: Get('Terraria', 'Projectile'),
    NPC: Get('Terraria', 'NPC'),
    Main: Get('Terraria', 'Main'),
    WorldGen: Get('Terraria', 'WorldGen'),
    Lang: Get('Terraria', 'Lang'),
    Lighting: Get('Terraria', 'Lighting'),
    Sign: Get('Terraria', 'Sign'),
    Recipe: Get('Terraria', 'Recipe'),
    RecipeGroup: Get('Terraria', 'RecipeGroup'),
    Tile: Get('Terraria', 'Tile'),
    TileData: Get('Terraria', 'TileData'),
    TileObject: Get('Terraria', 'TileObject'),
    Framing: Get('Terraria', 'Framing'),
    HitTile: Get('Terraria', 'HitTile'),
    Utils: Get('Terraria', 'Utils'),
    Mount: Get('Terraria', 'Mount'),
    GetItemSettings: Get('Terraria', 'GetItemSettings'),
    Chest: Get('Terraria', 'Chest'),
    ChestItem: Get('Terraria', 'ChestItem'),
    WorldItem: Get('Terraria', 'WorldItem'),
    InventoryStorage: Get('Terraria', 'InventoryStorage'),
    Dust: Get('Terraria', 'Dust'),
    Gore: Get('Terraria', 'Gore'),
    Cloud: Get('Terraria', 'Cloud'),
    CombatText: Get('Terraria', 'CombatText'),
    Collision: Get('Terraria', 'Collision'),
    GUIPlayerCreateMenu: Get('', 'GUIPlayerCreateMenu'),
    PlayerSpawnContext: Get('Terraria', 'PlayerSpawnContext'),
    DelegateMethods: Get('Terraria', 'DelegateMethods'),
    PopupText: Get('Terraria', 'PopupText'),
    Wiring: Get('Terraria', 'Wiring'),
    NetMessage: Get('Terraria', 'NetMessage'),
    Rain: Get('Terraria', 'Rain'),
    ShoppingSettings: Get('Terraria', 'ShoppingSettings'),
    WaterfallManager: Get('Terraria', 'WaterfallManager'),
    
    Enums: {
        EmoteBubbleCategory: EmoteBubbleCategory,
        TileObjectDirection: Get('Terraria.Enums', 'TileObjectDirection'),
        TownNPCSpawnResult: Get('Terraria.Enums', 'TownNPCSpawnResult')
    },
    
    ID: {
        AmmoID: Get('Terraria.ID', 'AmmoID'),
        ArmorIDs: Get('Terraria.ID', 'ArmorIDs'),
        BiomeID: BiomeID,
        BuffID: Get('Terraria.ID', 'BuffID'),
        CloudID: CloudID,
        ContentSamples: Get('Terraria.ID', 'ContentSamples'),
        CustomCurrencyID: Get('Terraria.ID', 'CustomCurrencyID'),
        DashID: DashID,
        DustID: Get('Terraria.ID', 'DustID'),
        GoreID: Get('Terraria.ID', 'GoreID'),
        ItemID: Get('Terraria.ID', 'ItemID'),
        ItemHoldStyleID: Get('Terraria.ID', 'ItemHoldStyleID'),
        ItemRarityID: ItemRarityID,
        ItemUseStyleID: Get('Terraria.ID', 'ItemUseStyleID'),
        MoonPhases: MoonPhases,
        MountID: Get('Terraria.ID', 'MountID'),
        MusicID: MusicID,
        NPCAIStyleID: NPCAIStyleID,
        NPCHeadID: Get('Terraria.ID', 'NPCHeadID'),
        NPCID: Get('Terraria.ID', 'NPCID'),
        PrefixID: Get('Terraria.ID', 'PrefixID'),
        ProjAIStyleID: ProjAIStyleID,
        ProjectileID: Get('Terraria.ID', 'ProjectileID'),
        ProjectileDrawLayerID: Get('Terraria.ID', 'ProjectileDrawLayerID'),
        RecipeGroups: Get('Terraria.ID', 'RecipeGroups'),
        SoundID: Get('Terraria.ID', 'SoundID'),
        TileID: Get('Terraria.ID', 'TileID'),
        WallID: Get('Terraria.ID', 'WallID')
    },

    Localization: {
        Language: Get('Terraria.Localization', 'Language'),
        LanguageManager: Get('Terraria.Localization', 'LanguageManager'),
        LocalizedText: Get('Terraria.Localization', 'LocalizedText'),
        NetworkText: Get('Terraria.Localization', 'NetworkText'),
        GameCulture: Get('Terraria.Localization', 'GameCulture'),
    },
    
    Map: {
        MapHelper: Get('Terraria.Map', 'MapHelper')
    },

    UI: {
        ItemSlot: Get('Terraria.UI', 'ItemSlot'),
        ItemTooltip: Get('Terraria.UI', 'ItemTooltip'),
        ItemSorting: Get('Terraria.UI', 'ItemSorting'),
        Chat: {
            ChatManager: Get('Terraria.UI.Chat', 'ChatManager')
        }
    },

    GameContent: {
        Achievements: {
            AchievementsHelper: Get('Terraria.GameContent.Achievements', 'AchievementsHelper'),
            ItemCraftCondition: Get('Terraria.GameContent.Achievements', 'ItemCraftCondition'),
            CustomFlagCondition: Get('Terraria.GameContent.Achievements', 'CustomFlagCondition'),
            CustomFloatCondition: Get('Terraria.GameContent.Achievements', 'CustomFloatCondition'),
            CustomIntCondition: Get('Terraria.GameContent.Achievements', 'CustomIntCondition'),
            ItemPickupCondition: Get('Terraria.GameContent.Achievements', 'ItemPickupCondition'),
            NPCKilledCondition: Get('Terraria.GameContent.Achievements', 'NPCKilledCondition'),
            TileDestroyedCondition: Get('Terraria.GameContent.Achievements', 'TileDestroyedCondition')
        },
        Bestiary: {
            BestiaryDatabase: Get('Terraria.GameContent.Bestiary', 'BestiaryDatabase'),
            BestiaryEntry: Get('Terraria.GameContent.Bestiary', 'BestiaryEntry'),
            BestiaryDatabaseNPCsPopulator: Get('Terraria.GameContent.Bestiary', 'BestiaryDatabaseNPCsPopulator'),
            FlavorTextBestiaryInfoElement: Get('Terraria.GameContent.Bestiary', 'FlavorTextBestiaryInfoElement'),
            MoonLordPortraitBackgroundProviderBestiaryInfoElement: Get('Terraria.GameContent.Bestiary', 'MoonLordPortraitBackgroundProviderBestiaryInfoElement'),
            NPCKillsTracker: Get('Terraria.GameContent.Bestiary', 'NPCKillsTracker')
        },
        Biomes: {
            CorruptionPitBiome: Get('Terraria.GameContent.Biomes', 'CorruptionPitBiome'),
            CaveHouseBiome: Get('Terraria.GameContent.Biomes', 'CaveHouseBiome'),
            CaveHouse: {
                HouseUtils: Get('Terraria.GameContent.Biomes.CaveHouse', 'HouseUtils')
            }
        },
        ChildSafety: Get('Terraria.GameContent', 'ChildSafety'),
        Creative: {
            CreativeItemSacrificesCatalog: Get('Terraria.GameContent.Creative', 'CreativeItemSacrificesCatalog'),
            ItemsSacrificedUnlocksTracker: Get('Terraria.GameContent.Creative', 'ItemsSacrificedUnlocksTracker')
        },
        Drawing: {
            ParticleOrchestraSettings: Get('Terraria.GameContent.Drawing', 'ParticleOrchestraSettings'),
            ParticleOrchestrator: Get('Terraria.GameContent.Drawing', 'ParticleOrchestrator'),
            ParticleOrchestraType: Get('Terraria.GameContent.Drawing', 'ParticleOrchestraType'),
            TileDrawing: Get('Terraria.GameContent.Drawing', 'TileDrawing'),
            WallDrawing: Get('Terraria.GameContent.Drawing', 'WallDrawing')
        },
        Events: {
            BirthdayParty: Get('Terraria.GameContent.Events', 'BirthdayParty'),
            DD2Event: Get('Terraria.GameContent.Events', 'DD2Event'),
            LanternNight: Get('Terraria.GameContent.Events', 'LanternNight'),
            Sandstorm: Get('Terraria.GameContent.Events', 'Sandstorm')
        },
        FontAssets: Get('Terraria.GameContent', 'FontAssets'),
        Items: {
            ItemVariant: Get('Terraria.GameContent.Items', 'ItemVariant'),
            ItemVariants: Get('Terraria.GameContent.Items', 'ItemVariants'),
            TagEffectState: Get('Terraria.GameContent.Items', 'TagEffectState'),
            UniqueTagEffect: Get('Terraria.GameContent.Items', 'UniqueTagEffect'),
            WhipTagEffect: Get('Terraria.GameContent.Items', 'WhipTagEffect')
        },
        ItemDropRules: {
            CommonCode: Get('Terraria.GameContent.ItemDropRules', 'CommonCode'),
            Conditions: Get('Terraria.GameContent.ItemDropRules', 'Conditions'),
            DropOneByOne: Get('Terraria.GameContent.ItemDropRules', 'DropOneByOne'),
            ItemDropDatabase: Get('Terraria.GameContent.ItemDropRules', 'ItemDropDatabase'),
            ItemDropRule: Get('Terraria.GameContent.ItemDropRules', 'ItemDropRule'),
            LeadingConditionRule: Get('Terraria.GameContent.ItemDropRules', 'LeadingConditionRule')
        },
        Liquid: {
            LiquidRenderer: Get('Terraria.GameContent.Liquid', 'LiquidRenderer')
        },
        Metadata: {
            TileMaterials: Get('Terraria.GameContent.Metadata', 'TileMaterials')
        },
        Personalities: {
            AllPersonalitiesModifier: Get('Terraria.GameContent.Personalities', 'AllPersonalitiesModifier'),
            HelperInfo: Get('Terraria.GameContent.Personalities', 'HelperInfo'),
            IShopPersonalityTrait: Get('Terraria.GameContent.Personalities', 'IShopPersonalityTrait'),
            PersonalityDatabase: Get('Terraria.GameContent.Personalities', 'PersonalityDatabase')
        },
        Prefixes: {
            PrefixLegacy: Get('Terraria.GameContent.Prefixes', 'PrefixLegacy')
        },
        HairstyleUnlocksHelper: Get('Terraria.GameContent', 'HairstyleUnlocksHelper'),
        PlayerSittingHelper: Get('Terraria.GameContent', 'PlayerSittingHelper'),
        ShopHelper: Get('Terraria.GameContent', 'ShopHelper'),
        TextureAssets: Get('Terraria.GameContent', 'TextureAssets'),
        NPCInteractions: Get('Terraria.GameContent', 'NPCInteractions'),
        QuickStacking: Get('Terraria.GameContent', 'QuickStacking'),
        ShimmerTransforms: Get('Terraria.GameContent', 'ShimmerTransforms'),
        TownNPCProfiles: Get('Terraria.GameContent', 'TownNPCProfiles'),
        TownRoomManager: Get('Terraria.GameContent', 'TownRoomManager'),
        UI: {
            EmoteBubble: Get('Terraria.GameContent.UI', 'EmoteBubble'),
            EmoteID: Get('Terraria.GameContent.UI', 'EmoteID'),
            CustomCurrencyManager: Get('Terraria.GameContent.UI', 'CustomCurrencyManager'),
            CustomCurrencySingleCoin: Get('Terraria.GameContent.UI', 'CustomCurrencySingleCoin'),
            WiresUI: Get('Terraria.GameContent.UI', 'WiresUI'),
            WorldUIAnchor: Get('Terraria.GameContent.UI', 'WorldUIAnchor')
        }
    },
    
    ObjectData: {
        TileObjectData: Get('Terraria.ObjectData', 'TileObjectData')
    },

    DataStructures: {
        ArmorSetBonuses: Get('Terraria.DataStructures', 'ArmorSetBonuses'),
        ArmorSetBonus: Get('Terraria.DataStructures', 'ArmorSetBonus'),
        CachedProjectileCounterBuffTextHandler: Get('Terraria.DataStructures', 'CachedProjectileCounterBuffTextHandler'),
        DrawData: Get('Terraria.DataStructures', 'DrawData'),
        EntitySource_Gift: Get('Terraria.DataStructures', 'EntitySource_Gift'),
        GameDifficultyLevel: Get('Terraria.DataStructures', 'GameDifficultyLevel'),
        IBuffTextHandler: Get('Terraria.DataStructures', 'IBuffTextHandler'),
        Point16: Get('Terraria.DataStructures', 'Point16'),
        PlayerDrawSet: Get('Terraria.DataStructures', 'PlayerDrawSet'),
        PlayerDeathReason: Get('Terraria.DataStructures', 'PlayerDeathReason'),
        TileEntity: Get('Terraria.DataStructures', 'TileEntity'),
        WingStats: Get('Terraria.DataStructures', 'WingStats'),
        ItemCreationContext: Get('Terraria.DataStructures', 'ItemCreationContext'),
        NPCDebuffImmunityData: Get('Terraria.DataStructures', 'NPCDebuffImmunityData')
    },
    
    Achievements: {
        Achievement: Get ('Terraria.Achievements', 'Achievement'),
        AchievementManager: Get ('Terraria.Achievements', 'AchievementManager'),
        AchievementCategory: Get('Terraria.Achievements', 'AchievementCategory')
    },

    Audio: {
        SoundEngine : Get('Terraria.Audio', 'SoundEngine')
    },
    
    Chat: {
        ChatCommandProcessor: Get('Terraria.Chat', 'ChatCommandProcessor')
    },

    Graphics: {
        Capture: {
            CaptureManager: Get('Terraria.Graphics.Capture', 'CaptureManager')
        },
        Effects: {
            SkyManager: Get('Terraria.Graphics.Effects', 'SkyManager')
        },
        Shaders: {
            GameShaders: Get('Terraria.Graphics.Shaders', 'GameShaders')
        }
    },

    IO: {
        WorldFile: Get('Terraria.IO', 'WorldFile'),
    },

    Initializers: {
        AssetInitializer: Get('Terraria.Initializers', 'AssetInitializer'),
        //WingStatsInitializer: Get('Terraria.Initializers', 'WingStatsInitializer'),
    },

    Utilities: {
        UnifiedRandom: Get('Terraria.Utilities', 'UnifiedRandom')
    },
    
    WorldBuilding: {
        GenVars: Get('Terraria.WorldBuilding', 'GenVars'),
        WorldUtils: Get('Terraria.WorldBuilding', 'WorldUtils')
    }
}

export const Microsoft = {
    Xna: {
        Framework: {
            Vector2: Get('Microsoft.Xna.Framework', 'Vector2'),
            Vector3: Get('Microsoft.Xna.Framework', 'Vector3'),
            Vector4: Get('Microsoft.Xna.Framework', 'Vector4'),
            Rectangle: Get('Microsoft.Xna.Framework', 'Rectangle'),
            Point: Get('Microsoft.Xna.Framework', 'Point'),
            Matrix: Get('Microsoft.Xna.Framework', 'Matrix'),
            MathHelper: Get('Microsoft.Xna.Framework', 'MathHelper'),
            Graphics: {
                BlendState: Get('Microsoft.Xna.Framework.Graphics', 'BlendState'),
                Color: Get('Microsoft.Xna.Framework.Graphics', 'Color'),
                DepthStencilState: Get('Microsoft.Xna.Framework.Graphics', 'DepthStencilState'),
                RasterizerState: Get('Microsoft.Xna.Framework.Graphics', 'RasterizerState'),
                SamplerState: Get('Microsoft.Xna.Framework.Graphics', 'SamplerState'),
                SpriteBatch: Get('Microsoft.Xna.Framework.Graphics', 'SpriteBatch'),
                SpriteEffects: Get('Microsoft.Xna.Framework.Graphics', 'SpriteEffects'),
                SpriteSortMode: Get('Microsoft.Xna.Framework.Graphics', 'SpriteSortMode'),
                Texture2D: Get('Microsoft.Xna.Framework.Graphics', 'Texture2D')
            }
        }
    }
}

export const ReLogic = {
    Content: {
        Asset: Get('ReLogic.Content', 'Asset`1'),
        AssetRepository: Get('ReLogic.Content', 'AssetRepository'),
        AssetState: Get('ReLogic.Content', 'AssetState'),
        AssetRequestMode: Get('ReLogic.Content', 'AssetRequestMode'),
        AssetReaderCollection: Get('ReLogic.Content', 'AssetReaderCollection')
    }
}

export const System = {
    Nullable: Get('System', 'Nullable`1'),
    
    Boolean: Get('System', 'Boolean'),
    Byte: Get('System', 'Byte'),
    Int16: Get('System', 'Int16'),
    UInt16: Get('System', 'UInt16'),
    Int32: Get('System', 'Int32'),
    Int64: Get('System', 'Int64'),
    Single: Get('System', 'Single'),
    String: Get('System', 'String'),
    
    Convert: Get('System', 'Convert'),
    Math: Get('System', 'Math'),
    DateTime: Get('System', 'DateTime'),
    Array: Get('System', 'Array'),
    
    Collections: {
        Generic: {
            Dictionary: Get('System.Collections.Generic', 'Dictionary`2'),
            List: Get('System.Collections.Generic', 'List`1')
        }
    },
    
    IO: {
        File: Get('System.IO', 'File'),
        FileSystem: Get('System.IO', 'FileSystem'),
        Directory: Get('System.IO', 'Directory'),
        
        Path: Get('System.IO', 'Path'),
        
        BinaryWriter: Get('System.IO', 'BinaryWriter'),
        BinaryReader: Get('System.IO', 'BinaryReader'),
        
        Stream: Get('System.IO', 'Stream'),
        MemoryStream: Get('System.IO', 'MemoryStream'),
        
        SeekOrigin: Get('System.IO', 'SeekOrigin'),
        
        Compression: {
            CompressionMode: Get('System.IO.Compression', 'CompressionMode'),
            DeflateStream: Get('System.IO.Compression', 'DeflateStream')
        }
    }
}