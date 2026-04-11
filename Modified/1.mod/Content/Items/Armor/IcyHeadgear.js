import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js'
import { ModLocalization } from './../../../TL/ModLocalization.js';
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class IcyHeadgear extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Armor/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 2;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 4, 50);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
  }

  AddArmorSets() {
    this.CreateArmorSet(
      this.Type,
      ModItem.getTypeByName("IcyMail"),
      ModItem.getTypeByName("IcyGreaves"),
      "Hi"
    );
  }

  UpdateArmorSet(item, player) {
    const projType = ModProjectile.getTypeByName("IcyArmorEffect1");

    let hasProj = false;

    for (let i = 0; i < Terraria.Main.maxProjectiles; i++) {
      let p = Terraria.Main.projectile[i];

      if (p && p.active && p.owner === player.whoAmI && p.type === projType) {
        hasProj = true;
        break;
      }
    }

    if (!hasProj && player.whoAmI === Terraria.Main.myPlayer) {
      NewProjectile(
        player.GetProjectileSource_Item(item),
        player.Center,
        Modules.Vector2.Zero,
        projType,
        0,
        0,
        player.whoAmI,
        0, 0, 0,
        null
      );
    }
  }
}