import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js'
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { ModPlayer } from '../../../TL/ModPlayer.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class IcyHeadgear extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Icy/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 2;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 4, 50);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 6)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }

  AddArmorSets() {
    this.CreateArmorSet(
      this.Type,
      ModItem.getTypeByName("IcyMail"),
      ModItem.getTypeByName("IcyGreaves"),
      ModLocalization.getTranslationArmorSetBonus("Icy")
    );
  }

  UpdateArmorSet(item, player) {
    ThoriumPlayer.IcyArmorBuff = true

    if (!ThoriumPlayer.IcyArmorPro && player.whoAmI === Terraria.Main.myPlayer) {
      const NewPro = NewProjectile(
        player.GetProjectileSource_Item(item),
        player.Center, Modules.Vector2.Zero,
        ModProjectile.getTypeByName("IcyArmorEffect1"),
        0, 0, player.whoAmI, 0, 0, 0, null
      );
      ThoriumPlayer.IcyArmorPro = true
    }
  }
}