import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Effects, Rand } = Modules;
const { Main } = Terraria;

const SPAWN_DUST = 157;
const SPAWN_DUST_COUNT = 10;
const SPAWN_DUST_TICKS = 2;
const SPAWN_DUST_SPREAD = 4;
const SPAWN_DUST_SCALE = 1.2;

const FADE_OUT_TIME = 30;
const FADE_OUT_SPEED = 5;
const ROTATION_SPEED = 0.02;

const TINT_ALPHA = 100;
const TINT_SCALE = 0.75;

export class ForestOcarinaPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._tint = null;
    }

    SetDefaults() {
        this.Projectile.width = 82;
        this.Projectile.height = 82;
        this.Projectile.aiStyle = 0;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 600;
    }

    _createBurst(proj) {
        const position = proj.position;
        const width = proj.width;
        const height = proj.height;

        for (let index = 0; index < SPAWN_DUST_COUNT; index++) {
            const dustIndex = Effects.NewDust(
                position, width, height, SPAWN_DUST,
                Rand.Next(-SPAWN_DUST_SPREAD, SPAWN_DUST_SPREAD + 1),
                Rand.Next(-SPAWN_DUST_SPREAD, SPAWN_DUST_SPREAD + 1),
                0, null, SPAWN_DUST_SCALE
            );
            const dust = Main.dust[dustIndex];
            if (dust) dust.noGravity = true;
        }
    }

    GetAlpha(proj, lightColor) {
        if (!this._tint) this._tint = Color.new(255, 255, 255, TINT_ALPHA);
        return Color.Multiply(this._tint, TINT_SCALE * proj.Opacity);
    }

    AI(proj) {
        const local = new ProjAI(proj, true);

        if (local[0] < SPAWN_DUST_TICKS) {
            this._createBurst(proj);
            local[0]++;
        }

        if (proj.timeLeft <= FADE_OUT_TIME) {
            proj.alpha = Math.min(255, proj.alpha + FADE_OUT_SPEED);
        }

        proj.rotation += ROTATION_SPEED;
    }
}
