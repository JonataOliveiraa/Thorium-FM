import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { PlayerDB } from "../../../TL/PlayerDB.js"

export class InspirationFragment extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/' + this.constructor.name;
  }

  SetDefaults() {
    const item = this.Item;
    item.maxStack = 10;
    item.consumable = true;
    item.rare = Terraria.ID.ItemRarityID.Blue;
    item.useStyle = 4;
  }

  CanUseItem(item, player) {
    const IP = PlayerDB.get("InspirationMax")
    if (IP < 20) {
      return true;
    }
    else return false
  }

  UseItem(item, player) {
    Effects.PlaySound(Terraria.ID.SoundID.Item4, player.Center.X, player.Center.Y, 0, 1.0, 1.0)
    const IP = PlayerDB.get("InspirationMax")
    const BuffDuration = PlayerDB.get("BardBuffDurationX")
    PlayerDB.set("InspirationMax", IP + 1)
    PlayerDB.set("BardBuffDurationX", BuffDuration + 0.015)
    return true;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(75, 1)
      .AddIngredient(ModItem.getTypeByName('ThoriumBar'), 2)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}