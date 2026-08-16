import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const DUST_TYPE = 56;
const LIFETIME = 90;
const MUZZLE_TICK = 88;
const TRAIL_DUST = 4;
const SURGE_DURATION = 180;
const MUZZLE_COUNT = 20;
const MUZZLE_WIDTH = 4;
const MUZZLE_HEIGHT = 10;

// Elipse do clarao de saida. O original monta cada ponto com RotatedBy nativo; a
// forma nunca muda, so' a rotacao final, entao a base vem pre-calculada em JS.
const MUZZLE_RING = (() => {
    const points = new Array(MUZZLE_COUNT);
    for (let index = 0; index < MUZZLE_COUNT; index++) {
        const angle = index * Math.PI * 2 / MUZZLE_COUNT;
        points[index] = { x: Math.sin(angle) * MUZZLE_WIDTH, y: -Math.cos(angle) * MUZZLE_HEIGHT };
    }
    return points;
})();

let surgeType = -1;

function initializeBuffType() {
    if (surgeType >= 0) return;
    surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
}

export class BoulderProbeStaffProLaser extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 4;
        this.Projectile.height = 4;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.extraUpdates = 10;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 60;
    }

    _createTrailDust(proj) {
        const center = proj.Center;
        const velocity = proj.velocity;
        const white = Color.White;

        for (let index = 0; index < TRAIL_DUST; index++) {
            const position = Vector2.new(center.X - velocity.X * index * 0.25, center.Y - velocity.Y * index * 0.25);
            const dustIndex = Effects.NewDust(position, 2, 2, DUST_TYPE, 0, 0, 100, white, 1.25);
            const dust = Main.dust[dustIndex];

            dust.position = position;
            dust.velocity = Vector2.new(0, 0);
            dust.noGravity = true;
        }
    }

    _createMuzzleFlash(proj) {
        const center = proj.Center;
        const centerX = center.X;
        const centerY = center.Y;
        const velocity = proj.velocity;
        const white = Color.White;

        const angle = Math.atan2(velocity.Y, velocity.X);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        for (let index = 0; index < MUZZLE_COUNT; index++) {
            const point = MUZZLE_RING[index];
            const offsetX = point.x * cos - point.y * sin;
            const offsetY = point.x * sin + point.y * cos;
            const length = Math.sqrt(offsetX * offsetX + offsetY * offsetY) || 1;

            const dustIndex = Effects.NewDust(center, 0, 0, DUST_TYPE, 0, 0, 100, white, 1.25);
            const dust = Main.dust[dustIndex];

            dust.noGravity = true;
            dust.position = Vector2.new(centerX + offsetX, centerY + offsetY);
            dust.velocity = Vector2.new(offsetX / length, offsetY / length);
        }
    }

    AI(proj) {
        if (proj.timeLeft < MUZZLE_TICK) {
            this._createTrailDust(proj);
            return;
        }

        if (proj.timeLeft === MUZZLE_TICK) this._createMuzzleFlash(proj);
    }

    OnHitNPC(proj, npc) {
        initializeBuffType();

        Effects.PlaySound(Terraria.ID.SoundID.Item15, npc.position.X, npc.position.Y);
        if (surgeType >= 0) npc.AddBuff(surgeType, SURGE_DURATION, false);
    }

    OnTileCollide(proj) {
        const center = proj.Center;
        const velocity = proj.velocity;
        const white = Color.White;

        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(center, proj.width, proj.height, DUST_TYPE, velocity.X * 0.25, velocity.Y * 0.25, 100, white, 1.5);
            Main.dust[dustIndex].noGravity = true;
        }

        return true;
    }
}
