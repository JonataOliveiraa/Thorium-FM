import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SteelHammer extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Steel/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.melee = true;
        this.Item.hammer = 70;
        this.SetWeaponValues(22, 6, 0);
        this.SetDefaultWeaponStyle(12, true);
        this.Item.value = Terraria.Item.sellPrice(0, 0, 80, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
}