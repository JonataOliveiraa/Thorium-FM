import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const TileCollision = Terraria.Collision['Vector2 TileCollision(Vector2 oldPosition, Vector2 oldVelocity, int Width, int Height, bool fallThrough, bool fall2, int gravDir, bool ignoreDoors, bool ignoreAetheriumPlatforms, bool hoik)'];

export class SitarWindBurst extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        // O kill sai NO quique, quando ai[0] chega no limite: 2 = quica uma
        // vez e morre no toque seguinte
        this.collideMax = 2;
        this.bounceSpeedReduction = 0.9;
        this.fadeOutTime = 30;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = 0;
        this.Projectile.friendly = true;
        this.Projectile.alpha = 75;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 90;
        this.Projectile.ignoreWater = true;

        // A colisao e feita na mao no PreAI, senao a vanilla mata a rajada
        this.Projectile.tileCollide = false;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, proj.Opacity);
    }

    ModifyDamageHitbox(proj, hitbox) {
        hitbox.X -= 10;
        hitbox.Y -= 10;
        hitbox.Width += 20;
        hitbox.Height += 20;
    }

    // ai[0] conta os quiques. Ver UkulelePro: mesma colisao manual por eixo.
    PreAI(proj) {
        const ai = new ProjAI(proj, false);
        const vel = proj.velocity;
        const dir = vel.X > 0 ? 1 : -1;

        proj.rotation += dir * 0.25;
        proj.spriteDirection = dir;

        // Rastro de vento, nascendo um passo atras da posicao atual
        const trailPos = Vector2.new(proj.position.X - vel.X, proj.position.Y - vel.Y);
        for (let i = 0; i < 3; i++) {
            const dust = Main.dust[Effects.NewDust(trailPos, proj.width, proj.height, 216, 0, 0, 125, Color.White, 1)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.3);
            dust.noGravity = true;
        }

        const oldVX = vel.X;
        const oldVY = vel.Y;
        const allowed = TileCollision(proj.position, vel, proj.width, proj.height, true, true, 1, false, false, true);

        const hitX = oldVX !== 0 && allowed.X !== oldVX;
        const hitY = oldVY !== 0 && allowed.Y !== oldVY;

        if (hitX || hitY) {
            proj.velocity = Vector2.new(
                hitX ? -oldVX * this.bounceSpeedReduction : allowed.X,
                hitY ? -oldVY * this.bounceSpeedReduction : allowed.Y
            );

            ai[0] = (ai[0] || 0) + 1;
            Effects.PlaySound(Terraria.ID.SoundID.Item10, proj.position.X, proj.position.Y);
            FxHelper.burst(proj.position, proj.width, proj.height, 6, 216, 2, 1, 0);

            if (ai[0] >= this.collideMax) {
                proj.Kill();
                return false;
            }
        } else {
            proj.velocity = Vector2.new(allowed.X, allowed.Y);
        }

        if (proj.timeLeft < this.fadeOutTime) {
            proj.Opacity = proj.timeLeft / this.fadeOutTime;
        }

        return false;
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 15, 216, 4, 1.5, 0);
    }
}
