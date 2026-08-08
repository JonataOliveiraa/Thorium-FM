import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Vector2, Effects } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _shockType = -1;

export class ChampionSwiftBlade extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BossBuriedChampion/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 54;
    this.Item.height = 54;
    this.Item.damage = 30;
    this.Item.melee = true;
    this.Item.useTime = 20;
    this.Item.useAnimation = 20;
    this.Item.autoReuse = true;
    this.Item.useStyle = 1;
    this.Item.knockBack = 5;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  OnHitNPC(item, player, npc, damageDone, knockBack) {
    if (!player || !npc) return;
    if (ThoriumPlayer.itemSwordStrikeCooldown > 0) return;

    if (_shockType === -1) {
      _shockType = ModProjectile.getTypeByName('ChampionShock') ?? -2;
    }

    if (_shockType > 0) {
      ThoriumPlayer.itemSwordStrikeCooldown = Math.floor(this.Item.useTime / 2) + 8;
      try {
        Effects.PlaySound(Terraria.ID.SoundID.Item19, player.position.X, player.position.Y);
      } catch (_) { }

      let targetDir = Vector2.new(Terraria.Main.mouseX + Terraria.Main.screenPosition.X - player.Center.X, Terraria.Main.mouseY + Terraria.Main.screenPosition.Y - player.Center.Y);
      const len = Math.sqrt(targetDir.X * targetDir.X + targetDir.Y * targetDir.Y);
      if (len > 15) {
        targetDir.X = (targetDir.X / len) * 15;
        targetDir.Y = (targetDir.Y / len) * 15;
      }

      NewProjectile(null, player.Center, targetDir, _shockType, Math.floor(damageDone * 0.75), knockBack, player.whoAmI, 0, 0, 0, null);
    }
  }

  MeleeEffects(item, player, hitbox) {
    const dustIdx = Terraria.Dust.NewDust(Vector2.new(hitbox.X, hitbox.Y), hitbox.Width, hitbox.Height, 57, 0, 0, 0, undefined, 1);
    const dust = Terraria.Main.dust[dustIdx];
    if (dust) dust.noGravity = true;
  }
}
