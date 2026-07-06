import { ModProjectile } from "../../TL/ModProjectile.js";
import { Terraria } from "../../TL/ModImports.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";
import { Color } from "../../TL/Modules/Color.js";
import { ProjAI } from "../../TL/ProjAI.js";
import { Effects } from "../../TL/Modules/Effects.js";
import { ThoriumPlayer } from "../Global/ThoriumPlayer.js";

const Main = Terraria.Main;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const _drawPos = Vector2.new(0, 0);
const _drawOrigin = Vector2.new(0, 0);
const _glowColor = Color.new(255, 255, 255, 255);

export class FabergeEggPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.lightBlue = Color.new(135, 206, 235, 255);;
        this.eggEffect = null;
    }

    SetDefaults() {
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 600;
        this.Projectile.alpha = 25;
        this.Projectile.ignoreWater = true;
    }

    SpawnPickupDust(proj) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2.5 + Math.random() * 3;

            const d1 = NewDust(proj.position, proj.width, proj.height, 29, 0, 0, 0, this.lightBlue , 1.0);
            if (d1 >= 0 && d1 < Main.dust.length) {
                const dust = Main.dust[d1];
                dust.velocity = Vector2.new(Math.cos(angle) * speed, Math.sin(angle) * speed);
                dust.noGravity = true;
                dust.fadeIn = 1.3;
            }
        }

        Effects.AddLight(proj.Center, 0.6, 0.45, 0.0);
    }

    AI(proj) {
        const player = Main.player[proj.owner];

        if (player.dead || !player.active) {
            proj.Kill();
            return;
        }

        const ai = new ProjAI(proj);
        ai[0]++;

        Effects.AddLight(proj.Center, 0.5, 0.4, 0.05);

        if (ai[0] >= 30) {
            const dist = Vector2.Distance(proj.Center, player.Center);

            if (dist < 100) {
                const speed = 4;
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

            if (dist < 26) {
                ThoriumPlayer.RegenFabergeEggRes(player);
                this.SpawnPickupDust(proj);
                Effects.PlaySound(Terraria.ID.SoundID.Item4, proj.Center.X, proj.Center.Y, 1, 0.2, 0.85);
                proj.Kill();
            }
        }
    }

    PreDraw(proj, lightColor) {
        if (this.eggEffect === null) {
            this.eggEffect = tl.texture.load('Textures/Projectiles/FabergeEggPro_Effect.png');
        }
        const ai = new ProjAI(proj, false);
        const pulse = (Math.sin(ai[0] * 0.12) + 1) * 0.5;
        const scale = 1.1 + pulse * 0.4;
        const alpha = 90 + Math.floor(pulse * 120);

        _drawPos.X = proj.Center.X - Main.screenPosition.X;
        _drawPos.Y = proj.Center.Y - Main.screenPosition.Y;
        _drawOrigin.X = this.eggEffect.Width / 2;
        _drawOrigin.Y = this.eggEffect.Height / 2;
        _glowColor.R = 255; _glowColor.G = 255; _glowColor.B = 255; _glowColor.A = alpha;

        Main.spriteBatch[
            "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
        ](this.eggEffect, _drawPos, null, _glowColor, 0, _drawOrigin, scale, null, 0);

        return true;
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 5; i++) {
            const d = NewDust(proj.position, proj.width, proj.height, 6,
                (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5,
                0, this.lightBlue, 1.0
            );
            if (d >= 0 && d < Main.dust.length) {
                Main.dust[d].noGravity = true;
            }
        }
    }
}