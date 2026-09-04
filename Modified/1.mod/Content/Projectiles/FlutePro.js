import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { WindHoming } from './../../Common/WindHoming.js';

const { MathHelper, Vector2 } = Modules;
const { Main } = Terraria;

const NewDustPerfect = Terraria.Dust.NewDustPerfect;
const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const TRAIL_DUST = 31;
const TRAIL_COUNT = 1;
const TRAIL_SCALE = 0.8;

const HOMING_DELAY = 2;
const HOMING_RANGE = 300;
const HOMING_TURN = 0.06;

export class FlutePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 6;
        this.Projectile.height = 6;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.friendly = true;
        this.Projectile.timeLeft = 120;
        this.Projectile.tileCollide = true;
    }

    AI(proj) {
        const velocity = proj.velocity;

        for (let i = 0; i < TRAIL_COUNT; i++) {
            const pos = Vector2.new(
                proj.Center.X - velocity.X / TRAIL_COUNT * i,
                proj.Center.Y - velocity.Y / TRAIL_COUNT * i
            );
            const dust = NewDustPerfect(pos, TRAIL_DUST, null, 0, null, TRAIL_SCALE);
            if (!dust) continue;
            dust.noGravity = true;
            dust.noLight = true;
        }

        this.Home(proj);
        proj.rotation = Vector2.ToRotation(proj.velocity) - MathHelper.PiOver2;
    }

    Home(proj) {
        const ai = new ProjAI(proj);
        ai[1]++;
        if (!WindHoming.Active() && ai[1] <= HOMING_DELAY) return;
        ai[1] = 0;

        const target = FindTargetWithinRange(proj, HOMING_RANGE, true);
        if (!target) return;

        const velocity = proj.velocity;
        const speed = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        if (speed <= 0) return;

        const dx = target.Center.X - proj.Center.X;
        const dy = target.Center.Y - proj.Center.Y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 0) return;

        proj.velocity = Vector2.new(
            (velocity.X * (1 - HOMING_TURN) + dx / distance * speed * HOMING_TURN),
            (velocity.Y * (1 - HOMING_TURN) + dy / distance * speed * HOMING_TURN)
        );
    }

    OnTileCollide(proj, hitDirection) {
        if (proj.timeLeft <= 0) return true;

        const velocity = proj.velocity;
        proj.velocity = Vector2.new(-velocity.X, -velocity.Y);
        return false;
    }
}
