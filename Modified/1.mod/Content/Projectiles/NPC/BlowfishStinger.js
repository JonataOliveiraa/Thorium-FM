import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Color, Rand } = Modules;

const LIFE = 120;
const VENOM_CHANCE = 10; // 1 em N
const VENOM_TIME = 120;

let _alpha = null;

/**
 * Espinho solto pelo Blowfish ao morrer: voa reto, depois roda caindo.
 */
export class BlowfishStinger extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
    }

    GetAlpha(proj, lightColor) {
        // Vai sumindo conforme o tempo acaba
        const fade = Math.min(1, 0.1 * proj.timeLeft) * 0.5;
        return Color.Multiply(Color.White, fade);
    }

    AI(proj) {
        if (proj.timeLeft >= 90) {
            proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) - Math.PI / 2;
        } else {
            proj.rotation += (proj.velocity.X > 0 ? 1 : -1) * 0.04;
        }
    }

    OnHitPlayer(proj, player) {
        if (Rand.Next(VENOM_CHANCE) !== 0) return;
        player.AddBuff(Terraria.ID.BuffID.Venom, VENOM_TIME, false);
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 4, 11, 3, 0.75, 0);
    }
}
