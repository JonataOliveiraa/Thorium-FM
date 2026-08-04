import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Vector2 } = Modules;

const GROW_RATE = 4;
const GROW_STEP = 0.125;
const SIZE_STEP = 4;
const MAX_SCALE = 1;
const DRAG = 0.98;
const SPIN = 0.1;
const FADE_OUT_TIME = 20;
const FADE_OUT_SPEED = 10;
const BUFF_POISONED = 20;

const SFX_SPAWN = ['NPCDeath9'];

export class WeedEaterPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 32;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 255;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 120;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 15;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        const localAI = new ProjAI(proj, true);

        if (localAI[0] === 0) {
            localAI[0] = 1;
            proj.alpha = 100;
            proj.scale = 0.25;
            proj.width = 8;
            proj.height = 8;
            SoundHelper.play(SFX_SPAWN, proj.Center.X, proj.Center.Y);
        }

        proj.velocity = Vector2.Multiply(proj.velocity, DRAG);
        proj.rotation += SPIN;

        if (proj.timeLeft <= FADE_OUT_TIME) {
            proj.alpha = Math.min(255, proj.alpha + FADE_OUT_SPEED);
        }

        if (++ai[0] <= GROW_RATE || proj.scale >= MAX_SCALE) return;

        const cx = proj.position.X + proj.width / 2;
        const cy = proj.position.Y + proj.height / 2;
        proj.width += SIZE_STEP;
        proj.height += SIZE_STEP;
        proj.scale += GROW_STEP;
        proj.position = Vector2.new(cx - proj.width / 2, cy - proj.height / 2);
        ai[0] = 0;
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(BUFF_POISONED, 180, false);
        proj.velocity = Vector2.Multiply(proj.velocity, 0.5);
    }
}
