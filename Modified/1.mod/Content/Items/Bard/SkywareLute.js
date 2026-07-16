import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

import { AndroidSound, AndroidSoundManager } from "../../../Common/Snippets/AndroidSound.js";
import { BardItemSound } from "../../../Common/Enum/BardItemSound.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class SkywareLute extends ModBardItem {
  constructor() {
    super();
    this.Texture = 'Items/Bard/' + this.constructor.name;
    // this.useTimer = true;
    // this.timerStyle = 'String';
    // this._testSound = new AndroidSound('lute.wav');
  }

  SetDefaults() {
    this.Item.shoot = ModProjectile.getTypeByName('SkywarePro');
    this.Item.shootSpeed = 15;

    this.SetWeaponValues(14, 4, 5);
    this.SetDefaultWeaponStyle(20, true);
    this.Item.autoReuse = true;
    this.Item.useStyle = 12
    this.Item.UseSound = BardItemSound.SuperGuitarNoise
    this.Item.holdStyle = 5
    this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
  }

  UseItem(item, player) {
    super.UseItem(item, player);
    if (player.itemAnimation === player.itemAnimationMax) {
      // this._testSound.Play(player.Center.X, player.Center.Y, 1, 0.9, 1.1);
      Empowerments.Apply(player, "Defense", 2);
    }
    return true;
  }

  Shoot(item, player, position, velocity, type, damage, knockBack) {
    // Skyware Lute dispara um projétil com efeito especial
    // O projétil já vai ter o comportamento de homing/vento

    const norm = Vector2.Normalize(velocity);
    const spawnPos = Vector2.new(
      position.X + norm.X * 30,
      position.Y + norm.Y * 30
    );

    NewProjectile(
      player.GetProjectileSource_Item(item),
      spawnPos, velocity, type, damage, knockBack,
      player.whoAmI, 0, 0, 0, null
    );

    return false;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(Terraria.ID.ItemID.SunplateBlock, 10)  // 824 = Sunplate Block
      .AddIngredient(Terraria.ID.ItemID.Cloud, 5)           // 75 = Cloud
      .AddTile(Terraria.ID.TileID.SkyMill)                 // 305 = Sky Mill
      .Register();
  }

  HoldoutOffset(item, player) {
    return { X: -4, Y: 2 };
  }
}