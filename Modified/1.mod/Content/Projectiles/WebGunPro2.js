import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color } = Modules;

export class WebGunPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 78;
        this.Projectile.height = 76;
        this.Projectile.aiStyle = 0;
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 70;
        this.Projectile.alpha = 50;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 30;
    }
    
        GetAlpha(proj, color) {
        return Color.Multiply(Color.new(255, 255, 255, 0), proj.Opacity);
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        ai[0]++;
        
        proj.rotation += 0.0075;
        proj.velocity.X = 0;
        proj.velocity.Y = 0;

        this.FadeInAndOut(proj, ai);
    }

    FadeInAndOut(proj, ai) {
        if (ai[0] <= 50) {
            proj.alpha -= 25;
            if (proj.alpha < 50) proj.alpha = 50;
            return;
        }

        if (proj.timeLeft <= 50) {
            proj.alpha += 5;
            if (proj.alpha > 255) proj.alpha = 255;
        }
    }

    ModifyHitNPC(proj, target, modifiers) {
        target['void AddBuff(int type, int time, bool quiet, bool foodHackApplied)'](
            Terraria.ID.BuffID.Webbed,
            90,
            false,
            false
        );
    }
}
