import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { MiscHelper } from './../Global/Utils/MiscHelper.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const FRAMES = 4;
const CORRUPT_FRAME = 3;

const GRAVITY = 0.25;
const FALL_CAP = 12;
const DRAG = 0.985;
const BOUNCE_KEEP = 0.55;
const BOUNCE_CAP = 336;
const SPIN = 0.1;

const HIT_DUSTS = 8;
const SHADOWFLAME_TIME = 60;

const PALETTES = [
    { main: 90, sub: 87, mainScale: 1, subScale: 1 },
    { main: 88, sub: 87, mainScale: 1, subScale: 1 },
    { main: 90, sub: 88, mainScale: 1, subScale: 1 },
    { main: 65, sub: 173, mainScale: 1.5, subScale: 1 }
];

export class ThePillPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.tileCollide = false;
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        proj.frame = Math.max(0, Math.min(ai[1] | 0, FRAMES - 1));

        this.Bounce(proj);
        proj.rotation += proj.velocity.X * SPIN;
    }

    Bounce(proj) {
        const velocity = proj.velocity;
        let vx = velocity.X * DRAG;
        let vy = Math.min(velocity.Y + GRAVITY, FALL_CAP);

        const tileX = Math.floor(proj.Center.X / 16);
        const floorY = Math.floor((proj.position.Y + proj.height + vy) / 16);

        if (vy > 0 && MiscHelper.SolidOrSolidTopTileAt(tileX, floorY)) {
            proj.position = Vector2.new(proj.position.X, floorY * 16 - proj.height);
            vy = -Math.min(vy * BOUNCE_KEEP, BOUNCE_CAP);
        }

        const sideX = Math.floor((proj.Center.X + vx) / 16);
        const midY = Math.floor(proj.Center.Y / 16);
        if (MiscHelper.SolidTileAt(sideX, midY)) vx = -vx * BOUNCE_KEEP;

        proj.velocity = Vector2.new(vx, vy);
    }

    OnHitNPC(proj, npc) {
        const palette = PALETTES[Math.max(0, Math.min(proj.frame, PALETTES.length - 1))];

        if (proj.frame === CORRUPT_FRAME) {
            npc.AddBuff(Terraria.ID.BuffID.ShadowFlame, SHADOWFLAME_TIME, false);
        }

        for (let i = 0; i < HIT_DUSTS; i++) {
            const main = Main.dust[NewDust(proj.position, proj.width, proj.height, palette.main, Rand.NextFloat(-3, 3), Rand.NextFloat(-3, 3), 0, Color.White, palette.mainScale)];
            if (main) { main.noGravity = true; main.noLight = true; }

            const sub = Main.dust[NewDust(proj.position, proj.width, proj.height, palette.sub, Rand.NextFloat(-3, 3), Rand.NextFloat(-3, 3), 0, Color.White, palette.subScale)];
            if (sub) { sub.noGravity = true; sub.noLight = true; }
        }
    }
}
