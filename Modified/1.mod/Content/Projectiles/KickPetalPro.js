import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { ThoriumPlayer } from './../Global/ThoriumPlayer.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const ORBIT_RADIUS = 60;
const ORBIT_SPEED = 0.035;

const PULSE_STEP = 0.04;
const PULSE_MAX = 0.4;

const ALPHA_IDLE = 0.2;
const ALPHA_ARMED = 0.75;

const ROT = 0;
const PULSE = 1;
const PULSE_DIR = 2;

const INDEX = 0;
const ARMED = 1;

export class KickPetalPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.aiStyle = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 1600;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 5;
    }

    OnSpawn(proj) {
        const local = new ProjAI(proj, true);
        local[ROT] = 0;
        local[PULSE] = 0;
        local[PULSE_DIR] = 0;
    }

    GetAlpha(proj, lightColor) {
        const ai = new ProjAI(proj);
        const local = new ProjAI(proj, true);
        const base = ai[ARMED] === 0 ? ALPHA_IDLE : ALPHA_ARMED;

        return Color.Multiply(Color.White, base + local[PULSE] * 0.5);
    }

    _pulse(local) {
        if (local[PULSE_DIR] === 0) {
            local[PULSE] += PULSE_STEP;
            if (local[PULSE] >= PULSE_MAX) local[PULSE_DIR] = 1;
            return;
        }

        local[PULSE] -= PULSE_STEP;
        if (local[PULSE] <= 0) local[PULSE_DIR] = 0;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead || !ThoriumPlayer.accKickPedal) {
            proj.Kill();
            return;
        }

        proj.timeLeft = 2;

        const ai = new ProjAI(proj);
        const local = new ProjAI(proj, true);

        local[ROT] += ORBIT_SPEED;
        this._pulse(local);

        const owned = player.ownedProjectileCounts[proj.type] || 1;
        const angle = local[ROT] + ai[INDEX] * Math.PI * 2 / owned;
        const center = player.Center;

        proj.Center = Vector2.new(
            center.X - Math.sin(angle) * ORBIT_RADIUS,
            center.Y + Math.cos(angle) * ORBIT_RADIUS
        );
        proj.gfxOffY = player.gfxOffY;
        proj.rotation -= ORBIT_SPEED;
        proj.scale = 1 + local[PULSE] * 0.25;

        proj.friendly = ai[ARMED] !== 0;
    }
}
