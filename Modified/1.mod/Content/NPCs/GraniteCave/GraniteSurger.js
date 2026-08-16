import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const GRANITE_TILE = 368;
const SURGE_DURATION = 300;
const FRAME_COUNT = 6;
const FRAME_TIME = 5;
const ATTACK_DAMAGE = 20;
const SHOT_INTERVAL = 20;
const COOLDOWN = -240;

// Altura de voo. Menor que os 200 do original justamente para ficar ao alcance
// de um pulo decente.
const HOVER_HEIGHT = 120;
// Dentro da zona morta ele nao corrige nada, so' flutua. E' o que quebra a
// sensacao de estar grudado na cabeca do jogador.
const DEADZONE_X = 48;
const DEADZONE_Y = 72;
const MAX_SPEED_X = 4;
const MAX_SPEED_Y = 2.2;
// O eixo Y responde bem mais devagar que o X de proposito: assim ele demora a
// acompanhar um pulo e da' janela para o corpo a corpo alcancar.
const ACCEL_X = 0.07;
const ACCEL_Y = 0.03;
const DRIFT_SPEED = 0.012;
const DRIFT_AMOUNT = 0.35;

let surgeType = -1;
let attackType = -1;

export class GraniteSurger extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/GraniteCave/' + this.constructor.name;
        this._effect = null;
        this._effectOrigin = null;
        this._alpha = null;
        this._texturesLoaded = false;
    }

    _loadTextures() {
        if (this._texturesLoaded) return;
        this._texturesLoaded = true;
        try { this._effect = tl.texture.load('Textures/NPCs/GraniteCave/GraniteSurger_Effect.png'); } catch (_) { }
        this._effectOrigin = Vector2.new(19, 18);
        this._alpha = Color.new(255, 255, 255, 150);
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAME_COUNT;
        this.BestiaryRarityStars = 2;
    }

    SetDefaults() {
        this.NPC.lifeMax = 90;
        this.NPC.damage = 20;
        this.NPC.defense = 10;
        this.NPC.width = 38;
        this.NPC.height = 42;
        this.NPC.aiStyle = -1;
        this.NPC.alpha = 40;
        this.NPC.noGravity = true;
        this.NPC.knockBackResist = 0.5;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath37;
        this.NPC.value = ModNPC.NPCValue(0, 0, 5, 0);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Granite);

        const flavor = FlavorTextBestiaryInfoElement.new();
        flavor._key = ModLocalization.Translate('Bestiary.GraniteSurger');
        bestiaryEntry.Info.Add(flavor);
    }

    GetAlpha(npc, newColor) {
        this._loadTextures();
        return this._alpha;
    }

    FindFrame(npc, frameHeight) {
        npc.frameCounter++;
        if (npc.frameCounter > FRAME_TIME) {
            npc.frameCounter = 0;
            npc.localAI[0] = (npc.localAI[0] + 1) % FRAME_COUNT;
        }

        const frame = npc.frame;
        frame.Y = Math.floor(npc.localAI[0]) * frameHeight;
        npc.frame = frame;
    }

    PostDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();
        if (!this._effect) return;

        // O original inverte o flip em relacao ao usual: direction < 0 fica normal.
        const effects = npc.spriteDirection < 0 ? SpriteEffects.None : SpriteEffects.FlipHorizontally;

        spriteBatch[DRAW](
            this._effect,
            Vector2.Subtract(npc.Center, screenPos),
            npc.frame,
            Color.White,
            npc.rotation,
            this._effectOrigin,
            1,
            effects,
            0
        );
    }

    CanFallThroughPlatforms(npc) {
        return true;
    }

    // Perseguicao amortecida: acelera na direcao do ponto de voo em vez de
    // corrigir a posicao de forma dura. Cada eixo tem zona morta propria, entao
    // ele para de reagir quando ja' esta "perto o bastante" e so' flutua.
    _updateMovement(npc, player) {
        const center = npc.Center;
        const playerCenter = player.Center;
        const velocity = npc.velocity;

        const offsetX = playerCenter.X - center.X;
        const offsetY = (playerCenter.Y - HOVER_HEIGHT) - center.Y;

        // Balanco lento e dessincronizado por NPC, para nunca ficar imovel.
        const drift = Math.sin(Main.GameUpdateCount * DRIFT_SPEED + npc.whoAmI) * DRIFT_AMOUNT;

        const desiredX = Math.abs(offsetX) < DEADZONE_X
            ? 0
            : Math.max(-MAX_SPEED_X, Math.min(MAX_SPEED_X, offsetX * 0.02));

        const desiredY = Math.abs(offsetY) < DEADZONE_Y
            ? drift
            : Math.max(-MAX_SPEED_Y, Math.min(MAX_SPEED_Y, offsetY * 0.02)) + drift;

        velocity.X += Math.max(-ACCEL_X, Math.min(ACCEL_X, desiredX - velocity.X));
        velocity.Y += Math.max(-ACCEL_Y, Math.min(ACCEL_Y, desiredY - velocity.Y));

        npc.velocity = velocity;
        npc.spriteDirection = velocity.X > 0 ? 1 : -1;
    }

    AI(npc) {
        Effects.AddLight(npc.Center, 0.25, 0.45, 0.8);

        npc.TargetClosest(true);
        const player = Main.player[npc.target];
        if (!player || !player.active) return;

        npc.ai[2]++;

        if (npc.ai[1] === 0) this._updateMovement(npc, player);

        // Dispara em ai[2] = -20 e 0, depois entra em 240 ticks de recarga.
        if (player.dead || npc.ai[2] < -20 || npc.ai[2] % SHOT_INTERVAL !== 0) return;

        if (attackType === -1) attackType = ModProjectile.getTypeByName('GraniteAttack') ?? -2;
        if (attackType >= 0) {
            const center = npc.Center;
            const offsetX = player.Center.X - center.X;
            const offsetY = player.Center.Y - center.Y;
            const length = Math.sqrt(offsetX * offsetX + offsetY * offsetY) || 1;

            NEW_PROJECTILE(null, center.X, center.Y, offsetX / length * 5, offsetY / length * 5, attackType, ATTACK_DAMAGE, 0, Main.myPlayer, 0, 0, 0, null);
        }

        if (npc.ai[2] < 0) return;
        npc.ai[2] = COOLDOWN;
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        if (npc.life <= 0) {
            for (let index = 0; index < 25; index++) {
                Effects.NewDust(position, width, height, 15, 2.5 * hitDirection, -3, 0, white, 1.6);
            }
            for (let index = 0; index < 5; index++) {
                Effects.NewDust(position, width, height, 29, 2.5 * hitDirection, -2.5, 0, white, 0.6);
            }
            return;
        }

        const count = Math.floor(damage / npc.lifeMax * 50);
        for (let index = 0; index < count; index++) {
            Effects.NewDust(position, width, height, 15, hitDirection, -1, 0, white, 0.6);
        }
    }

    OnHitPlayer(npc, player) {
        if (!Main.expertMode || Rand.Next(0, 3) !== 0) return;

        if (surgeType < 0) surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
        if (surgeType >= 0) player.AddBuff(surgeType, SURGE_DURATION, false);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || !info.BelowSurface || info.PlayerSafe || !info.Player.ZoneGranite) return 0;
        if (!Terraria.NPC.downedBoss3) return 0;
        return 0.18;
    }

    ModifyNPCLoot(npcLoot) {
        const core = ModItem.getTypeByName('GraniteEnergyCore');
        if (core > 0) npcLoot.Add(ItemDropRule.Common(core, 3, 1, 2));
    }
}
