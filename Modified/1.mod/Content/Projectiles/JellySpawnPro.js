import { Terraria, Modules } from "../../TL/ModImports.js";
import { ModProjectile } from "../../TL/ModProjectile.js";
import { ProjAI } from "../../TL/ProjAI.js";
import { ModProjectile as MP } from "../../TL/ModProjectile.js";
import { Rand } from "../../TL/Modules/Rand.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";
import { Effects } from "../../TL/Modules/Effects.js";

const { Color } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDustDirect = Terraria.Dust.NewDustDirect; 

export class JellySpawnPro extends ModProjectile {

    constructor() {
        super();
        this.Texture = "Projectiles/" + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 100;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = -1;
        this.Projectile.light = 0.25;
        this.Projectile.timeLeft = 300;
        this.Projectile.ignoreWater = true;
    }

    AI(proj) {
        const ai = new ProjAI(proj);

        if (proj.timeLeft === 300) {
            for (let i = 0; i < 20; i++) {
                let offset = Vector2.Multiply(
                    Vector2.RotatedBy(
                        Vector2.UnitY,
                        i * ((Math.PI * 2) / 20)
                    ),
                    -1
                );
                offset = Vector2.Multiply(offset, Vector2.new(2, 8));
                offset = Vector2.RotatedBy(offset, Vector2.ToRotation(proj.velocity));

                const dust = Terraria.Dust.NewDustDirect(
                    proj.Center,
                    0,
                    0,
                    113,
                    0,
                    0,
                    0,
                    Color.White,
                    1.25
                );

                if (dust) {
                    dust.noGravity = true;
                    dust.noLight = true;

                    dust.position = Vector2.Add(proj.Center, offset);
                    dust.velocity = Vector2.SafeNormalize(offset, Vector2.UnitY);
                }
            }
        }

        ai[1]++;

        if (ai[1] >= 25) {

            ai[1] = 25;

            const vel = proj.velocity;

            vel.X *= 0.98;
            vel.Y += 0.35;

            proj.velocity = vel;
        }

        if (proj.velocity.X > 0)
            proj.rotation -= 0.12;
        else
            proj.rotation += 0.12;
    }

    OnTileCollide(proj) {
        const jelly = ModProjectile.getTypeByName("JellyPro");

        const speeds = [
            -4,
            -5.25,
            -6,
            -5.25,
            -4
        ];

        for (const speed of speeds) {
            NewProjectile(
                null,
                Vector2.new(proj.Center.X + Rand.Next(-50, 50), proj.Center.Y + 120 + Rand.Next(-8, 8)),
                Vector2.new(0, speed),
                jelly,
                proj.damage,
                proj.knockBack,
                proj.owner,
                0, 0, 0,
                null
            );
        }

        Effects.PlaySound(
            Terraria.ID.SoundID.FishSplash,
            proj.Center.X, proj.Center.Y 
        );

        return true;
    }

    OnKill(proj) {

        for (let i = 0; i < 10; i++) {

            const dust = NewDustDirect(
                proj.position,
                proj.width,
                proj.height,
                176,
                Rand.Next(-4, 4),
                Rand.Next(-4, 4),
                100,
                Color.White,
                1.35
            );

            dust.noGravity = true;
        }
    }

}