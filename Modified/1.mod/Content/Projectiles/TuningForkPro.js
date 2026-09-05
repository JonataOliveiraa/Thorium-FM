import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

// Mecânica de agarrar não implementada - transformado em projétil thrower comum
export class TuningForkPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 3;
        this.Projectile.alpha = 255;
    }
    
    AI(proj) {
        proj.alpha -= 25;
        if (proj.alpha < 0) proj.alpha = 0;
        
        const v = proj.velocity;
        proj.rotation = Vector2.ToRotation(v) + 1.57;
        v.Y += 0.05;
        proj.velocity = v;
    }
    
    OnHitNPC(proj, npc) {
        // Debuff Tuned - faz o NPC receber mais dano (não implementado)
        NewProjectile(proj.GetProjectileSource_OnHit(npc, 0), npc.Center, Vector2.Zero, ModProjectile.getTypeByName('BongoEffect'), 0, 0, proj.owner, 0, 0, 0, null);
    }
    
    OnKill(proj, timeLeft) {
        PlaySound(Terraria.ID.SoundID.Item10, proj.Center, 0, 1);
        for (let i = 0; i < 14; i++) {
            let index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 57, Rand.Next(-8, 8), Rand.Next(-8, 8), 50, null, 1.75);
            Terraria.Main.dust[index2].noGravity = true;
        }
    }
}