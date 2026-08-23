import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class TorpedoPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 2;
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 10;
        this.Projectile.aiStyle = 1;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.AIType = 14;
    }
    
    AI(proj) {
        let index = Terraria.Dust.NewDust(Vector2.Subtract(proj.position, Vector2.Multiply(proj.velocity, 0.5)), proj.width, proj.height, 31, 0.0, 0.0, 100, null, 1.0);
        const dust = Terraria.Main.dust[index];
        dust.scale *= 1.25 + Rand.Next(10) * 0.10000000149011612;
        dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
        dust.noGravity = true;
        
        proj.frameCounter++;
        if (proj.frameCounter > 3) {
            proj.frameCounter = 0;
            proj.frame++;
        }
        if (proj.frame >= Terraria.Main.projFrames[this.Type]) {
            proj.frame = 0;
        }
    }
    
    OnKill(proj, timeLeft) {
        PlaySound(Terraria.ID.SoundID.Item14, proj.position, 0, 1);
        if (Terraria.Main.myPlayer !== proj.owner) return;
        NewProjectile(proj.GetProjectileSource_FromThis(), proj.Center, Vector2.Multiply(proj.velocity, 0.05), ModProjectile.getTypeByName('TorpedoPro2'), (proj.damage * 0.5) | 0, 2, proj.owner, 0, 0, 0, null);
    }
}


export class TorpedoPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 4;
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 80;
        this.Projectile.aiStyle = 1;
        this.Projectile.light = 0.25;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 18;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.AIType = 14;
    }
    
    AI(proj) {
        proj.frameCounter++;
        if (proj.frameCounter > 4) {
            proj.frameCounter = 0;
            proj.frame++;
        }
        if (proj.frame >= Terraria.Main.projFrames[this.Type]) {
            proj.frame = 0;
        }
    }
    
    OnKill(proj, timeLeft) {
        const dustArr = Terraria.Main.dust;
        for (let index1 = 0; index1 < 20; index1++) {
            const index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 6, proj.velocity.X * 16.0 + Rand.Next(-6, 6), proj.velocity.Y * 16.0 + Rand.Next(-6, 6), 0, null, 1.25);
            dustArr[index2].noGravity = true;
        }
    }
}