import { ModBuff } from '../../../TL/ModBuff.js';
import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BloomingBow extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Blooming/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.ranged = true;
    this.Item.noMelee = true
    this.Item.shoot = 1;
    this.Item.shootSpeed = 3;
    this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;

    this.SetWeaponValues(10, 1, 4);
    this.SetDefaultWeaponStyle(18, true);

    this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Green;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
  }

  Shoot(item, player, position, velocity, type, damage, knockBack) {

    NewProjectile(
      player.GetProjectileSource_Item_WithPotentialAmmo(item, item.useAmmo),
      position,
      Vector2.Multiply(velocity, 3),
      ModProjectile.getTypeByName('BloomingBowPro'),
      damage,
      knockBack,
      player.whoAmI,
      0, 0, 0, null
    );
    return false;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("Petal"), 8)
      .AddTile(Terraria.ID.TileID.DyeVat)
      .Register();
  }


  HoldItem(item, player) {
    if (player.itemAnimation <= 0) return;

    const mouseX = Terraria.Main.mouseX + Terraria.Main.screenPosition.X;
    const mouseY = Terraria.Main.mouseY + Terraria.Main.screenPosition.Y;

    player['void ChangeDir(int dir)'](mouseX > player.Center.X ? 1 : -1);

    if (player.ItemAnimationJustStarted || player.direction !== this.lockedDir) {
      this.lockedDir = player.direction;
      const c = player.RotatedRelativePoint(player.MountedCenter, true, true);
      const dx = mouseX - c.X;
      const dy = mouseY - c.Y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        this.lockedAngle = Math.atan2(dy / len, dx / len);
      }
    }

    const dir = player.direction;
    player.itemRotation = Math.atan2(
      Math.sin(this.lockedAngle) * dir,
      Math.cos(this.lockedAngle) * dir
    ) - player.fullRotation;
  }

  ModifyTooltipLines() {
    for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
      const line = this.TooltipLines[i];
      this.TooltipLines[i] = line
    }
  }
}