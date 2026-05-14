import { ModBardItem } from "../../../Common/ModBardItem.js";
import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";

export class ItemsClassIcon extends GlobalHooks {
	constructor() {
        super()
        this.Bard = Terraria.ID.ItemID.SpiderLantern;
	    this.Cleric = Terraria.ID.ItemID.SpikeLantern;
    }

    isNewClassItem(item) {
        if(ModHealerItem.healerItemsName.has(item.type) || ModBardItem.bardItemsName.has(item.type)) return true
        return false
    }
	
    Initialize() {
        Terraria.Item.get_HoverName.hook((original, item) => {
            if(ModBardItem.bardItemsName.has(item.type)) {
                return `[i:${this.Bard}]` + original(item)
            }

            if(ModHealerItem.healerItemsName.has(item.type)) {
                return `[i:${this.Cleric}]` + original(item)
            }

            if(item.magic && !item.melee && !this.isNewClassItem(item)) return '[i:489]' + original(item)
            if(item.ranged && !item.melee && !this.isNewClassItem(item)) return '[i:491]' + original(item)
            if(item.summon && !item.melee && !this.isNewClassItem(item)) return '[i:2998]' + original(item)
            if(item.melee && !this.isNewClassItem(item)) return '[i:490]' + original(item)

            
            return original(item)
        })
    }

    
}