import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewDustDirect = Terraria.Dust.NewDustDirect; 
const CanHitLine = Terraria.Collision['bool CanHitLine(ref Vector2 Position1, int Width1, int Height1, ref Vector2 Position2, int Width2, int Height2)'];

export class ConchShellPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.light = 0.25;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 60;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.alpha = 255;
    }

    AI(proj) {
        let vel = proj.velocity;
        if (proj.timeLeft > 50) {
            vel.Y += 1;
        } else {
            vel.Y -= 1;
        }
        if (vel.Y > 8) vel.Y = 8;
        if (vel.Y < -14) vel.Y = -14;
        proj.velocity = vel;

        for (let i = 0; i < 3; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height,
                33, 0, 0, 100, Color.White, 1.35
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
                176, 0, 0, 150, Color.White, 1.15
            );
            let dv = dust.velocity;
            dv.X *= 0.2;
            dv.Y *= 0.2;
            dust.velocity = dv;
            dust.noGravity = true;
        }
    }

    ModifyHitNPC(proj, npc, hit, modifiers) {
        const player = Main.player[proj.owner];
        if (npc.Center.Y < player.Center.Y) {
            Effects.PlaySound(Terraria.ID.SoundID.Item86, proj.position.X, proj.position.Y);
            modifiers.SourceDamage += 0.5;
        }
        if (!CanHitLine(player.position, player.width, player.height, npc.position, npc.width, npc.height)) {
            modifiers.SourceDamage *= 0.5;
        }
    }

    OnHitNPC(proj, npc, hit, damageDone) {
        npc.immune[proj.owner] = 10; 
    }
}