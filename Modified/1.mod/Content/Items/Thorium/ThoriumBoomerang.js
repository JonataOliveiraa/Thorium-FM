import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class ThoriumBoomerang extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Thorium/' + this.constructor.name;
    }
    
    SetDefaults() {
    this.Item.width = 32;
    this.Item.height = 32;

    this.Item.melee = true;
    this.Item.noMelee = true;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 15);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
    this.Item.maxStack = 1

    this.SetWeaponValues(15, 8, 4);
    this.SetDefaultWeaponStyle(25, false);
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noUseGraphic = true;

    // Shoot
    this.Item.shoot = ModProjectile.getTypeByName("ThoriumBoomerangPro");
    this.Item.shootSpeed = 15;
  }

  CanUseItem(item, player) {
    return player.ownedProjectileCounts[this.Item.shoot] < 1;
  }
}