import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

import { AndroidSound, AndroidSoundManager } from "../../../Common/Snippets/AndroidSound.js";
import { BardItemSound } from "../../../Common/Enum/BardItemSound.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class Harmonica extends ModBardItem {
  constructor() {
    super();
    this.Texture = 'Items/Bard/' + this.constructor.name;
    // this.useTimer = true;
    //this.timerStyle = 'Wind';

    // this._testSound = new AndroidSound('harmonica.wav');
  }

  SetDefaults() {
    this.Item.shoot = ModProjectile.getTypeByName('HarmonicaPro');
    this.Item.shootSpeed = 8;

    this.SetWeaponValues(10, 2, 2);
    this.SetDefaultWeaponStyle(30, true);

    this.Item.value = Terraria.Item.sellPrice(0, 0, 3, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.holdStyle = 3;
    this.Item.UseSound = BardItemSound.Harmonica
    this.Item.scale = 0.8;
  }

  UseItem(item, player) {
    super.UseItem(item, player);
    if (player.itemAnimation === player.itemAnimationMax) {
      // this._testSound.Play(player.Center.X, player.Center.Y, 1, 0.9, 1.1);
      Empowerments.Apply(player, "ResourceGrabRange", 1);
    }
    return true;
  }

  Shoot(item, player, position, velocity, type, damage, knockBack) {
    const norm = Vector2.Normalize(velocity);
    const spawnPos = Vector2.new(
      position.X + norm.X * 25,
      position.Y + norm.Y * 25
    );

    // Disparo lento (0.8x velocidade)
    const slowVelocity = Vector2.new(
      velocity.X * 0.8,
      velocity.Y * 0.8
    );
    NewProjectile(
      player.GetProjectileSource_Item(item),
      spawnPos, slowVelocity, type, damage, knockBack,
      player.whoAmI, 0, 0, 0, null
    );

    // Disparo normal (1.0x velocidade)
    NewProjectile(
      player.GetProjectileSource_Item(item),
      spawnPos, velocity, type, damage, knockBack,
      player.whoAmI, 0, 0, 0, null
    );

    // Disparo rápido (1.2x velocidade)
    const fastVelocity = Vector2.new(
      velocity.X * 1.2,
      velocity.Y * 1.2
    );
    NewProjectile(
      player.GetProjectileSource_Item(item),
      spawnPos, fastVelocity, type, damage, knockBack,
      player.whoAmI, 0, 0, 0, null
    );

    return false;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddRecipeGroup('IronBar')
      .AddIngredient(Terraria.ID.ItemID.IronBar, 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register()
  }
}