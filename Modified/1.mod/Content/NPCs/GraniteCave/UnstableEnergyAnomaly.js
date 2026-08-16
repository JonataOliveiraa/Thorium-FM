import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const NEW_NPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const COUNT_NPCS = Terraria.NPC['int CountNPCS(int Type)'];

const GRANITE_TILE = 368;
const FRAME_COUNT = 5;
const DEFEATED_KEY = 'Thorium:HasBeenDefeated_GraniteEnergyStorm';

// Estagios de instabilidade: quanto mais ferido, mais rapido anima e mais
// poeira solta. ai[1] guarda o estagio (0, 1, 2).
const STAGE_HEALTHY = 0.66;
const STAGE_UNSTABLE = 0.33;

let bossType = -1;

export class UnstableEnergyAnomaly extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/GraniteCave/' + this.constructor.name;
        this._glow = null;
        this._glowOrigin = null;
        this._glowColor = null;
        this._texturesLoaded = false;
    }

    _loadTextures() {
        if (this._texturesLoaded) return;
        this._texturesLoaded = true;
        try { this._glow = tl.texture.load('Textures/NPCs/GraniteCave/UnstableEnergyAnomaly_Glow.png'); } catch (_) { }
        if (!this._glow) return;

        // Origem do original: metade da largura, e metade da altura do quadro
        // menos 6 para assentar o brilho sobre o corpo.
        this._glowOrigin = Vector2.new(
            Math.floor(this._glow.Width / 2),
            Math.floor(this._glow.Height / 2 / FRAME_COUNT) - 6
        );
        this._glowColor = Color.op_Multiply(Color.White, 0.35);
    }

    static BossType() {
        if (bossType === -1) bossType = ModNPC.getTypeByName('GraniteEnergyStorm') ?? -2;
        return bossType;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAME_COUNT;
        Terraria.ID.NPCID.Sets.CantTakeLunchMoney[this.Type] = true;
        this.BestiaryRarityStars = 4;
    }

    SetDefaults() {
        this.NPC.width = 30;
        this.NPC.height = 40;
        this.NPC.damage = 0;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 300;
        this.NPC.rarity = 4;
        this.NPC.chaseable = false;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.knockBackResist = 0;
        this.NPC.aiStyle = -1;
        this.NPC.scale = 1;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Granite);

        const flavor = FlavorTextBestiaryInfoElement.new();
        flavor._key = ModLocalization.Translate('Bestiary.UnstableEnergyAnomaly');
        bestiaryEntry.Info.Add(flavor);
    }

    PostDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();
        if (!this._glow) return;

        const effects = npc.spriteDirection < 0 ? SpriteEffects.None : SpriteEffects.FlipHorizontally;

        spriteBatch[DRAW](
            this._glow,
            Vector2.Subtract(npc.Center, screenPos),
            npc.frame,
            this._glowColor,
            npc.rotation,
            this._glowOrigin,
            npc.scale,
            effects,
            0
        );
    }

    // Anima mais rapido conforme o estagio sobe: 4, 3 e 2 ticks por quadro.
    FindFrame(npc, frameHeight) {
        npc.frameCounter++;
        if (npc.frameCounter > 4 - npc.ai[1]) {
            npc.frameCounter = 0;
            npc.localAI[0] = (npc.localAI[0] + 1) % FRAME_COUNT;
        }

        const frame = npc.frame;
        frame.Y = Math.floor(npc.localAI[0]) * frameHeight;
        npc.frame = frame;
    }

    _emit(npc, dustType, scale) {
        const dustIndex = Effects.NewDust(npc.position, npc.width, npc.height, dustType, 0, 0, 100, Color.White, scale);
        const dust = Main.dust[dustIndex];

        dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
        dust.noGravity = true;
    }

    AI(npc) {
        // Sem AI de perseguicao: ele so' assenta no chao e pulsa.
        const velocity = npc.velocity;
        velocity.Y++;
        npc.velocity = velocity;

        const life = npc.life / npc.lifeMax;

        if (life > STAGE_HEALTHY) {
            npc.ai[1] = 0;
            this._emit(npc, 59, 1);
            return;
        }

        if (life > STAGE_UNSTABLE) {
            npc.ai[1] = 1;
            this._emit(npc, 15, 1.25);
            return;
        }

        npc.ai[1] = 2;
        this._emit(npc, 59, 1.5);
        this._emit(npc, 15, 1.35);
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        if (npc.life <= 0) {
            const boss = UnstableEnergyAnomaly.BossType();
            if (boss > 0 && COUNT_NPCS(boss) > 0) return;

            Effects.PlaySound(Terraria.ID.SoundID.Roar, npc.Center.X, npc.Center.Y);
            for (let index = 0; index < 20; index++) {
                Effects.NewDust(position, width, height, 37, Rand.Next(-6, 6), Rand.Next(-6, 6), 0, white, 1.25);
                Effects.NewDust(position, width, height, 15, Rand.Next(-6, 6), Rand.Next(-6, 6), 0, white, 1.5);
            }
            return;
        }

        const count = Math.floor(damage / npc.lifeMax * 50);
        for (let index = 0; index < count; index++) {
            Effects.NewDust(position, width, height, 37, hitDirection, -1, 0, white, 1);
        }
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || !info.BelowSurface || info.PlayerSafe || !info.Player.ZoneGranite) return 0;
        if (!Terraria.NPC.downedBoss3) return 0;
        if (COUNT_NPCS(this.Type) > 0) return 0;

        const boss = UnstableEnergyAnomaly.BossType();
        if (boss > 0 && COUNT_NPCS(boss) > 0) return 0;

        return WorldDB.get(DEFEATED_KEY) === true ? 0.025 : 1;
    }

    OnKill(npc) {
        const boss = UnstableEnergyAnomaly.BossType();
        if (boss < 0 || COUNT_NPCS(boss) > 0) return;

        const center = npc.Center;
        NEW_NPC(null, center.X | 0, (center.Y - 10) | 0, boss, 0, 0, 0, 0, 0, 255);
        MiscHelper.ThoriumChatMessage('GraniteEnergyStormAppear', Color.new(175, 75, 225));
    }
}
