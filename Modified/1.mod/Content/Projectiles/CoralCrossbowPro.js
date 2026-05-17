import { Rand } from '../../TL/Modules/Rand.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModProjectile as ModProj } from './../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class CoralCrossbowPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
    }

    SetDefaults() {
        this.Projectile.width = 9;
        this.Projectile.height = 18;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.alpha = 0;
        this.Projectile.aiStyle = 1;
        this.Projectile.timeLeft = 240;
    }

    AI(proj) {
        proj.rotation = Vector2.ToRotation(proj.velocity) + Math.PI / 2;
    }

    OnHitNPC(proj, npc) {
        const pro2Type = ModProj.getTypeByName('CoralCrossbowPro2');
        const source = proj.GetProjectileSource_FromThis();
        const speed = 6;
        const angles = [-Math.PI / 4, 0, Math.PI / 4];

        for (const angle of angles) {
            const vel = Vector2.new(
                Math.sin(angle) * speed,
                Math.cos(angle) * speed
            );

            const idx = NewProjectile(source, proj.Center, vel, pro2Type,
                proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null);

            if (idx >= 0 && idx < 1000) {
                const spawnedProj = Terraria.Main.projectile[idx];
                const ai = new ProjAI(spawnedProj, false);
                ai[0] = 10;
            }
        }
    }

    OnKill(proj, timeLeft) {
        CoralCrossbowPro.CoralDust(proj)
    }

    static CoralDust(proj) {
        const types = [225, 280, 281, 282, 283, 294];
        for (let i = 0; i < 10; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                types[Math.floor(Math.random() * types.length)],
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                150,
                Color.White,
                0.8
            );
            if (!dust) continue;
            dust.noGravity = true;
            dust.fadeIn = 0.5;
            dust.noLight = true
        }
    }
}