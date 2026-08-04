import { Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

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

export class CorpseWeedPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 100;
        this.Projectile.hostile = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.scale = 0.25;
    }

    AI(proj) {
        proj.velocity = Vector2.Multiply(proj.velocity, DRAG);
        proj.rotation += SPIN;

        if (proj.timeLeft <= FADE_OUT_TIME) {
            proj.alpha = Math.min(255, proj.alpha + FADE_OUT_SPEED);
        }

        const ai = new ProjAI(proj, false);
        if (++ai[0] <= GROW_RATE || proj.scale >= MAX_SCALE) return;

        const cx = proj.position.X + proj.width / 2;
        const cy = proj.position.Y + proj.height / 2;
        proj.width += SIZE_STEP;
        proj.height += SIZE_STEP;
        proj.scale += GROW_STEP;
        proj.position = Vector2.new(cx - proj.width / 2, cy - proj.height / 2);
        ai[0] = 0;
    }

    OnHitPlayer(proj, target, info) {
        target.AddBuff(BUFF_POISONED, 300, false);
    }
}
