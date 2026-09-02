import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const FRAMES = 7;
const FRAME_DURATIONS = [12, 12, 12, 12, 12, 12, 48];

const DUST_BLOOD = 5;
const SPAWN_DUST_COUNT = 15;
const SPAWN_DUST_SPEED = 4;
const SPAWN_DUST_ALPHA = 125;
const SPAWN_DUST_SCALE = 1.65;

const BURST_DUST_COUNT = 15;
const PANIC_DUST_SPEED = 4;
const PANIC_DUST_ALPHA = 125;
const PANIC_DUST_SCALE = 1.35;
const CALM_DUST_SPEED = 3;
const CALM_DUST_ALPHA = 150;
const CALM_DUST_SCALE = 1.25;

const BURST_AT = 72;
const RANGE_SQ = 160000;
const SPRAY_SPEED = 5;

const PANIC_THRESHOLD = 5;
const PANIC_RATE = 2;
const PANIC_DECAY = 0.1;
const BASE_RATE = 1;

const HOVER_STEP = 15;
const HOVER_END = 90;

const PULSE_RATE = 1 / 400;
const PULSE_MAX = 0.15;
const PULSE_DRAW_BASE = 0.1;
const PULSE_DRAW_TINT = 0.25;

const MAX_PROJ = Main.maxProjectiles ?? 1000;

const _postPanic = new Float32Array(MAX_PROJ);
const _pulseAmount = new Float32Array(MAX_PROJ);
const _pulseShift = new Uint8Array(MAX_PROJ);
const _hoverDown = new Uint8Array(MAX_PROJ);
const _hoverAmount = new Int32Array(MAX_PROJ);

let _sprayType = -1;

export class BleedingHeartStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._origin = null;
        this._frames = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 36;
        this.Projectile.height = 38;
        this.Projectile.aiStyle = -1;
        this.Projectile.sentry = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.Projectile.netImportant = true;
    }

    OnSpawn(proj) {
        const slot = proj.whoAmI;
        _postPanic[slot] = BASE_RATE;
        _pulseAmount[slot] = 0;
        _pulseShift[slot] = 0;
        _hoverDown[slot] = 1;
        _hoverAmount[slot] = 0;
    }

    AI(proj) {
        const slot = proj.whoAmI;
        const ai = new ProjAI(proj, false);
        const local = new ProjAI(proj, true);

        if (local[0] === 0) {
            local[0] = 1;
            this.SpawnBurst(proj);
        }

        ai[0] = ai[0] + 1;
        this.Animate(proj, slot, ai);

        if (ai[0] === Math.floor(BURST_AT / _postPanic[slot])) {
            this.Splash(proj, slot);
            ai[0] = 0;
        }

        this.Hover(proj, slot);
        this.Pulse(slot);
    }

    SpawnBurst(proj) {
        for (let i = 0; i < SPAWN_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.Center, 0, 0, DUST_BLOOD,
                Rand.NextFloat(-SPAWN_DUST_SPEED, SPAWN_DUST_SPEED),
                Rand.NextFloat(-SPAWN_DUST_SPEED, SPAWN_DUST_SPEED),
                SPAWN_DUST_ALPHA, Color.Transparent, SPAWN_DUST_SCALE
            );
            if (dust) dust.noGravity = true;
        }
    }

    Animate(proj, slot, ai) {
        const rate = _postPanic[slot];
        let frame = proj.frame;
        let counter = proj.frameCounter + 1;

        if (counter > Math.floor(FRAME_DURATIONS[frame] / rate)) {
            frame++;
            counter = 0;
        }

        if (frame >= FRAMES) {
            frame = 0;
            ai[0] = 0;
            const decayed = rate > BASE_RATE ? rate - PANIC_DECAY : rate;
            _postPanic[slot] = decayed < BASE_RATE ? BASE_RATE : decayed;
        }

        proj.frame = frame;
        proj.frameCounter = counter;
    }

    Splash(proj, slot) {
        if (_sprayType === -1) _sprayType = ModProjectile.getTypeByName('BleedingHeartStaffPro2') ?? -2;

        const center = proj.Center;
        const npcs = Main.npc;
        const mine = Main.myPlayer === proj.owner;
        let hit = 0;

        const maxNPCs = Main.maxNPCs;

        for (let i = 0; i < maxNPCs; i++) {
            const npc = npcs[i];

            if (!npc || !npc.active) continue;
            if (!npc.CanBeChasedBy(null, false)) continue;
            if (npc.friendly || npc.CountsAsACritter) continue;
            if (npc.DistanceSQ(center) >= RANGE_SQ) continue;

            const npcCenter = npc.Center;
            if (!CanHit(center, 1, 1, npcCenter, 1, 1)) continue;

            hit++;
            if (!mine || _sprayType < 0) continue;

            let vx = npcCenter.X - center.X;
            let vy = npcCenter.Y - center.Y;
            const len = Math.sqrt(vx * vx + vy * vy);
            if (len > SPRAY_SPEED) {
                const scale = SPRAY_SPEED / len;
                vx *= scale;
                vy *= scale;
            }

            NewProjectile(
                null,
                center, Vector2.new(vx, vy),
                _sprayType, proj.damage, proj.knockBack, proj.owner, npc.whoAmI, 0, 0, null
            );
        }

        const panicking = hit >= PANIC_THRESHOLD;
        const speed = panicking ? PANIC_DUST_SPEED : CALM_DUST_SPEED;
        const alpha = panicking ? PANIC_DUST_ALPHA : CALM_DUST_ALPHA;
        const scale = panicking ? PANIC_DUST_SCALE : CALM_DUST_SCALE;

        for (let i = 0; i < BURST_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.position, (proj.width / 2) | 0, (proj.height / 2) | 0, DUST_BLOOD,
                Rand.NextFloat(-speed, speed), Rand.NextFloat(-speed, speed),
                alpha, Color.Transparent, scale
            );
            if (dust) dust.noGravity = true;
        }

        if (panicking) _postPanic[slot] = PANIC_RATE;
    }

    Hover(proj, slot) {
        const amount = _hoverAmount[slot] + 1;
        _hoverAmount[slot] = amount;

        if (amount % HOVER_STEP === 0) {
            const pos = proj.position;
            proj.position = Vector2.new(pos.X, pos.Y + (_hoverDown[slot] ? 1 : -1));
        }

        if (amount <= HOVER_END) return;

        _hoverDown[slot] = _hoverDown[slot] ? 0 : 1;
        _hoverAmount[slot] = 0;
    }

    Pulse(slot) {
        const step = PULSE_RATE * _postPanic[slot];

        if (!_pulseShift[slot]) {
            _pulseAmount[slot] += step;
            if (_pulseAmount[slot] < PULSE_MAX) return;
            _pulseShift[slot] = 1;
            return;
        }

        _pulseAmount[slot] -= step;
        if (_pulseAmount[slot] > 0) return;
        _pulseShift[slot] = 0;
    }

    PostDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return;

        if (!this._frames) {
            const frameHeight = (texture.Height / FRAMES) | 0;

            this._origin = Vector2.new(texture.Width * 0.5, (proj.height / 2) | 0);
            this._frames = [];
            for (let i = 0; i < FRAMES; i++) {
                this._frames.push(Rectangle.new(0, i * frameHeight, texture.Width, frameHeight));
            }
        }

        const source = this._frames[proj.frame] ?? this._frames[0];
        const center = proj.Center;
        const screen = Main.screenPosition;
        const tint = Color.Multiply(Color.Multiply(lightColor, PULSE_DRAW_TINT), proj.Opacity);
        const scale = proj.scale + PULSE_DRAW_BASE + _pulseAmount[proj.whoAmI];

        Main[ENTITY_DRAW](
            texture,
            Vector2.new(center.X - screen.X, center.Y - screen.Y + proj.gfxOffY),
            source, tint, proj.rotation, this._origin, scale, null, 0
        );
    }
}
