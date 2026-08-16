import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const ORBIT_RADIUS = 75;
const ORBIT_SPEED = 0.05;
// pi/6: os 12 orbes do EnergyProjector fecham a volta exatamente.
const ORBIT_ANGLE = 0.5235988;
const FRAME_COUNT = 4;
const FRAME_TIME = 3;
const SURGE_DURATION = 120;
// Original: 3. Com 12 orbes e extraUpdates = 1 isso dava 72 particulas por tick -
// poluia a tela inteira. Com 1, sao 24, e o rastro continua legivel.
const TRAIL_DUST = 1;

// A instancia de ModProjectile e' unica por tipo (singleton no ProjectileLoader),
// entao guardar `rot` em `this` faria os 12 orbes somarem no mesmo contador - e com
// extraUpdates = 1 isso viraria 24x a velocidade correta. localAI e' por projetil.
const ROT = 0;

let surgeType = -1;

function initializeBuffType() {
    if (surgeType >= 0) return;
    surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
}

export class GraniteBarrier extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._alpha = null;
        this._zero = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAME_COUNT;
    }

    SetDefaults() {
        this.Projectile.width = 12;
        this.Projectile.height = 12;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.extraUpdates = 1;
        this.Projectile.timeLeft = 3600;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 15;
    }

    // Alpha 0 na cor = blend aditivo, o orbe brilha por cima do cenario.
    GetAlpha(proj, color) {
        if (!this._alpha) this._alpha = Color.op_Multiply(Color.new(255, 255, 255, 0), 0.75);
        return this._alpha;
    }

    _createTrailDust(proj, center) {
        const velocity = proj.velocity;
        const position = proj.position;
        const width = proj.width;
        const height = proj.height;
        const white = Color.White;

        if (!this._zero) this._zero = Vector2.new(0, 0);

        for (let index = 0; index < TRAIL_DUST; index++) {
            const dustIndex = Effects.NewDust(position, width, height, 15, 0, 0, 200, white, 1);
            const dust = Main.dust[dustIndex];

            dust.position = Vector2.new(center.X - velocity.X / 3 * index, center.Y - velocity.Y / 3 * index);
            dust.velocity = this._zero;
            dust.noGravity = true;
        }
    }

    _animate(proj) {
        proj.frameCounter++;
        if (proj.frameCounter > FRAME_TIME) {
            proj.frame++;
            proj.frameCounter = 0;
        }

        if (proj.frame >= FRAME_COUNT) proj.frame = 0;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active) return;

        const local = new ProjAI(proj, true);
        const ai = new ProjAI(proj, false);

        local[ROT] += ORBIT_SPEED;

        const playerCenter = player.Center;
        const center = Vector2.Add(playerCenter, Vector2.RotatedBy(Vector2.new(0, ORBIT_RADIUS), local[ROT] + ai[0] * ORBIT_ANGLE));

        proj.Center = center;
        proj.gfxOffY = player.gfxOffY;

        this._createTrailDust(proj, center);

        // A velocidade nao move o orbe (a posicao e' imposta acima); serve so' para
        // o sprite virar para o lado de fora do jogador.
        const velocity = proj.velocity;
        velocity.X = center.X > playerCenter.X ? 1 : -1;
        proj.velocity = velocity;

        this._animate(proj);
    }

    OnHitNPC(proj, npc) {
        initializeBuffType();
        if (surgeType >= 0) npc.AddBuff(surgeType, SURGE_DURATION, false);
    }

    OnKill(proj) {
        const position = proj.position;
        const velocity = proj.velocity;
        const width = proj.width;
        const height = proj.height;
        const white = Color.White;

        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(position, width, height, 15, velocity.X * 0.25, velocity.Y * 0.25, 200, white, 1);
            Main.dust[dustIndex].noGravity = true;
        }
    }
}
