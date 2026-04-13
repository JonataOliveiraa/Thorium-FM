import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class IceCube extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Icy/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.magic = true;
    this.Item.noMelee = true;
    this.Item.mana = 5;
    this.Item.shoot = ModProjectile.getTypeByName('IceCubePro');
    this.Item.shootSpeed = 10;

    this.SetWeaponValues(12, 3, 0);
    this.SetDefaultWeaponStyle(20, true);
    this.Item.useStyle = 1;
    
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 25);
    this.Item.UseSound = Terraria.ID.SoundID.Item20;
  }
  
  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 7)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}