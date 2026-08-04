import { Terraria } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';

const { Main } = Terraria;

const STONED = 156; // BuffID.Stoned

/**
 * Onda do pisao que petrifica: so acerta se o jogador estiver com os pes no chao.
 * Quem pulou no momento do impacto escapa.
 */
export class ViscountStomp2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 10;
        this.Projectile.alpha = 255;
    }

    PreDraw(proj, lightColor) {
        return false;
    }

    CanDamage(proj) {
        const player = Main.player[Main.myPlayer];
        if (!player || !player.active || player.dead) return false;
        return player.velocity.Y === 0;
    }

    OnHitPlayer(proj, player) {
        player.AddBuff(STONED, 180, false);

        FxHelper.burst(proj.position, proj.width, proj.height + 28, 12, 1, 6, 1.25, 50);
    }
}
