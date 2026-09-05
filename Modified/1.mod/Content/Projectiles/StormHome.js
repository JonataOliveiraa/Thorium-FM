import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Effects, Vector2 } = Modules;
const { Main } = Terraria;

const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const TRAIL_DUST = 15;
const TRAIL_COUNT = 3;
const TRAIL_SCALE = 0.8;

const ARM_TIME = 30;
const HOMING_RANGE = 700;
const HOMING_SPEED = 8;
const HOMING_WEIGHT = 0.12;

const SURGE_TIME = 120;

let _surgeType = -1;

export class StormHome extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 12;
        this.Projectile.height = 12;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 180;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
    }

    _trail(proj) {
        const center = proj.Center;
        const velocity = proj.velocity;

        for (let index = 0; index < TRAIL_COUNT; index++) {
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, TRAIL_DUST, 0, 0, 0, Color.White, TRAIL_SCALE);
            const dust = Main.dust[dustIndex];
            if (!dust) continue;

            dust.position = Vector2.new(center.X - velocity.X / 3 * index, center.Y - velocity.Y / 3 * index);
            dust.velocity = Vector2.Zero;
            dust.noGravity = true;
            dust.scale = TRAIL_SCALE;
        }
    }

    AI(proj) {
        this._trail(proj);

        const ai = new ProjAI(proj);
        if (ai[0] < ARM_TIME) {
            ai[0]++;
            return;
        }

        const target = FindTargetWithinRange(proj, HOMING_RANGE, false);
        if (!target) return;

        const center = proj.Center;
        const dx = target.Center.X - center.X;
        const dy = target.Center.Y - center.Y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 0) return;

        const velocity = proj.velocity;
        proj.velocity = Vector2.new(
            velocity.X * (1 - HOMING_WEIGHT) + dx / distance * HOMING_SPEED * HOMING_WEIGHT,
            velocity.Y * (1 - HOMING_WEIGHT) + dy / distance * HOMING_SPEED * HOMING_WEIGHT
        );
    }

    OnHitNPC(proj, npc) {
        if (_surgeType === -1) _surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -2;
        if (_surgeType < 0) return;

        npc.AddBuff(_surgeType, SURGE_TIME, false);
    }
}
