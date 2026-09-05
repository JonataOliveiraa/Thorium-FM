import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;

export class SteelDrumPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.forwardRotation = true;
        this.fadeInTime = 3;
        this.fadeOutTime = 20;
        this.fadeOutSpeed = 10;
    }

    SetDefaults() {
        this.Projectile.width = 40;
        this.Projectile.height = 40;
        this.Projectile.timeLeft = 45;
        this.Projectile.alpha = 100;
        this.Projectile.penetrate = -1;
        this.Projectile.friendly = true;
        this.Projectile.ignoreWater = true;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.Multiply(Color.White, 0.5), proj.Opacity);
    }
    
    AI(proj) {
        const ai = new ProjAI(proj);
        const localAI = new ProjAI(proj, true);
        const v = proj.velocity;
        if (ai[0] >= 2.0) {
            proj.velocity = Vector2.Multiply(v, 0.99);
        } else if (ai[0] > 0.0) {
            proj.velocity = Vector2.Multiply(v, 0.97);
        } else {
            proj.velocity = Vector2.Multiply(v, 0.95);
        }
        proj.spriteDirection = proj.direction;

        localAI[0]++;

        const randomDir = Vector2.Multiply(Vector2.new(Rand.NextFloat(-0.5, 0.5), Rand.NextFloat(-0.5, 0.5)), Vector2.new(20, 80));
        const rotatedOffset = Vector2.RotatedBy(randomDir, Vector2.ToRotation(proj.velocity), Vector2.Zero);
        const dust = Terraria.Dust.NewDustPerfect(Vector2.Add(proj.Center, rotatedOffset), 88, null, 127, Color.new(255, 255, 255, 0), 1.0);
        dust.fadeIn = 1.5;
        dust.scale = 1.3;
        dust.velocity = Vector2.Multiply(dust.velocity, 0.3);
        dust.noGravity = true;
        
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
        if (proj.timeLeft < 20) {
            proj.alpha += 10;
            if (proj.alpha > 255) proj.alpha = 255;
        }
    }

    OnKill(proj, timeLeft) {
        const dustColor = Color.new(255, 255, 255, 0);
        const num = Rand.Next(15, 25);
        for (let index = 0; index < num; index++) {
            const dust = Terraria.Dust.NewDustDirect(proj.Center, 0, 0, 88, proj.velocity.X * 0.25, proj.velocity.Y * 0.25, 100, dustColor, 1.3);
            dust.fadeIn = 1.2999999523162842 + Rand.NextFloat() * 0.20000000298023224;
            dust.noGravity = true;
            let pos = dust.position;
            pos = Vector2.Add(pos, Vector2.Multiply(dust.velocity, 4));
            dust.position = pos;
        }
    }
}
