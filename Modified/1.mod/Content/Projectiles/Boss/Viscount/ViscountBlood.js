import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { SoundHelper } from '../../../Global/Utils/SoundHelper.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const WHITE = Color.White;

const TRAIL_RATE = 5; // 1 particula de rastro a cada N ticks
const { Main } = Terraria;

/**
 * Gotas de sangue cuspidas pelo globulo. Aplicam Bleeding (5s).
 */
export class ViscountBlood extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = true;
        this.Projectile.alpha = 60;
    }

    AI(proj) {
        // Gravidade
        let vel = proj.velocity;
        vel.Y += 0.16;
        if (vel.Y > 12) vel.Y = 12;
        vel.X *= 0.995;
        proj.velocity = vel;

        proj.rotation = Vector2.ToRotation(proj.velocity) + Math.PI / 2;

        if (proj.timeLeft % TRAIL_RATE === 0) {
            const dust = Main.dust[Effects.NewDust(proj.position, proj.width, proj.height, 5, 0, 0, 100, WHITE, 1)];
            if (dust) dust.noGravity = true;
        }
    }

    OnHitPlayer(proj, player) {
        player.AddBuff(Terraria.ID.BuffID.Bleeding, 300, false);
    }

    OnKill(proj) {
        SoundHelper.play(['Item54', 'Item10'], proj.Center.X, proj.Center.Y, 0.2, 0.5);
        FxHelper.burst(proj.position, proj.width, proj.height, 4, 5, 2, 1.1);
    }
}
