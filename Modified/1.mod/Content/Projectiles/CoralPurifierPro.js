import { Color } from '../../TL/Modules/Color.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { CoralCrossbowPro } from './CoralCrossbowPro.js';

export class CoralPurifierPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 90;
        this.Projectile.frame = 0;
        this.Projectile.frameCounter = 0;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 4;
    }

    OnSpawn(proj) {
        proj.frame = Rand.Next(1, 5)
    }

    AI(proj) {
        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + 1.57;
    }

    OnHitNPC(proj, npc) {
        const player = Terraria.Main.player[proj.owner];
        if (Math.random() > 0.9) player.Heal(1);
    }

    OnKill(proj, timeLeft) {
        CoralCrossbowPro.CoralDust(proj)
    }
}