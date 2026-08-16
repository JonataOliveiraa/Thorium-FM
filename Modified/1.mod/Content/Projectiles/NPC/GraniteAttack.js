import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const CAN_HIT = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const HOMING_DELAY = 30;
const HOMING_RANGE = 800;
const SPEED = 9;
const ACCELERATION = 0.2;
const SURGE_DURATION = 300;
const ROTATION_OFFSET = -Math.PI / 2;

let surgeType = -1;

export class GraniteAttack extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 1;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.scale = 1;
        this.Projectile.timeLeft = 180;
        this.Projectile.hostile = true;
        this.Projectile.tileCollide = true;
    }

    _createTrailDust(proj) {
        const center = proj.Center;
        const velocity = proj.velocity;
        const white = Color.White;

        for (let index = 0; index < 3; index++) {
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, 59, 0, 0, 0, white, 1.5);
            const dust = Main.dust[dustIndex];

            dust.position = Vector2.new(center.X - velocity.X / 3 * index, center.Y - velocity.Y / 3 * index);
            dust.velocity = Vector2.new(0, 0);
            dust.noGravity = true;
        }
    }

    // Alcance em distancia de Manhattan, como no original.
    _findTarget(proj) {
        const center = proj.Center;
        let target = null;
        let shortest = HOMING_RANGE;

        for (let index = 0; index < Main.maxPlayers; index++) {
            const player = Main.player[index];
            if (!player || !player.active || player.dead) continue;

            const playerCenter = player.Center;
            const distance = Math.abs(center.X - playerCenter.X) + Math.abs(center.Y - playerCenter.Y);
            if (distance >= shortest) continue;
            if (!CAN_HIT(proj.position, proj.width, proj.height, player.position, player.width, player.height)) continue;

            target = playerCenter;
            shortest = distance;
        }

        return target;
    }

    _accelerate(current, desired) {
        if (current < desired) return current < 0 && desired > 0 ? ACCELERATION * 3 : ACCELERATION;
        if (current > desired) return current > 0 && desired < 0 ? -ACCELERATION * 3 : -ACCELERATION;
        return 0;
    }

    PreAI(proj) {
        const ai = new ProjAI(proj, false);

        // ai[1] marca que o som de disparo ja' tocou.
        if (ai[1] !== 1) {
            ai[1] = 1;
            Effects.PlaySound(Terraria.ID.SoundID.Item42, proj.Center.X, proj.Center.Y);
        }

        this._createTrailDust(proj);

        // Voa reto nos primeiros 30 ticks; so' depois passa a perseguir.
        ai[0]++;
        let destination = null;
        if (ai[0] > HOMING_DELAY) {
            ai[0] = HOMING_DELAY;
            destination = this._findTarget(proj);
        }

        const center = proj.Center;
        const velocity = proj.velocity;

        if (!destination) {
            destination = Vector2.new(center.X + velocity.X * 100, center.Y + velocity.Y * 100);
        }

        const offsetX = destination.X - center.X;
        const offsetY = destination.Y - center.Y;
        const length = Math.sqrt(offsetX * offsetX + offsetY * offsetY) || 1;
        const scale = SPEED / length;

        velocity.X += this._accelerate(velocity.X, offsetX * scale);
        velocity.Y += this._accelerate(velocity.Y, offsetY * scale);
        proj.velocity = velocity;

        // A ponta acompanha a direcao do voo.
        proj.rotation = Math.atan2(velocity.Y, velocity.X) + ROTATION_OFFSET;

        return false;
    }

    OnHitPlayer(proj, player) {
        if (Main.expertMode && Modules.Rand.Next(0, 3) === 0) {
            if (surgeType < 0) surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
            if (surgeType >= 0) player.AddBuff(surgeType, SURGE_DURATION, false);
        }
        proj.Kill();
    }

    OnKill(proj) {
        const position = Vector2.new(proj.position.X, proj.position.Y + 2);
        const width = proj.width + 8;
        const height = proj.height + 8;
        const velocity = proj.velocity;
        const white = Color.White;

        for (let index = 0; index < 15; index++) {
            const dustIndex = Effects.NewDust(position, width, height, 15, velocity.X * 0.2, velocity.Y * 0.2, 100, white, 1);
            Main.dust[dustIndex].noGravity = true;
        }

        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(position, width, height, 29, velocity.X * 0.2, velocity.Y * 0.2, 100, white, 1);
            Main.dust[dustIndex].noGravity = true;
        }
    }
}
