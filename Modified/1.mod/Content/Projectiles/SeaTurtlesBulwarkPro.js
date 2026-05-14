import { ModProjectile } from "../../TL/ModProjectile.js";
import { Terraria } from "../../TL/ModImports.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";
import { Color } from "../../TL/Modules/Color.js";
import { ProjAI } from "../../TL/ProjAI.js";
import { Effects } from "../../TL/Modules/Effects.js";

const Main = Terraria.Main;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class SeaTurtlesBulwarkPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 4;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;
        this.Projectile.alpha = 25;
        this.Projectile.ignoreWater = true;
    }

    SpawnHitDust(proj) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;

            const d1 = NewDust(proj.position, proj.width, proj.height, 89, 0, 0, 0, Color.Transparent, 1.8);
            if (d1 >= 0 && d1 < Main.dust.length) {
                const dust = Main.dust[d1];
                dust.velocity = Vector2.new(Math.cos(angle) * speed, Math.sin(angle) * speed);
                dust.noGravity = true;
                dust.fadeIn = 1.5;
            }

            const d2 = NewDust(proj.position, proj.width, proj.height, 61, 0, 0, 0, Color.Transparent, 1.2);
            if (d2 >= 0 && d2 < Main.dust.length) {
                const dust = Main.dust[d2];
                dust.velocity = Vector2.new(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6
                );
            }
        }

        Effects.AddLight(proj.Center, 0.0, 1.0, 0.3);
    }

    AI(proj) {
        proj.frameCounter++;
        if (proj.frameCounter >= 4) {
            proj.frameCounter = 0;
            proj.frame++;
            if (proj.frame >= 4) {
                proj.frame = 0;
            }
        }

        const player = Main.player[proj.owner];

        if (player.dead || !player.active) {
            proj.Kill();
            return;
        }

        const ai = new ProjAI(proj);
        ai[0]++;

        Effects.AddLight(proj.Center, 0.0, 0.5, 0.2);

        if (ai[0] >= 30) {
            const dist = Vector2.Distance(proj.Center, player.Center);

            if (dist < 400) {
                const speed = 5;
                const inertia = 30;
                let targetDiff = Vector2.Subtract(player.Center, proj.Center);
                targetDiff['void Normalize()']();
                targetDiff = Vector2.Multiply(targetDiff, speed);
                proj.velocity = Vector2.Divide(
                    Vector2.Add(Vector2.Multiply(proj.velocity, inertia - 1), targetDiff),
                    inertia
                );
            } else {
                proj.velocity = Vector2.Zero;
            }

            if (dist < 30) {
                const healAmount = Math.floor(ai[2]);
                if (healAmount > 0) player.Heal(healAmount);
                this.SpawnHitDust(proj);
                Effects.PlaySound(Terraria.ID.SoundID.Item25, proj.Center.X, proj.Center.Y, 1, 0.15, 0.9);
                proj.Kill();
            }
        }
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 5; i++) {
            const d = NewDust(proj.position, proj.width, proj.height, 89,
                (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6,
                0, Color.Transparent, 1.0
            );
            if (d >= 0 && d < Main.dust.length) {
                Main.dust[d].noGravity = true;
            }
        }
    }
}