import { Terraria, Modules, Microsoft } from './../../../../TL/ModImports.js';
import { ModNPC } from './../../../../TL/ModNPC.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const NEW_NPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const ORBIT_DISTANCE = 80;
const ORBIT_DISTANCE_OFFSET = 2;
const ORBIT_ANGLE = 0.785;
const ORBIT_SPEED = 0.05;
const ORBIT_SPEED_ENRAGED = 0.12;
const DESPAWN_TIME = 1300;
const FLASH_TIME = 1180;
const CHARGE_DAMAGE = 25;
const RING_COUNT = 50;
const RING_RADIUS = 10;
const RING_SPEED = 4;

// O anel de despawn e' sempre o mesmo circulo: pre-calcular em JS puro evita
// 50x (Vector2.new + RotatedBy + SafeNormalize + Multiply + Add) por explosao.
const RING = (() => {
    const points = new Array(RING_COUNT);
    for (let index = 0; index < RING_COUNT; index++) {
        const angle = index * Math.PI * 2 / RING_COUNT;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        points[index] = { x: cos * RING_RADIUS, y: sin * RING_RADIUS, vx: cos * RING_SPEED, vy: sin * RING_SPEED };
    }
    return points;
})();

// Estado por-NPC. A instancia de ModNPC e' unica por tipo (singleton no NPCLoader),
// entao guardar rot/distance em `this` faria os 8 orbes compartilharem o mesmo
// contador -> ele avancava 8x por tick. localAI e' por entidade.
const ROT = 0;
const DISTANCE = 1;
const DISTANCE_SHIFT = 2;
const FRAME = 3;

let typesReady = false;
let bossType = -1;
let encroachingType = -1;
let chargeType = -1;

function initializeTypes() {
    if (typesReady) return;

    typesReady = true;
    bossType = ModNPC.getTypeByName('GraniteEnergyStorm') ?? -1;
    encroachingType = ModNPC.getTypeByName('EncroachingEnergy') ?? -1;
    chargeType = ModProjectile.getTypeByName('GraniteCharge') ?? -1;
}

export class CoalescedEnergy extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/GraniteEnergyStorm/' + this.constructor.name;
        this._glowTex = null;
        this._glow2Tex = null;
        this._glowColor = null;
        this._glowOrigin = null;
        this._ringVelocities = null;
        this._texturesLoaded = false;
    }

    _loadTextures() {
        if (this._texturesLoaded) return;
        this._texturesLoaded = true;
        try { this._glowTex = tl.texture.load('Textures/NPCs/Boss/GraniteEnergyStorm/CoalescedEnergy_Glow.png'); } catch (_) { }
        try { this._glow2Tex = tl.texture.load('Textures/NPCs/Boss/GraniteEnergyStorm/CoalescedEnergy_Glow2.png'); } catch (_) { }
        // Cor e origem sao constantes: alocar por frame so' alimenta o GC.
        this._glowColor = Color.new(255, 255, 255, 150);
        this._glowOrigin = Vector2.new(27, 27);
    }

    _createDespawnDust(npc) {
        const center = npc.Center;
        const centerX = center.X;
        const centerY = center.Y;
        const white = Color.White;

        // As velocidades do anel nunca mudam - Vector2 e' struct, entao reusar o
        // mesmo handle e' seguro (a atribuicao copia o valor).
        if (!this._ringVelocities) this._ringVelocities = RING.map(point => Vector2.new(point.vx, point.vy));

        for (let index = 0; index < RING_COUNT; index++) {
            const point = RING[index];
            const dustIndex = Effects.NewDust(center, 0, 0, 15, 0, 0, 75, white, 1.25);
            const dust = Main.dust[dustIndex];

            dust.position = Vector2.new(centerX + point.x, centerY + point.y);
            dust.velocity = this._ringVelocities[index];
            dust.noGravity = true;
        }
    }

    _fireCharge(npc, player) {
        if (!Main.expertMode || !player || player.dead) return;

        const center = npc.Center;
        Effects.PlaySound(Terraria.ID.SoundID.Item94, center.X, center.Y);
        if (chargeType < 0) return;

        const origin = Vector2.new(center.X, center.Y - 30);
        const direction = Vector2.SafeNormalize(Vector2.Subtract(player.Center, origin), Vector2.UnitX);

        NEW_PROJECTILE(null, origin.X, origin.Y, direction.X * 16, direction.Y * 16, chargeType, CHARGE_DAMAGE, 0, Main.myPlayer, 0, 0, 0, null);
    }

    _updateOrbit(npc, boss) {
        npc.localAI[ROT] += boss.life < boss.lifeMax * 0.35 ? ORBIT_SPEED_ENRAGED : ORBIT_SPEED;

        const distance = ORBIT_DISTANCE + npc.localAI[DISTANCE] / ORBIT_DISTANCE_OFFSET;
        const angle = npc.localAI[ROT] + npc.ai[1] * ORBIT_ANGLE;

        npc.Center = Vector2.Add(boss.Center, Vector2.RotatedBy(Vector2.new(0, distance), angle));
        npc.rotation -= 0.01;

        npc.localAI[DISTANCE] += npc.localAI[DISTANCE_SHIFT] ? -1 : 1;
        if (npc.localAI[DISTANCE] > ORBIT_DISTANCE) npc.localAI[DISTANCE_SHIFT] = 1;
        if (npc.localAI[DISTANCE] <= 0) npc.localAI[DISTANCE_SHIFT] = 0;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 4;
    }

    SetDefaults() {
        this.NPC.lifeMax = 100;
        this.NPC.damage = 30;
        this.NPC.defense = 0;
        this.NPC.knockBackResist = 0;
        this.NPC.aiStyle = -1;
        this.NPC.width = 54;
        this.NPC.height = 54;
        this.NPC.lavaImmune = true;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath33;
    }

    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        const playerBalance = 1 + Math.max(0, numPlayers - 1) * 2 / 3;
        npc.lifeMax = Math.floor(npc.lifeMax * 0.7 * playerBalance * bossAdjustment);
    }

    FindFrame(npc, frameHeight) {
        const frameSpeed = npc.ai[2] > FLASH_TIME ? 3 : 6;

        npc.frameCounter++;
        if (npc.frameCounter > frameSpeed) {
            npc.localAI[FRAME] = (npc.localAI[FRAME] + 1) % 4;
            npc.frameCounter = 0;
        }

        const frame = npc.frame;
        frame.Y = Math.floor(npc.localAI[FRAME]) * frameHeight;
        npc.frame = frame;
    }

    PreDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();

        // Durante a carga final o orbe pisca entre os dois glows.
        const flashing = npc.ai[2] > FLASH_TIME && (npc.ai[2] % 5 === 0 || npc.ai[2] % 6 === 0 || npc.ai[2] % 7 === 0);
        const texture = flashing ? (this._glow2Tex ?? this._glowTex) : this._glowTex;
        if (!texture) return true;

        spriteBatch[DRAW](
            texture,
            Vector2.Subtract(npc.Center, screenPos),
            npc.frame,
            this._glowColor,
            npc.rotation,
            this._glowOrigin,
            1,
            SpriteEffects.None,
            0
        );

        return true;
    }

    CheckActive() {
        return false;
    }

    AI(npc) {
        initializeTypes();
        npc.TargetClosest(true);

        const player = Main.player[npc.target];
        const boss = Main.npc[Math.floor(npc.ai[0])];

        if (!boss || !boss.active || boss.type !== bossType) {
            npc.active = false;
            return;
        }

        Effects.AddLight(npc.Center, 0.25, 0.5, 0.75);
        this._updateOrbit(npc, boss);
        npc.ai[2]++;

        if (npc.ai[2] <= DESPAWN_TIME) return;

        this._createDespawnDust(npc);
        this._fireCharge(npc, player);
        npc.ai[2] = 0;
    }

    HitEffect(npc, hitDirection, damage) {
        // position/width/height sao interop: le uma vez, nao a cada particula.
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        if (npc.life <= 0) {
            for (let index = 0; index < 15; index++) Effects.NewDust(position, width, height, 15, Rand.Next(-4, 4), Rand.Next(-4, 4), 255, white, 1);
            return;
        }

        const count = Math.floor(damage / npc.lifeMax * 50);
        for (let index = 0; index < count; index++) {
            Effects.NewDust(position, width, height, 15, Rand.Next(-2, 2), Rand.Next(-2, 2), 255, white, 0.75);
            Effects.NewDust(position, width, height, 37, Rand.Next(-3, 3), Rand.Next(-3, 3), 0, white, 1);
        }
    }

    OnKill(npc) {
        if (encroachingType < 0) encroachingType = ModNPC.getTypeByName('EncroachingEnergy') ?? -1;
        if (encroachingType < 0) return;

        NEW_NPC(null, npc.Center.X, npc.Center.Y, encroachingType, 0, 0, 0, 0, 0, 255);
    }
}
