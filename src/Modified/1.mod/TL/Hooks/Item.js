import { Terraria, Microsoft, Modules } from './../ModImports.js';
import { ModLocalization } from './../ModLocalization.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { PrefixUtils } from './../Modules/Utils/Prefix.js';

const { Color, Rectangle } = Modules;
const PlaySound = (type, x = -1, y = -1, pitch = 0, volume = 1) => Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, int x, int y, float pitchOffset, float volumeScale)'](type, x, y, pitch, volume);

export class ItemHooks {
    static initialized = false;
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        All: (info) => info.hasItems || info.hasGlobalItems,
        SetDefaults: (info) => info.hasItems || info.hasGlobalItems,
        //GetDrawHitbox: (info) => false,
        RebuildTooltip: (info) => info.hasItems,
        Prefix: (info) => info.hasItems || info.hasGlobalItems,
        GetAlpha: (info) => info.hasItems || info.hasGlobalItems
    }
    
    static Initialize(info) {
        if (!this.HookList.All(info) || this.initialized) return;
        
        if (this.HookList.SetDefaults(info)) {
            Terraria.Item['void SetDefaults(int Type, ItemVariant variant)'
            ].hook((original, self, type, variant) => {
                if (type < ItemLoader.MAX_VANILLA_ID) {
                    original(self, type, variant);
                    ItemLoader.SetDefaults(self);
                    return;
                }
                if (!ItemLoader.isModType(type)) return;
                
                self.ResetStats(type);
                self.type = type;
                self.material = Terraria.ID.ItemID.Sets.IsAMaterial[self.type];
                
                const item = ItemLoader.getModItem(type);
                item?.SetDefaults(self);
                self.RebuildTooltip();
                item?.PostSetDefaults(self);
                Object.assign(self, item.Item);
            });
        }
        
        /*if (this.HookList.GetDrawHitbox(info)) {
            Terraria.Item['Rectangle GetDrawHitbox(int type, Player user)'
            ].hook((original, type, player) => {
                if (ItemLoader.isModType(type)) {
                    const item = ItemLoader.getModItem(type).Item;
                    return Rectangle.new(0, 0, item.width, item.height);
                }
                return original(type, player);
            });
        }*/
        
        if (this.HookList.RebuildTooltip(info)) {
            Terraria.Item['void RebuildTooltip()'
            ].hook((original, self) => {
                original(self);
                if (ItemLoader.isModType(self.type)) {
                    self.ToolTip = ModLocalization.getTranslationItemTooltip(self.type);
                }
            });
        }
        
        if (this.HookList.Prefix(info)) {
            Terraria.Item['int[] GetRollablePrefixes()'
            ].hook((original, self) => {
                let prefixes = [];
                
                if (!ItemLoader.isModType(self.type)) {
                    prefixes = original(self);
                    if (prefixes !== null && prefixes.length > 0) {
                        let allowed = [];
                        for (let i = 0; i < prefixes.length; i++) {
                            const pre = prefixes[i];
                            if (ItemLoader.AllowPrefix(self, pre)) {
                                allowed.push(pre);
                            }
                        }
                        if (allowed.length > 0) return allowed.makeGeneric('int');
                        return null;
                    }
                    return prefixes;
                }
                
                if (self.IsAPrefixableAccessory()) return Terraria.GameContent.Prefixes.PrefixLegacy.Prefixes.PrefixesForAccessories;
                
                if (ItemLoader.MeleePrefix(self)) prefixes.push(...PrefixUtils.MeleePrefixes);
                if (ItemLoader.RangedPrefix(self)) prefixes.push(...PrefixUtils.RangedPrefixes);
                if (ItemLoader.WeaponPrefix(self)) prefixes.push(...PrefixUtils.WeaponPrefixes);
                if (ItemLoader.MagicPrefix(self)) prefixes.push(...PrefixUtils.MagicPrefixes);
                if (ItemLoader.SummonPrefix(self)) prefixes.push(...PrefixUtils.SummonPrefixes);
                if (Terraria.GameContent.Prefixes.PrefixLegacy.ItemSets.ItemsThatCanHaveLegendary2[self.type]) prefixes.push(84);
                if (prefixes.length === 0) return null;
                
                let allowed = [];
                for (let i = 0; i < prefixes.length; i++) {
                    const pre = prefixes[i];
                    if (ItemLoader.AllowPrefix(self, pre)) {
                        allowed.push(pre);
                    }
                }
                
                if (allowed.length === 0) return null;
                
                return allowed.makeGeneric('int');
            });
            
            /*function BestPrefixValue(item) {
                let prefixes = item.GetRollablePrefixes();
                if (prefixes == null || prefixes.length === 0) return 0;
                let val1 = 0;
                for (const pre of Array.from(prefixes)) {
                    let r = PrefixUtils.GetPrefixStats(item, pre);
                    if (r) val1 = Math.max(val1, r.value);
                }
                return val1;
            }
            
            Terraria.Item['bool Prefix(int prefixWeWant, ref bool rolledPrefixIsTopTier)'
            ].hook((original, self, prefixWeWant, _) => {
                if (!Terraria.WorldGen.isGeneratingOrLoadingWorld && Terraria.Main.rand == null) {
                    Terraria.Main.rand = Terraria.Utilities.UnifiedRandom.new();
                    Terraria.Main.rand['void .ctor()']();
                }
                
                if (prefixWeWant === 0 || !self.CanHavePrefixes()) {
                    return false;
                }
                if (prefixWeWant === -3) return true;
                
                let bestValue = 0;
                if (prefixWeWant == -2 || prefixWeWant == -1) {
                    bestValue = BestPrefixValue(self);
                }
                
                let random = Terraria.WorldGen.isGeneratingOrLoadingWorld ? Terraria.WorldGen.genRand : Terraria.Main.rand;
                const Next = random['int Next(int maxValue)'];
                let rolledPrefix = prefixWeWant;
                let stats = {};
                let flag = true;
                function RollAPrefix(item) {
                    let rollablePrefixes = item.GetRollablePrefixes();
                    if (rollablePrefixes == null || rollablePrefixes.length === 0) return false;
                    rolledPrefix = rollablePrefixes[Next(rollablePrefixes.length)];
                    rolledPrefix = ItemLoader.ChoosePrefix(item, rolledPrefix, rollablePrefixes);
                    return true;
                }
                while (flag) {
                    flag = false;
                    if (rolledPrefix === -1 && Next(4) === 0)
                        rolledPrefix = 0;
                    if (prefixWeWant < -1)
                        rolledPrefix = -1;
                    if ((rolledPrefix === -1 || rolledPrefix === -2 || rolledPrefix === -3) && !RollAPrefix(self))
                        return false;
                    if (prefixWeWant === -1 && Terraria.ID.PrefixID.Sets.ReducedNaturalChance[rolledPrefix] && Next(3) !== 0)
                        rolledPrefix = 0;
                    if (prefixWeWant === -4)
                        rolledPrefix = 0;
                    
                    stats = PrefixUtils.GetPrefixStats(self, rolledPrefix);
                    if (!stats.result) {
                        flag = true;
                        rolledPrefix = -1;
                    }
                    if (prefixWeWant === -2 && rolledPrefix === 0) {
                        rolledPrefix = -1;
                        flag = true;
                    }
                }
                
                let value = stats.value;
                
                if (value === bestValue) {
                    PlaySound(Terraria.ID.SoundID.BestReforge);
                    Terraria.Main.InReforgeMenu = false;
                }
                
                self.damage = Math.round(self.damage * stats.damage);
                self.useAnimation = Math.round(self.useAnimation * stats.speed);
                self.useTime = Math.round(self.useTime * stats.speed);
                self.reuseDelay = Math.round(self.reuseDelay * stats.speed);
                self.mana = Math.round(self.mana * stats.mana);
                self.knockBack *= stats.knockBack;
                self.scale *= stats.size;
                self.shootSpeed *= stats.shootSpeed;
                self.crit += stats.crit;
                self.bonusTagDamage += stats.tagDamage;
                self.armorPenetration += stats.armorPenetration;
                
                if (value >= 1.2) self.rare += 2;
                else if (value >= 1.05) self.rare++;
                else if (value <= 0.8) self.rare -= 2;
                else if (value <= 0.95) self.rare--;
                if (self.rare > -11) {
                    if (self.rare < -1) self.rare = -1;
                    if (self.rare > 11) self.rare = 11;
                }
                value *= value;
                self.value = Math.floor(self.value * value);
                self.prefix = rolledPrefix;
                return true;
            });*/
        }
        
        if (this.HookList.GetAlpha(info)) {
            Terraria.WorldItem['Color GetAlpha(Color newColor)'
            ].hook((original, self, color) => {
                return original(self, ItemLoader.GetAlpha(self, color));
            });
        }
        
        /*if (this.HookList.BannerHooks) {
            Terraria.Item.NPCtoBanner.hook((original, type) => {
                const result = original(type);
                if (result > 0) return result;
                return ItemLoader.NPCToBanner(type) ?? 0;
            });
            
            Terraria.Item.BannerToNPC.hook((original, bannerID) => {
                const result = original(bannerID);
                if (result > 0) return result;
                return ItemLoader.BannerToNPC(bannerID) ?? 0;
            });
            
            Terraria.Item.BannerToItem.hook((original, bannerID) => {
                return ItemLoader.BannerToItem(bannerID) ?? original(bannerID);
            });
            
            Terraria.NPC.BannerID.hook((original, self) => {
                return ItemLoader.NPCToBanner(self.type) ?? original(self);
            });
        }*/
        
        this.initialized = true;
    }
}