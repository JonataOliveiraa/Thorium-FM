import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Effects, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const TRAIL_DUST = 89;
const TRAIL_COUNT = 2;
const PICKUP_DUST_COUNT = 15;
const PICKUP_DUST_SPREAD = 50;

const HOP_INTERVAL = -15;
const HOP_SPEED = 1.05;
const DRAG = 1.0065;

const PICKUP_RANGE_SQUARED = 400;
const RECOVERY_TIME = 180;

let _recoveryType = -1;

export class DewCollectorPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 540;
        this.Projectile.ignoreWater = true;
    }

    _trail(proj) {
        const center = proj.Center;
        const velocity = proj.velocity;

        for (let index = 0; index < TRAIL_COUNT; index++) {
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, TRAIL_DUST, 0, 0, 75, Color.White, 1);
            const dust = Main.dust[dustIndex];
            if (!dust) continue;

            dust.position = Vector2.new(center.X - velocity.X / 3 * index, center.Y - velocity.Y / 3 * index);
            dust.velocity = Vector2.Zero;
            dust.noGravity = true;
        }
    }

    _collect(proj, player) {
        if (_recoveryType === -1) _recoveryType = ModBuff.getTypeByName('LifeRecoveryBuff') ?? -2;
        if (_recoveryType >= 0) player.AddBuff(_recoveryType, RECOVERY_TIME, false);

        Effects.PlaySound(Terraria.ID.SoundID.Item86, proj.Center.X, proj.Center.Y, 1, 0, 0.8);

        for (let index = 0; index < PICKUP_DUST_COUNT; index++) {
            const offsetX = Rand.Next(-PICKUP_DUST_SPREAD, PICKUP_DUST_SPREAD + 1);
            const offsetY = Rand.Next(-PICKUP_DUST_SPREAD, PICKUP_DUST_SPREAD + 1);
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, TRAIL_DUST, 0, 0, 0, Color.White, 1);
            const dust = Main.dust[dustIndex];
            if (!dust) continue;

            dust.noGravity = true;
            dust.position = Vector2.new(dust.position.X + offsetX, dust.position.Y + offsetY);
            dust.velocity = Vector2.new(-offsetX * 0.075, -offsetY * 0.075);
        }

        proj.Kill();
    }

    AI(proj) {
        const velocity = proj.velocity;
        velocity.Y /= DRAG;

        const ai = new ProjAI(proj);
        ai[1]++;
        if (ai[1] >= 0) {
            velocity.Y += HOP_SPEED;
            ai[1] = HOP_INTERVAL;
        }

        proj.velocity = velocity;
        this._trail(proj);

        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) return;
        if (player.DistanceSQ(proj.Center) >= PICKUP_RANGE_SQUARED) return;

        this._collect(proj, player);
    }
}
