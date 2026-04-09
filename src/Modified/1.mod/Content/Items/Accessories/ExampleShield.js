import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModPlayer } from './../../../TL/ModPlayer.js';

export class ExampleShield extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Accessories/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.buyPrice(10, 50, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.accessory = true;
        
        this.Item.defense = 1000;
        this.Item.lifeRegen = 10;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        
        if (!this.ExampleDashPlayer) {
            this.ExampleDashPlayer = ModPlayer.getByName('ExampleDashPlayer');
        }
        this.ExampleDashPlayer.DashAccessoryEquipped = true;
    }
    
    CanAccessoryBeEquippedWith(incomingItem, equippedItem, player) {
        // Can't be equipped with "ExampleStatAccessory"
        if (equippedItem.type === ModItem.getTypeByName('ExampleStatAccessory')) {
            return false;
        }
        
        // Returns true to preserve vanilla behavior
        return true;
    }
}