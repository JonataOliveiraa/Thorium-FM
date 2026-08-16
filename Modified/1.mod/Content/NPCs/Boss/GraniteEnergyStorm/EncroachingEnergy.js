import { Terraria, Modules } from './../../../../TL/ModImports.js';
import { ModNPC } from './../../../../TL/ModNPC.js';
import { ModBuff } from './../../../../TL/ModBuff.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const ACTIVATION_TIME = 60;
// O original usa distancia de Manhattan (|dx| + |dy| < 800), nao euclidiana.
const TARGET_RANGE = 800;
const SPEED = 5;
const ACCELERATION = 0.2;

let surgeType = -1;

function initializeBuffType() {
    if (surgeType >= 0) return;
    surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
}

export class EncroachingEnergy extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/GraniteEnergyStorm/' + this.constructor.name;
        this._white = null;
    }

    _createTrailDust(npc) {
        const dustIndex = Effects.NewDust(Vector2.Subtract(npc.position, Vector2.Multiply(npc.velocity, 0.5)), npc.width, npc.height, 15, 0, 0, 100, Color.White, 1);
        const dust = Main.dust[dustIndex];

        dust.velocity = Vector2.Multiply(dust.velocity, 0.5);
        dust.noGravity = true;
    }

    // Single player apenas: existe um jogador so', entao nao ha' varredura nem
    // escolha de "mais proximo" - basta checar o alcance.
    _findTarget(npc) {
        const player = Main.player[Main.myPlayer];
        if (!player || !player.active || player.dead) return null;

        const center = npc.Center;
        const playerCenter = player.Center;
        const distance = Math.abs(center.X - playerCenter.X) + Math.abs(center.Y - playerCenter.Y);

        return distance < TARGET_RANGE ? player : null;
    }

    _updateVelocity(npc, target) {
        const destination = target ? target.Center : Vector2.Add(npc.Center, Vector2.Multiply(npc.velocity, 100));
        const desiredVelocity = Vector2.Multiply(Vector2.SafeNormalize(Vector2.Subtract(destination, npc.Center), Vector2.Zero), SPEED);
        const velocity = npc.velocity;

        // O original acelera o dobro quando precisa inverter o sentido, o que deixa
        // a curva bem mais agressiva do que um lerp simetrico.
        velocity.X += this._accelerate(velocity.X, desiredVelocity.X);
        velocity.Y += this._accelerate(velocity.Y, desiredVelocity.Y);

        npc.velocity = velocity;
    }

    _accelerate(current, desired) {
        if (current < desired) return current < 0 && desired > 0 ? ACCELERATION * 3 : ACCELERATION;
        if (current > desired) return current > 0 && desired < 0 ? -ACCELERATION * 3 : -ACCELERATION;
        return 0;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 1;
    }

    SetDefaults() {
        this.NPC.lifeMax = 50;
        this.NPC.damage = 25;
        this.NPC.defense = 0;
        this.NPC.aiStyle = -1;
        this.NPC.knockBackResist = 1.25;
        this.NPC.width = 46;
        this.NPC.height = 46;
        this.NPC.noTileCollide = true;
        this.NPC.lavaImmune = true;
        this.NPC.noGravity = true;
        this.NPC.dontTakeDamage = true;
        this.NPC.chaseable = false;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit52;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath55;
    }

    ApplyDifficultyAndPlayerScaling(npc) {
        npc.lifeMax = Math.floor(npc.lifeMax * 0.7);
    }

    OnHitPlayer(npc, target) {
        if (!Main.expertMode) return;

        initializeBuffType();
        if (surgeType >= 0) target.AddBuff(surgeType, 180, false);
    }

    GetAlpha(npc, newColor) {
        if (!this._white) this._white = Color.White;

        const progress = npc.ai[0] / ACTIVATION_TIME;
        if (progress >= 1) return this._white;

        return Color.op_Multiply(this._white, progress);
    }

    AI(npc) {
        this._createTrailDust(npc);

        npc.ai[0]++;
        const active = npc.ai[0] > ACTIVATION_TIME;

        npc.chaseable = active;
        npc.dontTakeDamage = !active;

        const target = active ? this._findTarget(npc) : null;
        this._updateVelocity(npc, target);

        if (!active) return;

        // Trava em 60: o GetAlpha usa ai[0] como progresso do fade.
        npc.ai[0] = ACTIVATION_TIME;

        const velocity = npc.velocity;
        npc.spriteDirection = velocity.X > 0 ? 1 : -1;
        npc.rotation += npc.spriteDirection > 0 ? 0.15 : -0.15;
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;
        const dead = npc.life <= 0;

        const count = dead ? 15 : Math.floor(damage / npc.lifeMax * 50);
        const spread = dead ? 4 : 2;
        const scale = dead ? 1.25 : 0.75;

        for (let index = 0; index < count; index++) Effects.NewDust(position, width, height, 15, Rand.Next(-spread, spread), Rand.Next(-spread, spread), 255, white, scale);
    }
}
