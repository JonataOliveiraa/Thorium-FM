import { Terraria, Modules, Microsoft } from './../../../../TL/ModImports.js';
import { ModNPC } from './../../../../TL/ModNPC.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';
import { WorldDB } from './../../../../TL/WorldDB.js';
import { ModLocalization } from './../../../../TL/ModLocalization.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { BestiaryOrder } from '../../../Global/Utils/BestiaryOrder.js';
import { EnergyStormState } from './EnergyStormState.js';

const { Color, Vector2, Rand, Effects, Rectangle } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;

const NPC_COUNT = Terraria.NPC['int CountNPCS(int Type)'];
const NEW_NPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CAN_HIT = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const IItemDropRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'IItemDropRule');
const OneFromRulesRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'OneFromRulesRule');
const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
// ItemID.Granite = bloco de granito. Literal porque e' o valor usado no original.
const GRANITE_BLOCK = 3086;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const BARRIER_COUNT = 8;
const COALESCED_SPAWN_TIME = 120;
const COALESCED_COOLDOWN = -1500;
const CHARGE_DELAY = 180;
const DASH_PREPARE_TIME = 510;
const DASH_TIME = 600;
const CONDUIT_DELAY = 600;
const HOVER_HEIGHT = 150;
const DASH_SPEED = 12;
const ENRAGE_THRESHOLD = 0.35;
const RAGE_NO_COALESCED = 60;
const RAGE_HALF_LIFE = 30;
const RAGE_QUARTER_LIFE = 30;
const EFFECT_FRAME_COUNT = 6;

const LIFE_CLASSIC = 7000;
const LIFE_EXPERT = 9800;
const LIFE_MASTER = 12495;

let typesReady = false;
let coalescedType = -1;
let barrierType = -1;
let conduitType = -1;
let chargeType = -1;

function initializeTypes() {
    if (typesReady) return;
    typesReady = true;
    coalescedType = ModNPC.getTypeByName('CoalescedEnergy') ?? -1;
    barrierType = ModNPC.getTypeByName('EnergyBarrier') ?? -1;
    conduitType = ModNPC.getTypeByName('EnergyConduit') ?? -1;
    chargeType = ModProjectile.getTypeByName('GraniteCharge') ?? -1;
}

export class GraniteEnergyStorm extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/GraniteEnergyStorm/' + this.constructor.name;
        this.effectFrameY = 0;
        this.generate = 0;
        this._effectTex = null;
        this._effect2Tex = null;
        this._effectFrames = null;
        this._effectOrigin = null;
        this._auraOrigin = null;
        this._auraColor = null;
        this._texturesLoaded = false;
    }

    _loadTextures() {
        if (this._texturesLoaded) return;
        this._texturesLoaded = true;
        try { this._effectTex = tl.texture.load('Textures/NPCs/Boss/GraniteEnergyStorm/GraniteEnergyStorm_Effect.png'); } catch (_) { }
        try { this._effect2Tex = tl.texture.load('Textures/NPCs/Boss/GraniteEnergyStorm/GraniteEnergyStorm_Effect2.png'); } catch (_) { }

        if (this._effect2Tex) {
            this._auraOrigin = Vector2.new(this._effect2Tex.Width / 2, this._effect2Tex.Height / 2);
            this._auraColor = Color.op_Multiply(Color.White, 0.65);
        }

        if (!this._effectTex) return;

        const frameHeight = Math.floor(this._effectTex.Height / EFFECT_FRAME_COUNT);
        this._effectOrigin = Vector2.new(this._effectTex.Width / 2, frameHeight / 2);
        this._effectFrames = new Array(EFFECT_FRAME_COUNT);
        for (let index = 0; index < EFFECT_FRAME_COUNT; index++) {
            this._effectFrames[index] = Rectangle.new(0, index * frameHeight, this._effectTex.Width, frameHeight);
        }
    }

    _spawnBarriers(npc, center) {
        if (barrierType < 0) return;
        Effects.PlaySound(Terraria.ID.SoundID.Item72, center.X, center.Y);
        for (let index = 0; index < BARRIER_COUNT; index++) NEW_NPC(null, center.X, center.Y, barrierType, 0, npc.whoAmI, 0, index, 0, 255);
    }

    _spawnCoalescedEnergy(npc, center) {
        if (coalescedType < 0) return;
        Effects.PlaySound(Terraria.ID.SoundID.Item88, center.X, center.Y);
        for (let index = 0; index < BARRIER_COUNT; index++) NEW_NPC(null, center.X, center.Y, coalescedType, 0, npc.whoAmI, index, 0, 0, 255);
        npc.ai[3] = COALESCED_COOLDOWN;
    }

    _rage(life, lifeMax, coalescedJustSpawned) {
        let rage = 0;
        if (coalescedJustSpawned || (coalescedType >= 0 && NPC_COUNT(coalescedType) === 0)) rage += RAGE_NO_COALESCED;
        if (life < lifeMax * 0.5) rage += RAGE_HALF_LIFE;
        if (life < lifeMax * 0.25) rage += RAGE_QUARTER_LIFE;
        return rage;
    }

    _fireCharge(npc, player, center) {
        if (chargeType < 0) return;
        const direction = Vector2.SafeNormalize(Vector2.Subtract(player.Center, center), Vector2.UnitX);
        NEW_PROJECTILE(null, center.X, center.Y, direction.X * 12, direction.Y * 12, chargeType, 25, 0, Main.myPlayer, 0, 0, 0, null);
    }

    _spawnConduit(npc, center) {
        if (conduitType < 0) return;
        Effects.PlaySound(Terraria.ID.SoundID.Item70, center.X, center.Y);
        NEW_NPC(null, center.X, center.Y, conduitType, 0, 0, 0, 0, 0, 255);
        this.generate = 0;
    }

    _updateMovement(npc, player) {
        npc.directionY = player.position.Y - HOVER_HEIGHT > npc.position.Y ? 1 : -1;

        const velocity = npc.velocity;

        if (npc.direction === -1 && velocity.X > -4) {
            velocity.X -= 0.4;
            if (velocity.X > 2) velocity.X -= 0.4;
            else if (velocity.X > 0) velocity.X += 0.08;
            if (velocity.X < -2) velocity.X = -2;
        } else if (npc.direction === 1 && velocity.X < 4) {
            velocity.X += 0.4;
            if (velocity.X < -2) velocity.X += 0.4;
            else if (velocity.X < 0) velocity.X -= 0.08;
            if (velocity.X > 2) velocity.X = 2;
        }

        if (npc.directionY === -1 && velocity.Y > -2) {
            velocity.Y -= 0.15;
            if (velocity.Y < -2) velocity.Y = -2;
        } else if (npc.directionY === 1 && velocity.Y < 2) {
            velocity.Y += 0.15;
            if (velocity.Y > 2) velocity.Y = 2;
        }

        npc.velocity = velocity;
    }

    _createChargeDust(npc, center) {
        const offset = Vector2.new(Rand.Next(-75, 76), Rand.Next(-75, 76));
        const position = Vector2.new(center.X - 2 + offset.X, center.Y - 6 + offset.Y);
        const dustIndex = Effects.NewDust(position, 20, 20, 15, 0, 0, 255, Color.White, 1.5);
        const dust = Main.dust[dustIndex];

        dust.noGravity = true;
        dust.velocity = Vector2.Multiply(offset, -0.075);
    }

    _drawEffect(npc, spriteBatch, screenPos, drawAura) {
        this._loadTextures();

        if (drawAura ? !this._effect2Tex : !this._effectTex) return;

        const drawPos = Vector2.Subtract(npc.Center, screenPos);
        const draw = spriteBatch[DRAW];
        const scale = npc.scale;

        if (drawAura) {
            draw(this._effect2Tex, drawPos, null, this._auraColor, -npc.rotation * 0.35, this._auraOrigin, scale, SpriteEffects.None, 0);
            return;
        }

        draw(this._effectTex, drawPos, this._effectFrames[this.effectFrameY], Color.White, 0, this._effectOrigin, scale, SpriteEffects.None, 0);
    }

    DeathMessage = (npc) => {
        return Terraria.Localization.Language.GetText('Announcement.HasBeenDefeated_Single'
        ).Value.replace('{0}', ModLocalization.Translate('NPCName.GraniteEnergyStorm'));
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 1;
        Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
        this.BestiaryRarityStars = 3;
        this.Music = Terraria.ID.MusicID.Boss2;
    }

    PostSetupContent() {
        BestiaryOrder.BossAfter(this.Type, 35);
    }

    SetDefaults() {
        this.NPC.lifeMax = LIFE_CLASSIC;
        this.NPC.damage = 35;
        this.NPC.defense = 10;
        this.NPC.knockBackResist = 0;
        this.NPC.width = 64;
        this.NPC.height = 64;
        this.NPC.aiStyle = -1;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.lavaImmune = true;
        this.NPC.boss = true;
        this.NPC.scale = 1.2;
        this.NPC.npcSlots = 20;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath37;
        this.NPC.value = ModNPC.NPCValue(0, 6, 0, 0);
    }

    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        let lifeMax = LIFE_CLASSIC;
        if (Main.masterMode) lifeMax = LIFE_MASTER;
        else if (Main.expertMode) lifeMax = LIFE_EXPERT;

        npc.lifeMax = Math.floor(lifeMax * balance);
    }

    SetBestiary(database, bestiaryEntry) {
        const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
        const flavor = FlavorTextBestiaryInfoElement.new();
        // Antes passava a chave crua, que aparecia literalmente na tela.
        flavor._key = ModLocalization.Translate('Bestiary.GraniteEnergyStorm');
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Granite);
        bestiaryEntry.Info.Add(flavor);
    }

    FindFrame(npc, frameHeight) {
        npc.frameCounter++;
        if (npc.frameCounter <= 8) return;
        this.effectFrameY = (this.effectFrameY + 1) % EFFECT_FRAME_COUNT;
        npc.frameCounter = 0;
    }

    PreDraw(npc, spriteBatch, screenPos) {
        this._drawEffect(npc, spriteBatch, screenPos, true);
        return true;
    }

    PostDraw(npc, spriteBatch, screenPos) {
        this._drawEffect(npc, spriteBatch, screenPos, false);
    }

    AI(npc) {
        initializeTypes();
        npc.TargetClosest(true);
        const player = Main.player[npc.target];

        if (!player || !player.active || player.dead) {
            const velocity = npc.velocity;
            velocity.Y += 0.1;
            npc.velocity = velocity;
            npc.EncourageDespawn(20);
            return;
        }

        const ai = npc.ai;
        const life = npc.life;
        const lifeMax = npc.lifeMax;

        EnergyStormState.enraged = life < lifeMax * ENRAGE_THRESHOLD;

        ai[3]++;

        const center = npc.Center;
        const canHitPlayer = CAN_HIT(npc.position, npc.width, npc.height, player.position, player.width, player.height);

        let coalescedJustSpawned = false;
        if (ai[3] >= COALESCED_SPAWN_TIME) {
            this._spawnCoalescedEnergy(npc, center);
            coalescedJustSpawned = true;
        }
        if (ai[3] === 1) this._spawnBarriers(npc, center);

        // O contador do tiro so' comeca a correr depois dos 75% de vida.
        if (life < lifeMax * 0.75) {
            ai[1]++;
            if (ai[1] >= CHARGE_DELAY && canHitPlayer) {
                this._fireCharge(npc, player, center);
                ai[1] = this._rage(life, lifeMax, coalescedJustSpawned);
            }
        }

        if (life < lifeMax * 0.5 && Main.expertMode) {
            this.generate++;
            if (this.generate > CONDUIT_DELAY && canHitPlayer && conduitType >= 0 && NPC_COUNT(conduitType) < 5) this._spawnConduit(npc, center);
        }

        // O timer do dash so' avanca com linha de visao para o jogador.
        if (canHitPlayer) {
            ai[0]++;

            if (ai[0] >= DASH_PREPARE_TIME) {
                ai[1] = 0;
                npc.velocity = Vector2.new(0, 0);
                this._createChargeDust(npc, center);
            }

            if (ai[0] >= DASH_TIME) {
                npc.velocity = Vector2.Multiply(Vector2.SafeNormalize(Vector2.Subtract(player.Center, center), Vector2.UnitX), DASH_SPEED);
                ai[0] = this._rage(life, lifeMax, coalescedJustSpawned);
            }
        }

        if (ai[0] < DASH_PREPARE_TIME) this._updateMovement(npc, player);

        npc.rotation -= 0.05;
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        if (npc.life > 0) {
            const count = Math.floor(damage / npc.lifeMax * 50);
            for (let index = 0; index < count; index++) Effects.NewDust(position, width, height, 37, Rand.Next(-3, 3), Rand.Next(-3, 3), 0, white, 1.25);
            return;
        }

        for (let index = 0; index < 15; index++) Effects.NewDust(position, width, height, 15, Rand.Next(-4, 4), Rand.Next(-4, 4), 255, white, 1.5);
        for (let index = 0; index < 20; index++) Effects.NewDust(position, width, height, 37, Rand.Next(-4, 4), Rand.Next(-4, 4), 0, white, 1.5);
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.HealingPotion, 1, 5, 15));
        npcLoot.Add(ItemDropRule.Common(GRANITE_BLOCK, 1, 30, 60));

        const core = ModItem.getTypeByName('GraniteEnergyCore');
        if (core > 0) npcLoot.Add(ItemDropRule.Common(core, 1, 4, 6));

        const weapons = [];
        for (const name of ['EnergyStormPartisan', 'EnergyStormBolter', 'EnergyProjector', 'BoulderProbeStaff', 'ShockAbsorber']) {
            const type = ModItem.getTypeByName(name);
            if (type > 0) weapons.push(ItemDropRule.Common(type, 1, 1, 1));
        }

        if (weapons.length > 0) {
            const oneOf = OneFromRulesRule.new();
            oneOf['void .ctor(int chanceDenominator, IItemDropRule[] options)'](1, weapons.makeGeneric(IItemDropRule));
            npcLoot.Add(oneOf);
        }

        const mask = ModItem.getTypeByName('GraniteEnergyStormMask');
        if (mask > 0) npcLoot.Add(ItemDropRule.Common(mask, 7, 1, 1));

        // Expert e Master: o BossBag ja' cuida de substituir o drop normal pela
        // bolsa. No Master, a bolsa tambem entrega o mascote.
        const bag = ModItem.getTypeByName('GraniteEnergyStormTreasureBag');
        if (bag > 0) npcLoot.Add(ItemDropRule.BossBag(bag));
    }

    OnKill() {
        WorldDB.set('Thorium:HasBeenDefeated_GraniteEnergyStorm', true);
    }
}
