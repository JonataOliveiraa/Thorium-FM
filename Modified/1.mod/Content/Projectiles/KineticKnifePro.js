import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Vector2 } = Modules;

export class KineticKnifePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 8;
        this.Projectile.aiStyle = 0;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = -1;
        this.Projectile.extraUpdates = 1;
        this.Projectile.tileCollide = true;
        this.AIType = 14;
    }
    
    OnHitNPC(proj, npc) {
        if (proj.velocity.X === 0 && proj.velocity.Y === 0) return;
        Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'
        ](Terraria.ID.SoundID.Item71, Terraria.Main.LocalPlayer.position, 0, 1);
    }
    
    OnTileCollide(proj, hitDirection) {
        proj.position = Vector2.Subtract(proj.position, proj.velocity);
        proj.velocity = Vector2.Zero;
        return false;
    }
    
    AI(proj) {
        const ai = new ProjAI(proj);
        
        const player = Terraria.Main.player[proj.owner];
        if (!player.channel && proj.timeLeft > 4) proj.timeLeft = 4;
        let homing = ai[0] <= 0;
        proj.AI_009_MagicMissiles();
        homing = proj.ai.val0 <= 0;
        ai[0] = homing ? 0 : 1;
        if (Terraria.Main.myPlayer === proj.owner) {
            let num = 2;
            if (player.statMana >= player.statManaMax2 - num) {
                player.manaRegenDelay = player.maxRegenDelay | 0;
                player.statMana = player.statManaMax2 - num;
            }
            ai[1]++;
            if (ai[1] > 20.0) {
                ai[1] = 0;
                if (player.CheckMana(num, true, false)) {
                    player.manaRegenDelay = player.maxRegenDelay | 0;
                } else {
                    proj.Kill();
                    return;
                }
            }
        }
        proj.rotation += 0.3 * proj.direction;
        for (let index1 = 0; index1 < 3; index1++) {
            let num1 = proj.velocity.X / 3.0 * index1;
            let num2 = proj.velocity.Y / 3.0 * index1;
            let index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 223, 0.0, 0.0, 0, null, 1.0);
            Terraria.Main.dust[index2].position = Vector2.new(proj.Center.X - num1, proj.Center.Y - num2);
            Terraria.Main.dust[index2].noGravity = true;
            let dust = Terraria.Main.dust[index2];
            dust.velocity = Vector2.Multiply(dust.velocity, 0.0);
        }
    }
}
