import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Color, Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class EelSpark extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 3;
        this.AlphaColor = Color.new(191.25, 191.25, 191.25, 191.25);
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 30;
        this.fadeOutTime = 20;
        this.fadeOutSpeed = 10;
    }
    
    GetAlpha(proj, lightColor) {
        return this.AlphaColor;
    }
    
    OnHitNPC(proj, npc) {
        npc.AddBuff(ModBuff.getTypeByName('PetrifyBuff'), 60, false);
        const dustArr = Terraria.Main.dust;
        for (let i = 0; i < 15; i++) {
            const index2 = Terraria.Dust.NewDust(Vector2.Subtract(proj.position, Vector2.Multiply(proj.velocity, 0.5)), npc.width, npc.height, 57, 0.0, 0.0, 175, null, 1.25);
            const dust = dustArr[index2];
            dust.noGravity = true;
            const num1 = Rand.Next(-50, 51), num2 = Rand.Next(-50, 51);
            dust.position = Vector2.new(dust.position.X + num1, dust.position.Y + num2);
            dust.velocity = Vector2.new(-(num1 * 0.079999998211860657), -(num2 * 0.079999998211860657));
        }
    }
    
    AI(proj) {
        let index = Terraria.Dust.NewDust(Vector2.Subtract(proj.position, Vector2.Multiply(proj.velocity, 0.5)), proj.width, proj.height, 57, 0.0, 0.0, 175, null, 1.0);
        const dust = Terraria.Main.dust[index];
        dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
        dust.noGravity = true;
        
        proj.frameCounter++;
        if (proj.frameCounter > 1) {
            proj.frameCounter = 0;
            proj.frame++;
        }
        if (proj.frame >= Terraria.Main.projFrames[this.Type]) {
            proj.frame = 0;
        }
    }
    
    OnKill(proj, timeLeft) {
        for (let i = 0; i < 5; i++) {
            let j = Terraria.Dust.NewDust(Vector2.Subtract(proj.position, Vector2.Multiply(proj.velocity, 0.5)), proj.width, proj.height, 57, Rand.Next(-4, 4), Rand.Next(-4, 4), 175, null, 1.0);
            Terraria.Main.dust[j].noGravity = true;
        }
    }
}