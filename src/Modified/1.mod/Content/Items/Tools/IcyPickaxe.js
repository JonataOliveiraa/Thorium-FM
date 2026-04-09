import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class IcyPickaxe extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Tools/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.melee = true;
    this.Item.pick = 40;

    this.SetWeaponValues(5, 2, 0);
    this.SetDefaultWeaponStyle(19, true);
    this.Item.useTurn = true

    this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 8)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}