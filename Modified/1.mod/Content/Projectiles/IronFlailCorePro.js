import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Effects } = Modules;

const DEATH_DUST = 11;
const DEATH_DUST_COUNT = 5;

export class IronFlailCorePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 30;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 90;
        this.Projectile.aiStyle = 14;
        this.AIType = 24;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 30;
    }

    OnKill(proj) {
        const position = proj.position;
        const velocity = proj.velocity;

        for (let index = 0; index < DEATH_DUST_COUNT; index++) {
            Effects.NewDust(
                position, proj.width, proj.height, DEATH_DUST,
                velocity.X * 0.5, velocity.Y * 0.8,
                0, Color.White, 1
            );
        }
    }
}
