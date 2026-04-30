import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class EnchantedStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 4;
        Terraria.Item.staff[this.Type] = true;
        this.Item.shoot = ModProjectile.getTypeByName('EnchantedStaffPro');
        this.Item.shootSpeed = 10;
        
        this.SetWeaponValues(14, 6, 4);
        this.SetDefaultWeaponStyle(24, true);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
}