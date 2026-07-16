import {
  ModBardItem
} from "../../../Common/ModBardItem.js";
import { ThoriumSoundPlayer } from "../../../Common/ThoriumSoundPlayer.js";
import {
  Terraria,
  Modules
} from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import {
  ModProjectile
} from "../../../TL/ModProjectile.js";
import {
  Empowerments
} from "../../Global/Empowerments.js";

const {
  Color,
  Vector2,
  Rand,
  Effects
} = Modules;

const NewProjectile =
  Terraria.Projectile[
  "int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)"
  ];

export class HoneyRecorder extends ModBardItem {
  constructor() {
    super();
    this.Texture = "Items/Bard/" + this.constructor.name;
    this.beeMode = false; // false = HoneyRecorderPro, true = Abelhas
  }

  SetDefaults() {
    this.Item.shoot = ModProjectile.getTypeByName("HoneyRecorderPro");
    this.Item.shootSpeed = 7.5;

    this.SetWeaponValues(18, 3, 1);
    this.SetDefaultWeaponStyle(15, true);
    this.Item.autoReuse = true;

    this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.holdStyle = 3;
    this.Item.scale = 0.8;
  }

  UseItem(item, player) {
    super.UseItem(item, player);
    if (player.itemAnimation === player.itemAnimationMax) {
      ThoriumSoundPlayer.Play('fluteSound');
      Empowerments.Apply(player, "ResourceGrabRange", 2);
    }
    return true;
  }

  ModifyShootStats(item, player, stats) {
    const isAltPressed =
      player.altFunctionUse === 2 ||
      player.controlUseTile ||
      player.controlInteraction ||
      player.controlSmart;

    if (isAltPressed) {
      this.beeMode = !this.beeMode;

      if (this.beeMode) {
        Effects.PlaySound(Terraria.ID.SoundID.Item17, player.Center.X, player.Center.Y);
      } else {
        Effects.PlaySound(Terraria.ID.SoundID.Item15, player.Center.X, player.Center.Y);
      }
      return stats;
    }
    return stats;
  }

  Shoot(item, player, position, velocity, type, damage, knockBack) {
    if (this.beeMode) {
      const source = player.GetProjectileSource_Item(item);
      const numBees = 3;

      for (let i = 0; i < numBees; i++) {
        const offsetX = -40 * player.direction + Rand.Next(-25, 26);
        const offsetY = -Rand.Next(-10, 30);
        const spawnPos = Vector2.new(position.X + offsetX, position.Y + offsetY
        );

        const numDusts = 10;
        for (let j = 0; j < numDusts; j++) {
          const angle = (j / numDusts) * Math.PI * 2;
          let dir = Vector2.new(Math.cos(angle), Math.sin(angle));
          const dustOffset = Vector2.new(dir.X * 3, dir.Y * 9);

          const velocityAngle = Math.atan2(velocity.Y, velocity.X);
          const rotatedOffset = Vector2.new(
            dustOffset.X * Math.cos(velocityAngle) - dustOffset.Y * Math.sin(velocityAngle),
            dustOffset.X * Math.sin(velocityAngle) + dustOffset.Y * Math.cos(velocityAngle)
          );

          const dustPos = Vector2.Add(spawnPos, rotatedOffset);
          let dustDir = Vector2.Normalize(rotatedOffset);
          if (dustDir.Length() < 0.1) dustDir = Vector2.new(0, -1);

          const dust = Terraria.Dust.NewDustPerfect(
            dustPos, 153, dustDir, 0, Color.Gold, 1.25
          );
          if (dust) {
            dust.noGravity = true;
            dust.scale = 1.20;
          }
        }
        NewProjectile(source, spawnPos, velocity, 181, Math.round(damage * 0.25), knockBack, player.whoAmI, 0, 0, 0, null);
      }

      Effects.PlaySound(Terraria.ID.SoundID.Item17, position.X, position.Y);
      return false;
    } else {
      return true;
    }
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(Terraria.ID.ItemID.BottledHoney, 12)
      .AddIngredient(Terraria.ID.ItemID.Hive, 6)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}