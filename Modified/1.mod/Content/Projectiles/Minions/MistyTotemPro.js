import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const DUST_BUBBLE = 176;
const DUST_MIST = 172;
const DUST_SPLASH = 29;

const TRAIL_BUBBLE = 4;
const TRAIL_MIST = 2;
const TRAIL_DRAG = 0.2;

const RISE_DRAG = 1.0065;
const HOP_IMPULSE = 1.02;
const HOP_INTERVAL = -15;
const DEATH_DUSTS = 10;

export class MistyTotemPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.light = 0.2;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        let vy = proj.velocity.Y / RISE_DRAG;

        ai[1]++;
        if (ai[1] >= 0) {
            vy += HOP_IMPULSE;
            ai[1] = HOP_INTERVAL;
        }

        proj.velocity = Vector2.new(proj.velocity.X, vy);

        const origin = Vector2.Subtract(proj.position, proj.velocity);

        for (let i = 0; i < TRAIL_BUBBLE; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, DUST_BUBBLE, 0, 0, 100, Color.White, 1.2)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, TRAIL_DRAG);
            dust.noGravity = true;
        }

        for (let i = 0; i < TRAIL_MIST; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, DUST_MIST, 0, 0, 100, Color.White, 0.8)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, TRAIL_DRAG);
            dust.noGravity = true;
        }
    }

    OnKill(proj, timeLeft) {
        const origin = Vector2.new(proj.position.X, proj.position.Y + 2);
        for (let i = 0; i < DEATH_DUSTS; i++) {
            const dust = Main.dust[NewDust(origin, proj.width + 5, proj.height + 5, DUST_SPLASH, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1.5)];
            if (dust) dust.noGravity = true;
        }
    }
}
