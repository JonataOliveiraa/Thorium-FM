import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class CoralPolearmPro3 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.forwardRotation = true;
    }
    
    SetStaticDefaults() {
        this.colorArray = [
            Color.new(255, 183, 220),
            Color.new(105, 255, 164),
            Color.new(111, 251, 255)
        ];
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 32;
        this.Projectile.melee = true;
        this.Projectile.aiStyle = 1;
        this.Projectile.scale = 1.0;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
        this.Projectile.alpha = 255;
        this.AIType = 14;
    }
    
    OnHitNPC(proj, npc) {
        npc.immune[proj.owner] = 12;
        if (Rand.Next(5) !== 0) return;
        //npc.AddBuff(ModBuff.getTypeByName('Gouge'), 30, false);
        npc.AddBuff(70, 30, false); // BuffID.Venom => mesmo efeito de Gouge
    }

    AI(proj) {
        proj.Opacity += 0.05;
    }
    
    OnKill(proj, timeLeft) {
        Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 294, proj.velocity.X * 0.75, proj.velocity.Y * 0.75, 0, this.colorArray[Rand.Next(this.colorArray.length)], 1.2);
    }
}

export class CoralPolearmPro2Dummy extends CoralPolearmPro3 {
    constructor() {
        super();
        this.Texture = 'Projectiles/CoralPolearmPro2';
    }
}