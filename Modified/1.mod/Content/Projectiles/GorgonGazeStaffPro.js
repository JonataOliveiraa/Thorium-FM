import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Vector2, Color } = Modules;

let _petrifyType = -1;

export class GorgonGazeStaffPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 60;
    this.Projectile.height = 60;
    this.Projectile.aiStyle = -1;
    this.Projectile.friendly = true;
    this.Projectile.magic = true;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 30;
    this.Projectile.tileCollide = false;
    this.Projectile.ignoreWater = true;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = 10;
  }

  PreDraw(proj, lightColor) {
    return false;
  }

  OnHitNPC(proj, npc) {
    if (npc && npc.active) {
      if (_petrifyType === -1) _petrifyType = ModBuff.getTypeByName('PetrifyBuff') ?? -2;
      if (_petrifyType > 0) npc.AddBuff(_petrifyType, 120, false);
    }
  }

  _origin(player) {
    const itemLocation = player.itemLocation;
    return player.RotatedRelativePoint(
      Vector2.new(
        itemLocation.X + 12 * player.direction + player.velocity.X,
        itemLocation.Y - 14 + player.velocity.Y
      ),
      true,
      true
    );
  }

  Colliding(proj, myRect, targetRect) {
    const player = Terraria.Main.player[proj.owner];
    if (!player || !player.active) return false;

    const start = this._origin(player);
    const end = proj.Center;
    const dx = end.X - start.X;
    const dy = end.Y - start.Y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const width = 24;
    const steps = Math.max(1, Math.ceil(length / (width * 0.5)));
    const left = targetRect.X - width * 0.5;
    const top = targetRect.Y - width * 0.5;
    const right = targetRect.X + targetRect.Width + width * 0.5;
    const bottom = targetRect.Y + targetRect.Height + width * 0.5;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = start.X + dx * t;
      const y = start.Y + dy * t;
      if (x >= left && x <= right && y >= top && y <= bottom) return true;
    }

    return false;
  }

  AI(proj) {
    const player = Terraria.Main.player[proj.owner];
    if (!player || !player.active) return;

    if (proj.owner === Terraria.Main.myPlayer) {
      const mouseWorld = Terraria.Main.MouseWorld;
      proj.velocity = Vector2.Zero;
      proj.position = Vector2.new(mouseWorld.X - proj.width * 0.5, mouseWorld.Y - proj.height * 0.5);
    }

    // Gorgon Gaze particle beam from the held staff to the cursor.
    const start = this._origin(player);
    const end = proj.Center;
    const dir = Vector2.Subtract(end, start);
    const len = Math.sqrt(dir.X * dir.X + dir.Y * dir.Y);

    if (len > 0) {
      const step = 20;
      const count = Math.floor(len / step);
      for (let i = 0; i < count; i++) {
        const factor = i / (count || 1);
        const pos = Vector2.new(start.X + dir.X * factor, start.Y + dir.Y * factor);
        if (Terraria.Main.rand['int Next(int minValue, int maxValue)'](0, 3) === 0) {
          const dustIdx = Terraria.Dust.NewDust(pos, 4, 4, 159, 0, 0, 100, Color.White, 1);
          const dust = Terraria.Main.dust[dustIdx];
          if (dust) dust.noGravity = true;
        }
      }
    }
  }
}
