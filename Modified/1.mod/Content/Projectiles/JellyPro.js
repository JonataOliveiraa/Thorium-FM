import { Terraria, Modules } from "../../TL/ModImports.js";
import { ModProjectile } from "../../TL/ModProjectile.js";
import { ProjAI } from "../../TL/ProjAI.js";

const { Vector2, Color } = Modules;
const NewDustDirect = Terraria.Dust.NewDustDirect; 

export class JellyPro extends ModProjectile {

    constructor() {
        super();
        this.Texture = "Projectiles/" + this.constructor.name;
        this.unY = Vector2.UnitY;
        this.vec2_0_10 = Vector2.new(0, 10);
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 4;
    }

    SetDefaults() {
        this.Projectile.width = 26;
        this.Projectile.height = 26;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 60;
        this.Projectile.ignoreWater = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = -1;
        this.Projectile.alpha = 0;
    }

    GetAlpha(proj, lightColor) {
        return Color.new(lightColor.R, lightColor.G, lightColor.B, 255 - proj.alpha);
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        if (localAI[0] === 0) {
            localAI[0] = 1;
            for (let i = 0; i < 20; i++) {
                let offset = Vector2.RotatedBy(
                    this.unY,
                    i * ((Math.PI * 2) / 20)
                );

                offset = Vector2.Multiply(offset, -1);
                offset = Vector2.Multiply(offset, Vector2.new(3, 10));
                offset = Vector2.RotatedBy(offset, Vector2.ToRotation(proj.velocity));

                const dust = NewDustDirect(
                    proj.Center,
                    0,
                    0,
                    113,
                    0,
                    0,
                    0,
                    Color.White,
                    1.5
                );

                if (dust) {
                    dust.noGravity = true;
                    dust.noLight = true;
                    dust.position = Vector2.Add(proj.Center, offset);
                    dust.velocity = Vector2.SafeNormalize(offset, this.unY);
                }
            }
        }

        for (let i = 0; i < 2; i++) {
            const dust = NewDustDirect(
                Vector2.Add(proj.position, this.vec2_0_10),
                proj.width,
                proj.height,
                205,
                0,
                0,
                100,
                Color.White,
                0.75
            );

            if (dust) {
                dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
                dust.noGravity = true;
                dust.noLight = true;
            }
        }

        proj.frameCounter++;
        if (proj.frameCounter > 8) {
            proj.frameCounter = 0;
            proj.frame++;
            if (proj.frame > 3)
                proj.frame = 3;
        }

        if (proj.timeLeft <= 30) {
            proj.alpha = Math.floor(255 * (1 - proj.timeLeft / 30.0));
        }
    }

    PreDraw(proj) {
        return true;
    }
}