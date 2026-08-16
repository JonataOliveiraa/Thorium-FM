import { PrefixLoader } from './Loaders/PrefixLoader.js';
import { ModLocalization } from './ModLocalization.js';
import { PrefixCategory } from './PrefixCategory.js';

export class ModPrefix {
    Type = -1;
    
    get DisplayName() {
        return ModLocalization.Translate(`Prefix.${this.constructor.name}`);
    }
    
    get Category() {
        return PrefixCategory.Custom;
    }
    
    SetupContent() {}
    
    PostSetupContent() {}
    
    GetPrefixedItemName(item) {
        return `${this.DisplayName} ${item.Name}`;
    }
    
    // Use this method to control which items will receive your custom prefix.
    // Not required for prefix categories other than Custom. 
    CanRoll(item) {
        return this.Category !== PrefixCategory.Custom;
    }
    
    // stats = { damage, knockBack, speed, size, shootSpeed, mana, crit, tagDamage, armorPenetration };
    SetStats(stats) {
        
    }
    
    AllStatChangesHaveEffectOn(item) {
        return true;
    }
    
    Apply(item) {
        
    }
    
    GetValueMultiplier() {
        return 1.0;
    }
    
    ApplyAccessoryEffects(player) {
        
    }
    
    static isModType(type) {
        return PrefixLoader.isModType(type);
    }
    static getModPrefix(type) {
        return PrefixLoader.getModPrefix(type);
    }
    static getByName(name) {
        return PrefixLoader.getByName(name);
    }
    static getTypeByName(name) {
        return this.getByName(name)?.Type ?? 0;
    }
    static register(prefix) {
        PrefixLoader.register(new prefix());
    }
}