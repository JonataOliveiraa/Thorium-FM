import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const GRANITE_TILE = 368;
const SURGE_DURATION = 300;

let surgeType = -1;

export class GraniteFusedSlime extends ModNPC {
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
        try { this._effect = tl.texture.load('Textures/NPCs/GraniteCave/GraniteFusedSlime_Effect.png'); } catch (_) { }
        this._effectOrigin = Vector2.new(17, 12);
        this._alpha = Color.new(255, 255, 255, 150);
    }

    SetStaticDefaults() {
        // Mesma contagem de quadros do Blue Slime, que e' de quem ele herda a animacao.
        Main.npcFrameCount[this.Type] = Main.npcFrameCount[1];
        this.BestiaryRarityStars = 1;
    }

    SetDefaults() {
        this.NPC.width = 26;
        this.NPC.height = 20;
        this.NPC.damage = 30;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 80;
        this.NPC.scale = 1.2;
        this.NPC.aiStyle = 1;
        this.NPC.knockBackResist = 0.6;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 5, 0);
        this.AnimationType = 1;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Granite);

        const flavor = FlavorTextBestiaryInfoElement.new();
        flavor._key = ModLocalization.Translate('Bestiary.GraniteFusedSlime');
        bestiaryEntry.Info.Add(flavor);
    }

    GetAlpha(npc, newColor) {
        this._loadTextures();
        return this._alpha;
    }

    PostDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();
        if (!this._effect) return;

        spriteBatch[DRAW](
            this._effect,
            Vector2.Subtract(npc.Center, screenPos),
            npc.frame,
            Color.White,
            npc.rotation,
            this._effectOrigin,
            1.2,
            SpriteEffects.None,
            0
        );
    }

    AI(npc) {
        Effects.AddLight(npc.position, 0.15, 0.35, 0.6);
        if (npc.velocity.Y !== 0) return;
        npc.ai[0]++;
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        if (npc.life <= 0) {
            for (let index = 0; index < 20; index++) {
                Effects.NewDust(position, width, height, 15, 2.5 * hitDirection, -2.5, 255, white, 1.15);
                Effects.NewDust(position, width, height, 37, 2.5 * hitDirection, -2.5, 0, white, 1.25);
            }
            return;
        }

        const count = Math.floor(damage / npc.lifeMax * 50);
        for (let index = 0; index < count; index++) {
            Effects.NewDust(position, width, height, 15, hitDirection, -1, 255, white, 1);
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
