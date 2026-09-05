import { Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Main } = Terraria;

const FRAMES = 4;
const FADE_OUT_TIME = 30;
const FADE_OUT_SPEED = 5;

export class PrehistoricArachnidPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Terraria.ID.ProjectileID.Sets.MinionShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = 63;
        this.AIType = 379;
        this.Projectile.friendly = true;
        this.Projectile.summon = true;
        this.Projectile.timeLeft = 180;
        this.Projectile.penetrate = -1;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 20;
    }

    AI(proj) {
        if (proj.timeLeft > FADE_OUT_TIME) return;

        proj.alpha = Math.min(255, proj.alpha + FADE_OUT_SPEED);
    }

    OnTileCollide(proj, hitDirection) {
        return proj.timeLeft <= 0;
    }
}
