import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const NewDustDirect = Terraria.Dust.NewDustDirect; 
export class SeashellCastanetsProj extends ModProjectile {
    constructor() {
        super();
        this.Texture = null; // invisível
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.light = 0.2;
        this.Projectile.penetrate = 1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
        this.Projectile.timeLeft = 180;
        this.Projectile.alpha = 255;
    }

    AI(proj) {
        const vel = proj.velocity;
        vel.Y += 0.1;
        proj.velocity = vel;

        let ai = new ProjAI(proj, false)

        for (let i = 0; i < 4; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height,
                176, 0, 0, 100, Color.White, 1.25 + ai[1] * 0.25
            );
            let dv = dust.velocity;
            dv.X *= 0.2;
            dv.Y *= 0.2;
            dust.velocity = dv;
            dust.noGravity = true;
        }
        for (let i = 0; i < 2; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height,
                29, 0, 0, 100, Color.White, 1
            );
            let dv = dust.velocity;
            dv.X *= 0.2;
            dv.Y *= 0.2;
            dust.velocity = dv;
            dust.noGravity = true;
        }
    }

    OnKill(proj) {
        Effects.PlaySound(Terraria.ID.SoundID.Item87, proj.Center.X, proj.Center.Y, 1, 0, 1.3);
        for (let i = 0; i < 8; i++) {
            NewDustDirect(proj.position, proj.width, proj.height, 176,
                proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1.25).noGravity = true;
        }
        for (let i = 0; i < 4; i++) {
            NewDustDirect(proj.position, proj.width, proj.height, 29,
                proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1).noGravity = true;
        }
    }
}