import { Terraria, Modules, Microsoft } from './../../../../TL/ModImports.js';
import { ModNPC } from './../../../../TL/ModNPC.js';
import { ModBuff } from './../../../../TL/ModBuff.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const EFFECT_DELAY = 180;
const EFFECT_COOLDOWN = 120;
const EFFECT_RANGE_SQUARED = 8100;
const RING_PARTICLE_COUNT = 50;
const RING_RADIUS = 10;
const RING_SPEED = 6;

// Pulso e' sempre o mesmo circulo; pre-calculado em JS puro.
const RING = (() => {
    const points = new Array(RING_PARTICLE_COUNT);
    for (let index = 0; index < RING_PARTICLE_COUNT; index++) {
        const angle = index * Math.PI * 2 / RING_PARTICLE_COUNT;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        points[index] = { x: cos * RING_RADIUS, y: sin * RING_RADIUS, vx: cos * RING_SPEED, vy: sin * RING_SPEED };
    }
    return points;
})();

let surgeType = -1;

function initializeBuffType() {
    if (surgeType >= 0) return;
    surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
}

export class EnergyConduit extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/GraniteEnergyStorm/' + this.constructor.name;
        this._effectTex = null;
        this._effectColor = null;
        this._effectOrigin = null;
        this._ringVelocities = null;
        this._texturesLoaded = false;
    }

    _loadTextures() {
        if (this._texturesLoaded) return;
        this._texturesLoaded = true;
        try { this._effectTex = tl.texture.load('Textures/NPCs/Boss/GraniteEnergyStorm/EnergyConduit_Effect.png'); } catch (_) { }
        if (!this._effectTex) return;
        // Alpha 0 na cor = blend aditivo no estilo do original.
        this._effectColor = Color.op_Multiply(Color.new(255, 255, 255, 0), 0.75);
        this._effectOrigin = Vector2.new(this._effectTex.Width / 2, this._effectTex.Height / 2);
    }

    _applyGraniteSurge(npc) {
        if (surgeType < 0) return;

        const player = Main.player[Main.myPlayer];
        if (!player || !player.active) return;
        if (Vector2.DistanceSquared(player.Center, npc.Center) >= EFFECT_RANGE_SQUARED) return;

        player.AddBuff(surgeType, 300, false);
    }

    _createPulseDust(npc) {
        const center = npc.Center;
        const centerX = center.X;
        const centerY = center.Y;
        const white = Color.White;

        if (!this._ringVelocities) this._ringVelocities = RING.map(point => Vector2.new(point.vx, point.vy));

        for (let index = 0; index < RING_PARTICLE_COUNT; index++) {
            const point = RING[index];
            const dustIndex = Effects.NewDust(center, 0, 0, 92, 0, 0, 75, white, 1.45);
            const dust = Main.dust[dustIndex];

            dust.noGravity = true;
            dust.position = Vector2.new(centerX + point.x, centerY + point.y);
            dust.velocity = this._ringVelocities[index];
        }
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 1;
    }

    SetDefaults() {
        this.NPC.aiStyle = -1;
        this.NPC.lifeMax = 100;
        this.NPC.damage = 10;
        this.NPC.defense = 10;
        this.NPC.knockBackResist = 0;
        this.NPC.width = 32;
        this.NPC.height = 32;
        this.NPC.lavaImmune = true;
        this.NPC.noGravity = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath3;
    }

    ApplyDifficultyAndPlayerScaling(npc) {
        npc.lifeMax = Math.floor(npc.lifeMax * 0.7);
    }

    PostDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();
        if (!this._effectTex) return;

        const center = npc.Center;

        spriteBatch[DRAW](
            this._effectTex,
            Vector2.new(center.X - 2 - screenPos.X, center.Y + 2 - screenPos.Y),
            null,
            this._effectColor,
            npc.rotation,
            this._effectOrigin,
            1,
            SpriteEffects.None,
            0
        );
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;
        const dead = npc.life <= 0;

        const count = dead ? 10 : Math.floor(damage / npc.lifeMax * 50);
        const spread = dead ? 4 : 2;
        const scale = dead ? 1.2 : 0.6;

        for (let index = 0; index < count; index++) Effects.NewDust(position, width, height, 37, Rand.Next(-spread, spread), Rand.Next(-spread, spread), 0, white, scale);
    }

    AI(npc) {
        initializeBuffType();

        npc.rotation += 0.05;
        npc.ai[2]++;

        if (npc.ai[2] < EFFECT_DELAY) return;

        this._applyGraniteSurge(npc);
        this._createPulseDust(npc);
        npc.ai[2] = EFFECT_COOLDOWN;
    }
}
