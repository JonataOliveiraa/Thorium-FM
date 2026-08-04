import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const HOME_SPEED = 12;
const CATCH_DIST_SQ = 1600; // 40px: distancia em que a orbe e "bebida"
const HEAL_PER_ORB = 1;

/**
 * Gota de sangue roubada: volta pro jogador e cura ao encostar.
 */
export class VampireScepterPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.friendly = false;
        this.Projectile.hostile = false;
    }

    PreDraw(proj, lightColor) {
        return false;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) {
            proj.Kill();
            return;
        }

        const center = proj.Center;
        const target = player.Center;
        const dx = target.X - center.X;
        const dy = target.Y - center.Y;
        const distSq = dx * dx + dy * dy;

        if (distSq < CATCH_DIST_SQ) {
            try { player['void HealEffect(int healAmount, bool broadcast)'](HEAL_PER_ORB, true); } catch (_) { }
            player.statLife = Math.min(player.statLife + HEAL_PER_ORB, player.statLifeMax2);
            SoundHelper.play(['Item2', 'Item4'], center.X, center.Y, 0.4, 0.4);
            proj.Kill();
            return;
        }

        const dist = Math.sqrt(distSq) || 1;
        const vel = proj.velocity;
        proj.velocity = Vector2.new(
            (vel.X * 20 + dx / dist * HOME_SPEED) / 21,
            (vel.Y * 20 + dy / dist * HOME_SPEED) / 21
        );

        if (proj.timeLeft % 2 === 0) {
            const dust = Main.dust[Effects.NewDust(proj.position, proj.width, proj.height, 5, 0, 0, 150, WHITE, 1)];
            if (dust) {
                dust.noGravity = true;
                dust.velocity = Vector2.Zero;
            }
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 5, 2, 1.25, 150);
    }
}
