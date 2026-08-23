import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class SpineBreaker1 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 40;
        this.Projectile.magic = true;
        this.Projectile.aiStyle = 1;
        this.Projectile.scale = 1.0;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 40;
        this.AIType = 14;
        this.fadeOutSpeed = 5;
    }
    
    OnHitNPC(proj, npc) {
        npc.immune[proj.owner] = 12;
        if (Rand.NextBool()) {
            npc.AddBuff(24, 60, false);
        }
    }

    AI(proj) {
        const player = Terraria.Main.player[proj.owner];
        if (Terraria.Main.myPlayer !== proj.owner) return;
        const ai = new ProjAI(proj);
        ai[1]++;
        if (ai[1] >= 0) {
            NewProjectile(proj.GetProjectileSource_FromThis(), proj.Center, Vector2.Multiply(proj.velocity, 0.01), ModProjectile.getTypeByName('SpineBreaker2'), proj.damage, 1.0, proj.owner, 0.0, 0.0, 0.0, null);
            ai[1] = -2;
        }
    }
    
    OnKill(proj, timeLeft) {
        if (Terraria.Main.myPlayer !== proj.owner) {
            return;
        }
        NewProjectile(proj.GetProjectileSource_FromThis(), proj.Center, Vector2.Multiply(proj.velocity, 0.01), ModProjectile.getTypeByName('SpineBreaker1Dummy'), proj.damage, 1.0, proj.owner, 0.0, 0.0, 0.0, null);
    }
}

export class SpineBreaker2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 20;
        this.Projectile.magic = true;
        this.Projectile.aiStyle = -1;
        this.Projectile.scale = 1.0;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 40;
        this.fadeOutSpeed = 5;
        this.forwardRotation = true;
    }
    
    OnHitNPC(proj, npc) {
        npc.immune[proj.owner] = 12;
        if (Rand.NextBool()) {
            npc.AddBuff(24, 60, false);
        }
    }
    
    PreAI(proj) {
        proj.alpha += this.fadeOutSpeed;
        if (proj.alpha > 255) proj.alpha = 255;
        return true;
    }

    AI(proj) {
        if (proj.alpha >= 170 || proj.alpha + 5 < 170) {
            return;
        }
        for (let i = 0; i < 3; i++) {
            Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 17, proj.velocity.X * 0.025, proj.velocity.Y * 0.025, 170, null, 1.2);
        }
        Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 55, 0, 0, 170, null, 1.1);
    }
}

export class SpineBreaker1Dummy extends SpineBreaker2 {
    constructor() {
        super();
        this.Texture = 'Projectiles/SpineBreaker1';
    }
    
    AI(proj) {
        super.AI(proj);
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
    }
}