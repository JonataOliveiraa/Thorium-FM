import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class LootRang extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Melee/' + this.constructor.name;
    }
    
    SetDefaults() {
    // Hitbox
    this.Item.width = 42;
    this.Item.height = 42;

    this.Item.melee = true;
    this.Item.noMelee = true;
    this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 15);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
    this.Item.maxStack = 1

    this.SetWeaponValues(1, 0, 0);
    this.SetDefaultWeaponStyle(25, false);
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noUseGraphic = true;

    // Shoot
    this.Item.shoot = ModProjectile.getTypeByName("LootRangPro");
    this.Item.shootSpeed = 10;
  }

  CanUseItem(item, player) {
    return player.ownedProjectileCounts[this.Item.shoot] < 1;
  }
}