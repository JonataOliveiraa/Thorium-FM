import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;

const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class NaiadShivPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 22;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 3;
        this.Projectile.timeLeft = 300;
    }
    
    AI(proj) {
        const v = proj.velocity;
        proj.rotation = Vector2.ToRotation(v) + 0.785;
        v.Y += 0.1;
        proj.velocity = v;
    }
    
    OnTileCollide(proj, hitDirection) {
        PlaySound(Terraria.ID.SoundID.Item10, proj.Center, 0, 1);
        for (let i = 0; i < 12; i++) {
            let index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 29, Rand.Next(-8, 8), Rand.Next(-8, 8), 50, null, 1.75);
            Terraria.Main.dust[index2].noGravity = true;
        }
        return true;
    }
}