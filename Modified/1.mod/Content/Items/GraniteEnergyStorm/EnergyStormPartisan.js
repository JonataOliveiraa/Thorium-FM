import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class EnergyStormPartisan extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/GraniteEnergyStorm/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.melee = true;
        this.SetWeaponValues(24, 5, 4);
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.maxStack = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('EnergyStormPartisanPro');
        this.Item.shootSpeed = 8;
    }
}
