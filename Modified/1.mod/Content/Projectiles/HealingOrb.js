import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { HomingPro } from './HomingPro.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

let speedGain = 0;

export class HealingOrb extends HomingPro {
    constructor() {
        super();
    }

    get HomingOnPlayer() {
        return true;
    }
    
    get Speed() {
        return speedGain;
    }
    get Distance() {
        return 500;
    }
    
    get HealAmountMax() {
        return 4;
    }
    
    SetStaticDefaults() {
        this.AlphaColor = Color.new(255, 255, 175);
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 600;
        //this.Projectile.alpha = 255;
        this.Projectile.tileCollide = false;
    }
    
    Heal(proj, player) {
        const healAmount = this.HealAmountMax;
        PlaySound(Terraria.ID.SoundID.Item85, proj.position, 0, 1);
        player.Heal(healAmount);
        proj.penetrate--;
    }
    
    SafePreAI(proj) {
        speedGain = proj.ai.get_Item(0);
    }
    
    SafeAI(proj) {
        const ai = new ProjAI(proj);
        if (ai[0] < 7.5) {
            ai[0] += 0.25;
        }
        const directionInt = proj.velocity.X > 0 ? 1 : -1;
        proj.rotation += directionInt * (speedGain / 20);
        proj.spriteDirection = -directionInt;
    }
    
    GetAlpha(proj, color) {
        return Color.Multiply(Color.Multiply(this.AlphaColor, 0.75), proj.Opacity);
    }
}

export class HealingOrbYellow extends HealingOrb {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    get LightColor() {
        return { R: 0.3, G: 0.15, B: 0.1 };
    }
}

export class HealingOrbTeal extends HealingOrb {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    get LightColor() {
        return { R: 0.1, G: 0.35, B: 0.25 };
    }
}