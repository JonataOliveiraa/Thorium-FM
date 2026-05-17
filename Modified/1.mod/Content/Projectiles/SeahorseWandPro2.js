import { Modules, Terraria } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Effects, Vector2 } = Modules;

export class SeahorseWandPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.MinionShot[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 13;
        this.Projectile.height = 13;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.alpha = 100;
        this.Projectile.ignoreWater = true;
        this.Projectile.timeLeft = 180;
        this.Projectile.tileCollide = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 10;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        if (localAI[0] === 0) {
            Effects.PlaySound(19, proj.position.X, proj.position.Y);
            localAI[0] = 1;
        }
        proj.rotation = Vector2.ToRotation(proj.velocity) + Math.PI / 2;
    }

    OnKill(proj) {
        for (let i = 0; i < 5; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                33,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                0, Color.White, 1.0
            );
            if (dust) { dust.noGravity = true; dust.noLight = true; }
        }
    }
}