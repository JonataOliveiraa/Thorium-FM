import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class CoralPolearmPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.fadeOutTime = 30;
        this.fadeOutSpeed = 5;
        this.forwardRotation = true;
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 32;
        this.Projectile.melee = true;
        this.Projectile.aiStyle = 1;
        this.Projectile.scale = 1.0;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
        this.AIType = 14;
    }
    
    OnHitNPC(proj, npc) {
        npc.immune[proj.owner] = 12;
        if (Rand.Next(5) !== 0) return;
        //npc.AddBuff(ModBuff.getTypeByName('Gouge'), 30, false);
        npc.AddBuff(70, 30, false); // BuffID.Venom => mesmo efeito de Gouge
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        const localAI = new ProjAI(proj, true);
        if (localAI[0] === 0) {
            localAI[0] = 1.0;
            PlaySound(Terraria.ID.SoundID.Item101, proj.Center, 0, 1);
        }
        if (Terraria.Main.myPlayer !== proj.owner) return;
        ai[1]++;
        if (ai[1] < 0.0) return;
        NewProjectile(proj.GetProjectileSource_FromThis(), proj.Center, Vector2.Multiply(proj.velocity, 0.01), ModProjectile.getTypeByName('CoralPolearmPro3'), proj.damage, 1, proj.owner, 0, 0, 0, null);
        ai[1] -= 4;
    }
    
    OnKill(proj, timeLeft) {
        if (Terraria.Main.myPlayer !== proj.owner) return;
        NewProjectile(proj.GetProjectileSource_FromThis(), proj.Center, Vector2.Multiply(proj.velocity, 0.01), ModProjectile.getTypeByName('CoralPolearmPro2Dummy'), proj.damage, 1, proj.owner, 0, 0, 0, null);
    }
}