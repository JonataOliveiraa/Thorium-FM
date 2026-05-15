import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { Effects } from '../../TL/Modules/Effects.js';

const { BuffID } = Terraria.ID
const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];

// Index dos dusts originais
const dustTypes = [59, 60, 61, 62, 6];

export class MagickStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
    }
    
    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 120;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.alpha = 0;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = -1;
        this.Projectile.scale = 1;
    }
    
    AI(proj) {
        const direction = proj.velocity.X > 0 ? 1 : -1;
        proj.direction = proj.spriteDirection = direction;

        proj.rotation += direction * 0.35;

        if (Rand.NextBool(2)) {
            for (const dustType of dustTypes) {
                const dustIndex = NewDust(
                    proj.position, proj.width, proj.height,
                    dustType,
                    proj.velocity.X * 0.2, proj.velocity.Y * 0.2,
                    50, Color.White, 1.35
                );
                if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                    Terraria.Main.dust[dustIndex].noGravity = true;
                }
            }
        }

        if (proj.timeLeft <= 20) {
            proj.alpha += 10;
            if (proj.alpha > 255) proj.alpha = 255;
        }
    }

    OnTileCollide(proj, hitDirection) {
        Effects.PlaySound(10, proj.Center.X, proj.Center.Y, 1, 0, 1);

        for (const dustType of dustTypes) {
            NewDust(
                proj.position, proj.width, proj.height,
                dustType,
                proj.velocity.X * 0.2, proj.velocity.Y * 0.2,
                100, Color.White, 1.25
            );
        }

        return true;
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(69, 120, false);
        npc.AddBuff(31, 90, false);
        npc.AddBuff(ModBuff.getTypeByName('StunnedBuff'), 30, false);
        npc.AddBuff(ModBuff.getTypeByName('CharmedBuff'), 180, false);
        npc.AddBuff(ModBuff.getTypeByName('ElementalDecayBuff'), 120, false);
        
        if (!npc.friendly) {
            Terraria.Main.player[proj.owner].Heal(1);
        }
    }
}