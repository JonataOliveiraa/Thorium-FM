import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ModNPC } from './../../../TL/ModNPC.js';

export class GrandFlareGun extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/ThunderBird/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.ranged = true;
    this.Item.noMelee = true
    this.Item.shoot = 1;
    this.Item.shootSpeed = 3;
    this.Item.useAmmo = ModItem.getTypeByName("StormFlare");

    this.SetWeaponValues(8, 0, 0);
    this.SetDefaultWeaponStyle(30, true);

    this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 25);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
  }

  CanUseItem(item, player) {
        const bossType = ModNPC.getTypeByName('TheGrandThunderBird');
        return Terraria.Main.dayTime && player.ZoneDesert && !Terraria.NPC.AnyNPCs(bossType);
    }
}