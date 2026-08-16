import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;

export class GraniteCharge extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Boss/GraniteEnergyStorm/' + this.constructor.name;
        this.AIType = 14;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 4;
    }

    SetDefaults() {
        this.Projectile.width = 38;
        this.Projectile.height = 38;
        this.Projectile.aiStyle = 1;
        this.Projectile.hostile = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
    }

    // Sempre desenhado em branco puro: senao o projetil some no escuro do granito.
    GetAlpha(proj, color) {
        return Color.White;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);

        if (localAI[0] === 0) {
            localAI[0] = 1;
            Effects.PlaySound(Terraria.ID.SoundID.Item94, proj.Center.X, proj.Center.Y);
        }

        // Rastro atras do projetil, nao em cima dele.
        const dustPos = Vector2.Subtract(proj.position, Vector2.Multiply(proj.velocity, 0.5));
        const dustIndex = Effects.NewDust(dustPos, proj.width, proj.height, 15, 0, 0, 255, Color.White, 1.25);
        const dust = Terraria.Main.dust[dustIndex];
        dust.velocity = Vector2.Multiply(dust.velocity, 0);
        dust.noGravity = true;

        proj.frameCounter++;
        if (proj.frameCounter <= 2) return;

        proj.frame = (proj.frame + 1) % 4;
        proj.frameCounter = 0;
    }

    OnKill(proj) {
        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, 15, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 255, Color.White, 1);
            Terraria.Main.dust[dustIndex].noGravity = true;
        }
    }
}
