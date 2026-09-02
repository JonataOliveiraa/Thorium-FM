import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const FRAMES = 3;
const LIFETIME = 30;
const DRAG = 0.94;
const FADE_PER_TICK = 0.1;
const BASE_ALPHA = 0.75;

const SINGED_ON_HIT = 90;

const DUST_NOTE = 127;
const HIT_DUST_COUNT = 15;
const HIT_DUST_SCALE = 0.75;
const TILE_DUST_COUNT = 10;
const TILE_DUST_SCALE = 1.25;
const DUST_SPREAD = 4;

let _singedType = -1;

export class MixtapeNote extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 22;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = LIFETIME;
    }

    GetAlpha(proj, lightColor) {
        return Color.Multiply(Color.White, BASE_ALPHA * FADE_PER_TICK * proj.timeLeft);
    }

    AI(proj) {
        proj.rotation = 0;
        proj.velocity = Vector2.Multiply(proj.velocity, DRAG);
        proj.spriteDirection = proj.velocity.X > 0 ? -1 : 1;

        const frame = proj.ai.get_Item(0) | 0;
        proj.frame = frame < FRAMES ? frame : 0;
    }

    OnHitNPC(proj, npc) {
        if (_singedType === -1) _singedType = ModBuff.getTypeByName('SingedBuff') ?? -2;
        if (_singedType >= 0) npc.AddBuff(_singedType, SINGED_ON_HIT, false);

        this.Burst(npc.position, npc.width, npc.height, HIT_DUST_COUNT, HIT_DUST_SCALE);
    }

    OnTileCollide(proj, hitDirection) {
        this.Burst(proj.position, proj.width, proj.height, TILE_DUST_COUNT, TILE_DUST_SCALE);
        return true;
    }

    Burst(position, width, height, count, scale) {
        for (let i = 0; i < count; i++) {
            const dust = NewDustDirect(
                position, width, height, DUST_NOTE,
                Rand.Next(-DUST_SPREAD, DUST_SPREAD),
                Rand.Next(-DUST_SPREAD, DUST_SPREAD),
                0, Color.Transparent, scale
            );
            if (dust) dust.noGravity = true;
        }
    }
}
