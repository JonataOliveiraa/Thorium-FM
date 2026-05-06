import { Terraria, Modules, Microsoft } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Item, Lighting, Main } = Terraria;
const { ItemID, ItemRarityID } = Terraria.ID;
const { Color } = Modules;

const DrawAnimationVertical = new NativeClass('Terraria.DataStructures', 'DrawAnimationVertical');
const Vector3 = new NativeClass('Microsoft.Xna.Framework', 'Vector3');
const AddLight = Lighting['void AddLight(Vector2 position, Vector3 rgb)'];
const Multiply = Vector3['Vector3 Multiply(Vector3 value1, float scaleFactor)'];

export class StormFlare extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/ThunderBird/' + this.constructor.name;
  }

  SetStaticDefaults() {
    const anim = DrawAnimationVertical.new();
    anim.Frame = 0;
    anim.FrameCounter = 0;
    anim.FrameCount = 4;
    anim.TicksPerFrame = 6;
    anim.PingPong = false;
    Main.RegisterItemAnimation(this.Type, anim);
  }

  SetDefaults() {
    this.Item.damage = 0;
    this.Item.ranged = true;
    this.Item.maxStack = 9999;
    this.Item.consumable = true;
    this.Item.knockBack = 2;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 5);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.shoot = ModProjectile.getTypeByName("StormFlareP");
    this.Item.shootSpeed = 1.0;
    this.Item.ammo = this.Type;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddRecipeGroup('IronBar')
      .AddIngredient(Terraria.ID.ItemID.IronBar, 1)
      .AddIngredient(ModItem.getTypeByName("Talon"), 1)
      .AddIngredient(Terraria.ID.ItemID.FallenStar, 1)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}