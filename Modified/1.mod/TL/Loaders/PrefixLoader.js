import { Terraria } from './../ModImports.js';
import { ItemLoader } from './ItemLoader.js';
import { PrefixCategory } from './../PrefixCategory.js';
import { ModLocalization } from './../ModLocalization.js';

function cloneResizedSetLastItem(array, newSize, value) {
    const resized = array.cloneResized(newSize);
    if (value != null) resized[newSize - 1] = value;
    return resized;
}

function resizeArrayProperty(propertyHolder, propertyName, newSize, value) {
    propertyHolder[propertyName] = cloneResizedSetLastItem(propertyHolder[propertyName], newSize, value);
}

const Round = new NativeClass('System', 'Math')['double Round(double a)'];

export class PrefixLoader {
    static Prefixes = [];
    static ModTypes = new Set();
    static Count = 0;
    static get MAX_VANILLA_ID() { return Terraria.ID.PrefixID.Count; }
    static PrefixCount = 0;
    
    static categoryPrefixes = new Array(7);
    static itemPrefixesByType = [];
    
    static register(prefix) {
        this.Prefixes.push(prefix);
    }
    static isModType(type) {
        return this.ModTypes.has(type);
    }
    static getModPrefix(type) {
        return this.Prefixes.find(p => p.Type === type);
    }
    static getByName(name) {
        return this.Prefixes.find(p => p.constructor.name === name);
    }
    
    static MeleePrefixes = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    36, 37, 38, 53, 54, 55, 39, 40, 56, 41, 57, 42, 43,
    44, 45, 46, 47, 48, 49, 50, 51, 59, 60, 61, 81
    ];
    
    static WeaponPrefixes = [
    36, 37, 38, 53, 54, 55, 39,
    40, 56, 41, 57, 59, 60, 61
    ];
    
    static RangedPrefixes = [
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    58, 36, 37, 38, 53, 54, 55, 39, 40, 56,
    41, 57, 42, 44, 45, 46, 47, 48, 49, 50,
    51, 59, 60, 61, 82
    ];
    
    static MagicPrefixes = [
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
    52, 36, 37, 38, 53, 54, 55, 39, 40, 56,
    41, 57, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 59, 60, 61, 83
    ];
    
    static SummonPrefixes = [
    85, 86, 87, 88, 89, 90, 91,
    92, 93, 94, 95, 96, 97
    ];
    
    static GetMeleePrefix() {
        return this.MeleePrefixes[Math.floor(Math.random()*this.MeleePrefixes.length)];
    }
    
    static GetWeaponPrefix() {
        return this.WeaponPrefixes[Math.floor(Math.random()*this.WeaponPrefixes.length)];
    }
    
    static GetRangedPrefix() {
        return this.RangedPrefixes[Math.floor(Math.random()*this.RangedPrefixes.length)];
    }
    
    static GetMagicPrefix() {
        return this.MagicPrefixes[Math.floor(Math.random()*this.MagicPrefixes.length)];
    }
    
    static GetSummonPrefix() {
        return this.SummonPrefixes[Math.floor(Math.random()*this.SummonPrefixes.length)];
    }
    
    static GetPrefixStats(item, rolledPrefix) {
        let damage = 1.0,
        knockBack = 1.0,
        speed = 1.0,
        size = 1.0,
        shootSpeed = 1.0,
        mana = 1.0,
        crit = 0,
        tagDamage = 0,
        armorPenetration = 0,
        result = true;
        
        if (PrefixLoader.isModType(rolledPrefix)) {
            const modPrefix = PrefixLoader.getModPrefix(rolledPrefix);
            if (modPrefix.AllStatChangesHaveEffectOn(item) === false) {
                result = false;
            } else {
                const stats = { damage, knockBack, speed, size, shootSpeed, mana, crit, tagDamage, armorPenetration };
                modPrefix.SetStats(stats);
                damage = stats.damage;
                knockBack = stats.knockBack;
                speed = stats.speed;
                size = stats.size;
                shootSpeed = stats.shootSpeed;
                mana = stats.mana;
                crit = stats.crit;
                tagDamage = stats.tagDamage;
                armorPenetration = stats.armorPenetration;
            }
        } else {
            switch (rolledPrefix) {
                case 1:
                size = 1.12;
                break;
                case 2:
                size = 1.18;
                case 3:
                damage = 1.05;
                crit = 2;
                size = 1.05;
                break;
                case 4:
                damage = 1.1;
                size = 1.1;
                knockBack = 1.1;
                break;
                case 5:
                damage = 1.15;
                break;
                case 6:
                damage = 1.1;
                break;
                case 7:
                size = 0.82;
                break;
                case 8:
                knockBack = 0.85;
                damage = 0.85;
                size = 0.87;
                break;
                case 9:
                size = 0.9;
                break;
                case 10:
                damage = 0.85;
                break;
                case 11:
                speed = 1.1;
                knockBack = 0.9;
                size = 0.9;
                break;
                case 12:
                knockBack = 1.1;
                damage = 1.05;
                size = 1.1;
                speed = 1.15;
                break;
                case 13:
                knockBack = 0.8;
                damage = 0.9;
                size = 1.1;
                break;
                case 14:
                knockBack = 1.15;
                speed = 1.1;
                break;
                case 15:
                knockBack = 0.9;
                speed = 0.85;
                break;
                case 16:
                damage = 1.1;
                crit = 3;
                break;
                case 17:
                speed = 0.85;
                shootSpeed = 1.1;
                break;
                case 18:
                speed = 0.9;
                shootSpeed = 1.15;
                break;
                case 19:
                knockBack = 1.15;
                shootSpeed = 1.05;
                break;
                case 20:
                knockBack = 1.05;
                shootSpeed = 1.05;
                damage = 1.1;
                speed = 0.95;
                crit = 2;
                break;
                case 21:
                knockBack = 1.15;
                damage = 1.1;
                break;
                case 22:
                knockBack = 0.9;
                shootSpeed = 0.9;
                damage = 0.85;
                break;
                case 23:
                speed = 1.15;
                shootSpeed = 0.9;
                break;
                case 24:
                speed = 1.1;
                knockBack = 0.8;
                break;
                case 25:
                speed = 1.1;
                damage = 1.15;
                crit = 1;
                break;
                case 26:
                mana = 0.85;
                damage = 1.1;
                break;
                case 27:
                mana = 0.85;
                break;
                case 28:
                mana = 0.85;
                damage = 1.15;
                knockBack = 1.05;
                break;
                case 29:
                mana = 1.1;
                break;
                case 30:
                mana = 1.2;
                damage = 0.9;
                break;
                case 31:
                knockBack = 0.9;
                damage = 0.9;
                break;
                case 32:
                mana = 1.15;
                damage = 1.1;
                break;
                case 33:
                mana = 1.1;
                knockBack = 1.1;
                speed = 0.9;
                break;
                case 34:
                mana = 0.9;
                knockBack = 1.1;
                speed = 1.1;
                damage = 1.1;
                break;
                case 35:
                mana = 1.2;
                damage = 1.15;
                knockBack = 1.15;
                break;
                case 36:
                crit = 3;
                break;
                case 37:
                damage = 1.1;
                crit = 3;
                knockBack = 1.1;
                break;
                case 38:
                knockBack = 1.15;
                break;
                case 39:
                damage = 0.7;
                knockBack = 0.8;
                break;
                case 40:
                damage = 0.85;
                break;
                case 41:
                knockBack = 0.85;
                damage = 0.9;
                break;
                case 42:
                speed = 0.9;
                break;
                case 43:
                damage = 1.1;
                speed = 0.9;
                break;
                case 44:
                speed = 0.9;
                crit = 3;
                break;
                case 45:
                speed = 0.95;
                break;
                case 46:
                crit = 3;
                speed = 0.94;
                damage = 1.07;
                break;
                case 47:
                speed = 1.15;
                break;
                case 48:
                speed = 1.2;
                break;
                case 49:
                speed = 1.08;
                break;
                case 50:
                damage = 0.8;
                speed = 1.15;
                break;
                case 51:
                knockBack = 0.9;
                speed = 0.9;
                damage = 1.05;
                crit = 2;
                break;
                case 52:
                mana = 0.9;
                damage = 0.9;
                speed = 0.9;
                break;
                case 53:
                damage = 1.1;
                break;
                case 54:
                knockBack = 1.15;
                break;
                case 55:
                knockBack = 1.15;
                damage = 1.05;
                break;
                case 56:
                knockBack = 0.8;
                break;
                case 57:
                knockBack = 0.9;
                damage = 1.18;
                break;
                case 58:
                speed = 0.85;
                damage = 0.85;
                break;
                case 59:
                knockBack = 1.15;
                damage = 1.15;
                crit = 5;
                break;
                case 60:
                damage = 1.15;
                crit = 5;
                break;
                case 61:
                crit = 5;
                break;
                case 81:
                knockBack = 1.15;
                damage = 1.15;
                crit = 5;
                speed = 0.9;
                size = 1.1;
                break;
                case 82:
                knockBack = 1.15;
                damage = 1.15;
                crit = 5;
                speed = 0.9;
                shootSpeed = 1.1;
                break;
                case 83:
                knockBack = 1.15;
                damage = 1.15;
                crit = 5;
                speed = 0.9;
                mana = 0.9;
                break;
                case 84:
                knockBack = 1.17;
                damage = 1.17;
                crit = 8;
                break;
                case 85:
                damage = 1.15;
                knockBack = 1.15;
                armorPenetration = 10;
                tagDamage = 3;
                break;
                case 86:
                damage = 1.1;
                knockBack = 1.05;
                armorPenetration = 5;
                tagDamage = 3;
                break;
                case 87:
                damage = 1.15;
                armorPenetration = 8;
                break;
                case 88:
                damage = 1.1;
                tagDamage = 3;
                break;
                case 89:
                damage = 0.95;
                tagDamage = 3;
                break;
                case 90:
                damage = 1.1;
                knockBack = 0.9;
                break;
                case 91:
                damage = 0.95;
                armorPenetration = 10;
                break;
                case 92:
                damage = 0.7;
                break;
                case 93:
                knockBack = 0.75;
                break;
                case 94:
                damage = 0.85;
                knockBack = 0.9;
                break;
                case 95:
                armorPenetration = 25;
                break;
                case 96:
                tagDamage = 5;
                break;
                case 97:
                knockBack = 1.25;
                break;
            }
        }
        
        if (damage !== 1.0 && Round(item.damage * damage) === item.damage) {
            result = false;
        }
        else if (speed !== 1.0 && Round(item.useAnimation * speed) === item.useAnimation) {
            result = false;
        }
        else if (mana !== 1.0 && Round(item.mana * mana) === item.mana) {
            result = false;
        }
        else if (knockBack !== 1.0 && item.knockBack === 0) {
            result = false;
        }
        
        return { result, damage, knockBack, speed, size, shootSpeed, mana, crit, tagDamage, armorPenetration };
    }
    
    static LoadPrefixes() {
        for (const prefix of this.Prefixes) {
            this.Load(prefix);
        }
    }
    
    static Load(prefix) {
        this.Count++;
        const newSize = Terraria.Lang.prefix.length + 1;
        prefix.Type = newSize - 1;
        this.ModTypes.add(prefix.Type);
        
        const prefixName = Terraria.Localization.LocalizedText.new();
        prefixName['void .ctor(string key, string text)'](`Prefix.${prefix.constructor.name}`, prefix.DisplayName);
        resizeArrayProperty(Terraria.Lang, 'prefix', newSize, prefixName);
        resizeArrayProperty(Terraria.ID.PrefixID.Sets, 'ReducedNaturalChance', newSize);
        
        this.categoryPrefixes[prefix.Category].push(prefix.Type);
    }
    
    static SetupContent() {
        this.PrefixCount = Terraria.Lang.prefix.length;
        
        for (let i = 0; i < this.categoryPrefixes.length; i++) {
            this.categoryPrefixes[i] = [];
        }
        
        this.LoadPrefixes();
        for (const prefix of this.Prefixes) {
            prefix.SetupContent();
        }
    }
    
    static PostSetupContent() {
        this.PrefixCount = Terraria.Lang.prefix.length;
        this.itemPrefixesByType = new Array(ItemLoader.ItemCount).fill(null);
        for (const prefix of this.Prefixes) {
            prefix.PostSetupContent();
        }
    }
    
    static GetPrefixesInCategory(category) {
        return this.categoryPrefixes[category];
    }
    
    static GetPrefixCategories(item) {
        const type = item.type;
        if (type < 0 || type >= this.itemPrefixesByType.length) {
            return [];
        }
        
        if (this.itemPrefixesByType[type] !== null) {
            return this.itemPrefixesByType[type];
        }
        
        const categories = [];
        
        if (ItemLoader.isModType(type)) {
            const modItem = ItemLoader.getModItem(item.type);
            if (modItem.MeleePrefix(item)) categories.push(PrefixCategory.Melee);
            if (modItem.RangedPrefix(item)) categories.push(PrefixCategory.Ranged);
            if (modItem.MagicPrefix(item)) categories.push(PrefixCategory.Magic);
            if (modItem.SummonPrefix(item)) categories.push(PrefixCategory.Summon);
            if (modItem.WeaponPrefix(item)) categories.push(PrefixCategory.AnyWeapon);
        } else {
            if (ItemLoader.MeleePrefix(item)) categories.push(PrefixCategory.Melee);
            if (ItemLoader.RangedPrefix(item)) categories.push(PrefixCategory.Ranged);
            if (ItemLoader.MagicPrefix(item)) categories.push(PrefixCategory.Magic);
            if (ItemLoader.SummonPrefix(item)) categories.push(PrefixCategory.Summon);
            if (ItemLoader.WeaponPrefix(item)) categories.push(PrefixCategory.AnyWeapon);
        }
        if (item.IsAPrefixableAccessory()) categories.push(PrefixCategory.Accessory);
        
        this.itemPrefixesByType[type] = categories;
        
        return categories;
    }
    
    static GetCustomPrefixes(item) {
        return this.Prefixes.filter(p => (p.Category === PrefixCategory.Custom && p.CanRoll(item))).map(p => p.Type);
    }
    
    static CanRoll(item, prefix) {
        let result = true;
        if (this.isModType(prefix)) {
            result = this.getModPrefix(prefix).CanRoll(item) ?? true;
        }
        return result;
    }
    
    static ApplyPrefix(item, prefix) {
        if (this.isModType(prefix)) {
            this.getModPrefix(prefix).Apply(item);
        }
        ItemLoader.ApplyPrefix(item, prefix);
    }
    
    static ApplyAccessoryEffects(player, item) {
        const prefix = item.prefix;
        if (this.isModType(prefix)) {
            this.getModPrefix(prefix).ApplyAccessoryEffects(player);
        }
    }
}