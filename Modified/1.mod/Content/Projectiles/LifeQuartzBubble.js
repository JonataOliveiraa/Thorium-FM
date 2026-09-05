import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Effects, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const LAYER_UNDER_PLAYERS = 0;

const DEATH_DUST = 205;
const DEATH_DUST_COUNT = 8;
const DEATH_DUST_SPREAD = 6;

const FADE_IN_TIME = 20;
const FADE_OUT_TIME = 60;
const BASE_ALPHA = 140;

const PULSE_SPEED = 0.06;
const PULSE_DEPTH = 0.07;
const BASE_SCALE = 1;

export class LifeQuartzBubble extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._tint = null;
    }

    SetDefaults() {
        this.Projectile.width = 60;
        this.Projectile.height = 60;
        this.Projectile.aiStyle = 0;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.timeLeft = 900;
        this.Projectile.alpha = 0;
    }

    _opacity(proj) {
        const spawned = 900 - proj.timeLeft;
        if (spawned < FADE_IN_TIME) return spawned / FADE_IN_TIME;
        if (proj.timeLeft < FADE_OUT_TIME) return proj.timeLeft / FADE_OUT_TIME;
        return 1;
    }

    GetAlpha(proj, lightColor) {
        if (!this._tint) this._tint = Color.new(255, 255, 255, BASE_ALPHA);
        return Color.Multiply(this._tint, this._opacity(proj));
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) {
            proj.Kill();
            return;
        }

        proj.drawLayer = LAYER_UNDER_PLAYERS;
        proj.Center = player.Center;
        proj.gfxOffY = player.gfxOffY;

        if (proj.timeLeft === 899) {
            Effects.PlaySound(Terraria.ID.SoundID.Item29, proj.Center.X, proj.Center.Y, 1, 0, 0.7);
        }

        proj.scale = BASE_SCALE + Math.sin(proj.timeLeft * PULSE_SPEED) * PULSE_DEPTH;
        proj.rotation += 0.01;
    }

    OnKill(proj) {
        Effects.PlaySound(Terraria.ID.SoundID.Item43, proj.Center.X, proj.Center.Y, 1, 0, 0.8);

        for (let index = 0; index < DEATH_DUST_COUNT; index++) {
            const dustIndex = Effects.NewDust(
                proj.position, proj.width, proj.height, DEATH_DUST,
                Rand.Next(-DEATH_DUST_SPREAD, DEATH_DUST_SPREAD),
                Rand.Next(-DEATH_DUST_SPREAD, DEATH_DUST_SPREAD),
                0, Color.White, 0.8
            );
            const dust = Main.dust[dustIndex];
            if (dust) dust.noGravity = true;
        }
    }
}
