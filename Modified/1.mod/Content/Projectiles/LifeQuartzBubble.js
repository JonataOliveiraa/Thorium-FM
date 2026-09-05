import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Effects, Rand } = Modules;
const { Main } = Terraria;

const DEATH_DUST = 205;
const DEATH_DUST_COUNT = 8;
const DEATH_DUST_SPREAD = 6;

export class LifeQuartzBubble extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 60;
        this.Projectile.height = 60;
        this.Projectile.aiStyle = 0;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.timeLeft = 900;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) {
            proj.Kill();
            return;
        }

        proj.Center = player.Center;
        proj.gfxOffY = player.gfxOffY;
    }

    OnKill(proj) {
        Effects.PlaySound(Terraria.ID.SoundID.Item43, proj.position.X, proj.position.Y);

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
