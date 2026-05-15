import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ThunderTalon extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/ThunderBird/' + this.constructor.name;
  }

  SetDefaults() {
    // Hitbox
    this.Item.width = 40;
    this.Item.height = 40;

    // Weapon Damage
    this.Item.melee = true;
    this.SetWeaponValues(12, 4, 0);
    this.SetDefaultWeaponStyle(22, true);
    this.Item.useStyle = 1;
    this.Item.useTurn = true;

    // Other
    this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  OnHitNPC(item, player, npc, damageDone, knockBack) {
    if (!npc || typeof npc.whoAmI === 'undefined') return;

    const radius = 250;
    let closest = null;
    let closestDist = radius;

    for (let i = 0; i < Terraria.Main.npc.length; i++) {
      const target = Terraria.Main.npc[i];
      if (target.active && target.whoAmI !== npc.whoAmI && !target.friendly) {
        const dist = target.Distance(npc.Center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = target;
        }
      }
    }
    if (closest) {
      const hitDirection = npc.Center.X < closest.Center.X ? 1 : -1;
      closest.StrikeNPCNoInteraction(this.Item.damage, this.Item.knockBack, hitDirection, false, false, false);
    }
  }
}