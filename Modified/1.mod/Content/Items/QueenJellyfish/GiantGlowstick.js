import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class GiantGlowstick extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/QueenJellyfish/' + this.constructor.name;
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

    this.SetWeaponValues(30, 4, 25);
    this.SetDefaultWeaponStyle(12, false);

    this.Item.autoReuse = true;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noUseGraphic = true;

    this.Item.shoot = ModProjectile.getTypeByName("GiantGlowstickPro");
    this.Item.shootSpeed = 12;
  }

  CanUseItem(item, player) {
    return player.ownedProjectileCounts[this.Item.shoot] < 1;
  }
}