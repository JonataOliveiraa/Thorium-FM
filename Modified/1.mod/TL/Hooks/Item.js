import { Terraria, Microsoft, Modules } from './../ModImports.js';
import { ModLocalization } from './../ModLocalization.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { PrefixLoader } from './../Loaders/PrefixLoader.js';
import { PrefixCategory } from './../PrefixCategory.js';

const { Color, Rectangle } = Modules;
const PlaySound = (type, x = -1, y = -1, pitch = 0, volume = 1) => Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, int x, int y, float pitchOffset, float volumeScale)'](type, x, y, pitch, volume);

export class ItemHooks {
    static initialized = false;
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        All: (info) => info.hasItems || info.hasGlobalItems,
        SetDefaults: (info) => info.hasItems || info.hasGlobalItems,
        RebuildTooltip: (info) => info.hasItems,
        Prefix: (info) => info.hasItems || info.hasGlobalItems || info.hasPrefixes,
        GetAlpha: (info) => info.hasItems || info.hasGlobalItems
    }
    
    static Initialize(info) {
        if (!this.HookList.All(info) || this.initialized) return;
        
        if (this.HookList.SetDefaults(info)) {
            Terraria.Item['void SetDefaults(int Type, ItemVariant variant)'
            ].hook((original, self, type, variant) => {
                const flag = ItemLoader.isModType(type);
                if (!flag) original(self, type, variant);
                if (flag) {
                    self.ResetStats(type);
                    self.type = type;
                    self.material = Terraria.ID.ItemID.Sets.IsAMaterial[self.type];
                    
                    const item = ItemLoader.getModItem(type);
                    item?.SetDefaults(self);
                    self.RebuildTooltip();
                    item?.PostSetDefaults(self);
                    try {
                        Object.assign(self, item.Item);
                    } catch (error) {
                        throw new Error(`SetDefaults failed for item <${item.constructor.name}>, error: ${error}`);
                    }
                }
                ItemLoader.SetDefaults(self);
            });
        }
        
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
                let prefixes = original(self);
                
                if (!ItemLoader.isModType(self.type)) {
                    if (prefixes === null) prefixes = [];
                    else prefixes = Array.from(prefixes);
                    
                    for (const category of PrefixLoader.GetPrefixCategories(self)) {
                        for (const pre of PrefixLoader.GetPrefixesInCategory(category)) {
                            prefixes.push(pre);
                        }
                    }
                    for (const pre of PrefixLoader.GetCustomPrefixes(self)) {
                        prefixes.push(pre);
                    }
                    prefixes = [...new Set(prefixes)];
                    
                    if (prefixes.length > 0) {
                        let allowed = [];
                        for (let i = 0; i < prefixes.length; i++) {
                            const pre = prefixes[i];
                            if (ItemLoader.AllowPrefix(self, pre)) {
                                allowed.push(pre);
                            }
                        }
                        for (const pre of PrefixLoader.GetCustomPrefixes(self)) {
                            prefixes.push(pre);
                        }
                        if (allowed.length > 0) return allowed.makeGeneric('int');
                        return null;
                    }
                    
                    return prefixes.length > 0 ? prefixes.makeGeneric('int') : null;
                }
                
                prefixes = [];
                
                if (self.IsAPrefixableAccessory()) {
                    prefixes = Array.from(Terraria.GameContent.Prefixes.PrefixLegacy.Prefixes.PrefixesForAccessories);
                } else {
                    const modItem = ItemLoader.getModItem(self.type);
                    if (modItem.MeleePrefix(self)) prefixes.push(...PrefixLoader.MeleePrefixes);
                    if (modItem.RangedPrefix(self)) prefixes.push(...PrefixLoader.RangedPrefixes);
                    if (modItem.WeaponPrefix(self)) prefixes.push(...PrefixLoader.WeaponPrefixes);
                    if (modItem.MagicPrefix(self)) prefixes.push(...PrefixLoader.MagicPrefixes);
                    if (modItem.SummonPrefix(self)) prefixes.push(...PrefixLoader.SummonPrefixes);
                    if (Terraria.GameContent.Prefixes.PrefixLegacy.ItemSets.ItemsThatCanHaveLegendary2[self.type]) prefixes.push(84);
                }
                
                for (const category of PrefixLoader.GetPrefixCategories(self)) {
                    for (const pre of PrefixLoader.GetPrefixesInCategory(category)) {
                        prefixes.push(pre);
                    }
                }
                for (const pre of PrefixLoader.GetCustomPrefixes(self)) {
                    prefixes.push(pre);
                }
                prefixes = [...new Set(prefixes)];
                    
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
        }
        
        if (this.HookList.Prefix(info) && info.hasPrefixes) {
            Terraria.Item['string AffixName()'
            ].hook((original, self) => {
                const prefix = self.prefix;
                if (PrefixLoader.isModType(prefix)) {
                    const modPrefix = PrefixLoader.getModPrefix(prefix);
                    return modPrefix.GetPrefixedItemName(self);
                }
                return original(self);
            });
            
            Terraria.Player['void GrantPrefixBenefits(Item item)'
            ].hook((original, self, item) => {
                original(self, item);
                PrefixLoader.ApplyAccessoryEffects(self, item);
            });
            
            Terraria.Item['bool CanRollPrefix(int prefix)'
            ].hook((original, self, prefix) => {
                return original(self, prefix) && PrefixLoader.CanRoll(self, prefix);
            });
            
            function BestPrefixValue(item) {
                let prefixes = item.GetRollablePrefixes();
                if (prefixes === null || prefixes.length === 0) return 0;
                let val1 = 0;
                for (const pre of Array.from(prefixes)) {
                    let r = PrefixLoader.GetPrefixStats(item, pre);
                    if (r) val1 = Math.max(val1, r.value);
                }
                return val1;
            }
            
            const Round = new NativeClass('System', 'Math')['double Round(double a)'];
            
            Terraria.Item['bool Prefix(int prefixWeWant, ref bool rolledPrefixIsTopTier)'
            ].hook((original, self, prefixWeWant, _) => {
                if (prefixWeWant >= PrefixLoader.MAX_VANILLA_ID && !PrefixLoader.isModType(prefixWeWant)) {
                    return original(self, prefixWeWant, _);
                }
                
                if (!Terraria.WorldGen.isGeneratingOrLoadingWorld && Terraria.Main.rand === null) {
                    Terraria.Main.rand = Terraria.Utilities.UnifiedRandom.new();
                    Terraria.Main.rand['void .ctor()']();
                }
                
                if (prefixWeWant === 0 || !self.CanHavePrefixes()) {
                    return false;
                }
                if (prefixWeWant === -3) return true;
                
                let bestValue = 0;
                if (prefixWeWant === -2 || prefixWeWant === -1) {
                    bestValue = BestPrefixValue(self);
                }
                
                let random = Terraria.WorldGen.isGeneratingOrLoadingWorld ? Terraria.WorldGen.genRand : Terraria.Main.rand;
                const Next = random['int Next(int maxValue)'];
                
                let rolledPrefix = prefixWeWant;
                let stats = {};
                let flag = true;
                function RollAPrefix(item) {
                    let rollablePrefixes = item.GetRollablePrefixes();
                    if (rollablePrefixes === null || rollablePrefixes.length === 0) return false;
                    rollablePrefixes = Array.from(rollablePrefixes).filter(p => self['bool CanRollPrefix(int prefix)'](p));
                    if (rollablePrefixes.length === 0) return false;
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
                    
                    stats = PrefixLoader.GetPrefixStats(self, rolledPrefix);
                    if (!stats.result) {
                        flag = true;
                        rolledPrefix = -1;
                    }
                    if (prefixWeWant === -2 && rolledPrefix === 0) {
                        rolledPrefix = -1;
                        flag = true;
                    }
                }
                
                let value = (1.0 * stats.damage * (2.0 - stats.speed) * (2.0 - stats.mana) * stats.size * stats.knockBack * stats.shootSpeed * (1.0 + stats.crit * 0.019999999552965164) * (1.0 + stats.armorPenetration * 0.014999999664723873) * (1.0 + stats.tagDamage * 0.029999999329447746));
                if (rolledPrefix === 62 || rolledPrefix === 69 || rolledPrefix === 73 || rolledPrefix === 77)
                    value *= 1.05;
                if (rolledPrefix === 63 || rolledPrefix === 70 || rolledPrefix === 74 || rolledPrefix === 78 || rolledPrefix === 67)
                    value *= 1.1;
                if (rolledPrefix === 64 || rolledPrefix === 71 || rolledPrefix === 75 || rolledPrefix === 79 || rolledPrefix === 66)
                    value *= 1.15;
                if (rolledPrefix === 65 || rolledPrefix === 72 || rolledPrefix === 76 || rolledPrefix === 80 || rolledPrefix === 68)
                    value *= 1.2;
                if (PrefixLoader.isModType(rolledPrefix)) {
                    value *= PrefixLoader.getModPrefix(rolledPrefix).GetValueMultiplier();
                }
                
                if (value === bestValue) {
                    PlaySound(Terraria.ID.SoundID.BestReforge);
                    // TODO: bloquear botão de reforja
                }
                
                self.damage = Round(self.damage * stats.damage);
                self.useAnimation = Round(self.useAnimation * stats.speed);
                self.useTime = Round(self.useTime * stats.speed);
                self.reuseDelay = Round(self.reuseDelay * stats.speed);
                self.mana = Round(self.mana * stats.mana);
                self.knockBack *= stats.knockBack;
                self.scale *= stats.size;
                self.shootSpeed *= stats.shootSpeed;
                self.crit += stats.crit;
                self.bonusTagDamage += stats.tagDamage;
                self.armorPenetration += stats.armorPenetration;
                
                PrefixLoader.ApplyPrefix(self, rolledPrefix);
                
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
            });
        }
        
        if (this.HookList.GetAlpha(info)) {
            Terraria.WorldItem['Color GetAlpha(Color newColor)'
            ].hook((original, self, color) => {
                return original(self, ItemLoader.GetAlpha(self, color));
            });
        }
        
        this.initialized = true;
    }
}