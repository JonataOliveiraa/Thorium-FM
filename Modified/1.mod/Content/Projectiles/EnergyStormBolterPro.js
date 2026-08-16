import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const CAN_HIT = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

// Alcance em distancia de Manhattan (|dx| + |dy|), como no original.
const HOMING_RANGE = 800;
const SPEED = 1;
const ACCELERATION = 0.1;
const LOCK_TIME = 6;
const BURST_TICK = 5;
const SURGE_DURATION = 120;
const EXTRA_UPDATES = 18;
// O PreAI roda (1 + extraUpdates) vezes por tick do jogo, mas os NPCs so' se movem
// uma vez. Revalidar o alvo a cada ciclo evita 18 varreduras redundantes por tick.
const RETARGET_INTERVAL = EXTRA_UPDATES + 1;

const TARGET = 0;
const RETARGET_COUNTDOWN = 1;

let surgeType = -1;

function initializeBuffType() {
    if (surgeType >= 0) return;
    surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
}

export class EnergyStormBolterPro extends ModProjectile {
    constructor() {
        super();
        // Invisivel: o que o jogador ve e' o rastro de poeira.
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 900;
        this.Projectile.ranged = true;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
        this.Projectile.extraUpdates = EXTRA_UPDATES;
    }

    _createBurstDust(proj) {
        const center = proj.Center;
        const white = Color.White;

        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(center, 10, 10, 15, Rand.Next(-2, 2), Rand.Next(-2, 2), 255, white, 1);
            Main.dust[dustIndex].noGravity = true;
        }
    }

    _createTrailDust(proj) {
        const center = proj.Center;
        const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, 15, 0, 0, 255, Color.White, 1.25);
        const dust = Main.dust[dustIndex];

        dust.position = center;
        dust.velocity = Vector2.new(0, 0);
        dust.noGravity = true;
    }

    _scanForTarget(proj) {
        const center = proj.Center;
        const centerX = center.X;
        const centerY = center.Y;
        const position = proj.position;
        const width = proj.width;
        const height = proj.height;

        let target = -1;
        let shortestDistance = HOMING_RANGE;

        for (let index = 0; index < Main.maxNPCs; index++) {
            const npc = Main.npc[index];
            if (!npc || !npc.active || !npc.CanBeChasedBy(proj, false)) continue;

            const npcCenter = npc.Center;
            const distance = Math.abs(centerX - npcCenter.X) + Math.abs(centerY - npcCenter.Y);
            if (distance >= shortestDistance) continue;
            if (!CAN_HIT(position, width, height, npc.position, npc.width, npc.height)) continue;

            target = index;
            shortestDistance = distance;
        }

        return target;
    }

    _acquireTarget(proj, local) {
        if (local[RETARGET_COUNTDOWN] > 0) {
            local[RETARGET_COUNTDOWN]--;

            // Sem alvo neste ciclo: nao adianta revarrer a cada sub-update.
            if (local[TARGET] < 0) return null;

            const cached = Main.npc[local[TARGET]];
            if (cached && cached.active && cached.CanBeChasedBy(proj, false)) return cached.Center;
        }

        local[RETARGET_COUNTDOWN] = RETARGET_INTERVAL;
        local[TARGET] = this._scanForTarget(proj);
        if (local[TARGET] < 0) return null;

        return Main.npc[local[TARGET]].Center;
    }

    // Acelera o dobro quando precisa inverter o sentido, como no original.
    _accelerate(current, desired) {
        if (current < desired) return current < 0 && desired > 0 ? ACCELERATION * 3 : ACCELERATION;
        if (current > desired) return current > 0 && desired < 0 ? -ACCELERATION * 3 : -ACCELERATION;
        return 0;
    }

    _updateVelocity(proj, destination) {
        const center = proj.Center;
        const velocity = proj.velocity;
        const target = destination ?? Vector2.Add(center, Vector2.Multiply(velocity, 100));
        const desired = Vector2.Multiply(Vector2.SafeNormalize(Vector2.Subtract(target, center), Vector2.Zero), SPEED);

        velocity.X += this._accelerate(velocity.X, desired.X);
        velocity.Y += this._accelerate(velocity.Y, desired.Y);

        proj.velocity = velocity;
    }

    PreAI(proj) {
        const ai = new ProjAI(proj, false);
        let destination = null;

        if (ai[0] === BURST_TICK) this._createBurstDust(proj);

        ai[0]++;

        if (ai[0] > LOCK_TIME) {
            ai[0] = LOCK_TIME;
            destination = this._acquireTarget(proj, new ProjAI(proj, true));
            this._createTrailDust(proj);
        }

        this._updateVelocity(proj, destination);

        // Substitui a AI padrao por completo.
        return false;
    }

    OnHitNPC(proj, npc) {
        initializeBuffType();
        if (surgeType >= 0) npc.AddBuff(surgeType, SURGE_DURATION, false);
    }

    OnKill(proj) {
        const center = proj.Center;
        const white = Color.White;

        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(center, 10, 10, 15, Rand.Next(-2, 2), Rand.Next(-2, 2), 255, white, 1);
            Main.dust[dustIndex].noGravity = true;
        }
    }
}
