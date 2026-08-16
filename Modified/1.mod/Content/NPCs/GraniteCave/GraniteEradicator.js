import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ProjAI } from '../../../TL/ProjAI.js';
import { ARM_COUNT } from '../../Projectiles/NPC/GraniteEradicatorArm.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const GRANITE_TILE = 368;
const SURGE_DURATION = 300;
const FRAME_COUNT = 16;
const FRAME_TIME = 4;
const ARM_DAMAGE = 16;
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let surgeType = -1;
let armType = -1;

export class GraniteEradicator extends ModNPC {
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
        try { this._effect = tl.texture.load('Textures/NPCs/GraniteCave/GraniteEradicator_Effect.png'); } catch (_) { }
        this._effectOrigin = Vector2.new(21, 18);
        this._alpha = Color.new(255, 255, 255, 150);
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAME_COUNT;
        this.BestiaryRarityStars = 2;
    }

    SetDefaults() {
        this.NPC.width = 40;
        this.NPC.height = 40;
        this.NPC.lifeMax = 100;
        this.NPC.damage = 20;
        this.NPC.defense = 12;
        this.NPC.knockBackResist = 0.4;
        this.NPC.aiStyle = 2;
        this.NPC.noGravity = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath37;
        this.NPC.value = ModNPC.NPCValue(0, 0, 5, 0);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Granite);

        const flavor = FlavorTextBestiaryInfoElement.new();
        flavor._key = ModLocalization.Translate('Bestiary.GraniteEradicator');
        bestiaryEntry.Info.Add(flavor);
    }

    GetAlpha(npc, newColor) {
        this._loadTextures();
        return this._alpha;
    }

    PostDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();
        if (!this._effect) return;

        const center = npc.Center;
        spriteBatch[DRAW](
            this._effect,
            Vector2.new(center.X - screenPos.X, center.Y + npc.gfxOffY - screenPos.Y),
            npc.frame,
            Color.White,
            npc.rotation,
            this._effectOrigin,
            1,
            SpriteEffects.None,
            0
        );
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

    CanFallThroughPlatforms(npc) {
        return true;
    }

    AI(npc) {
        Effects.AddLight(npc.Center, 0.15, 0.35, 0.6);
        npc.rotation = 0;

        // Os bracos nascem uma vez so', no primeiro tick de vida.
        if (npc.localAI[1] !== 0) return;
        npc.localAI[1] = 1;

        if (armType === -1) armType = ModProjectile.getTypeByName('GraniteEradicatorArm') ?? -2;
        if (armType < 0) return;

        const center = npc.Center;
        for (let index = 0; index < ARM_COUNT; index++) {
            const projIndex = NEW_PROJECTILE(null, center.X, center.Y, 0, 0, armType, ARM_DAMAGE, 0, Main.myPlayer, 0, 0, 0, null);
            const arm = Main.projectile[projIndex];
            if (!arm) continue;

            // ai[0] = dono, ai[1] = indice do braco (define o setor que ele varre).
            const ai = new ProjAI(arm, false);
            ai[0] = npc.whoAmI;
            ai[1] = index;
        }
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        if (npc.life <= 0) {
            for (let index = 0; index < 18; index++) {
                Effects.NewDust(position, width, height, 15, Rand.Next(-4, 4), Rand.Next(-4, 4), 0, white, 1.2);
                Effects.NewDust(position, width, height, 37, Rand.Next(-3, 3), Rand.Next(-3, 3), 0, white, 1);
            }
            return;
        }

        const count = Math.floor(damage / npc.lifeMax * 50);
        for (let index = 0; index < count; index++) {
            Effects.NewDust(position, width, height, 15, hitDirection, -1, 0, white, 0.8);
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
        if (core > 0) npcLoot.Add(ItemDropRule.Common(core, 2, 1, 3));
    }
}
