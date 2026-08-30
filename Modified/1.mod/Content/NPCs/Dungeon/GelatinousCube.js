import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const DrawSignature = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

export class GelatinousCube extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Dungeon/' + this.constructor.name;
        this._liquefied = -1;
        this._sludgeType = -1;
        this._glowTex = null;
        this._glowTried = false;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 4;
        this.BestiaryRarityStars = 2;
    }

    SetDefaults() {
        this.NPC.width = 46;
        this.NPC.height = 42;
        this.NPC.aiStyle = 3;
        this.NPC.damage = 35;
        this.NPC.defense = 5;
        this.NPC.lifeMax = 250;
        this.NPC.scale = 1.25;
        this.NPC.alpha = 125;
        this.NPC.knockBackResist = 0.15;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath22;
        this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);
        this.AIType = 67;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.TheDungeon);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GelatinousCube');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.Dungeon) return 0;
        return (Main.hardMode && Terraria.NPC.downedPlantBoss) ? 0.02 : 0.08;
    }

    GlowTexture() {
        if (this._glowTried) return this._glowTex;
        this._glowTried = true;
        try { this._glowTex = tl.texture.load('Textures/NPCs/Dungeon/GelatinousCube_Glow.png'); } catch (_) { }
        return this._glowTex;
    }

    SludgeType() {
        if (this._sludgeType === -1) this._sludgeType = ModNPC.getTypeByName('GelatinousSludge') ?? -2;
        return this._sludgeType;
    }

    AI(npc) {
        if (npc.life > npc.lifeMax * 0.5) {
            npc.localAI[0]++;
            const player = Main.player[npc.target];
            if (npc.localAI[0] >= 0 && player && player.active &&
                CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height)) {
                npc.localAI[0] = -300;
                if (Main.netMode !== 1) this.SpawnSludge(npc);
            }
        }

        const step = Math.floor(npc.lifeMax / 100) || 1;
        npc.scale = 0.4 + 0.01 * npc.life / step;
    }

    SpawnSludge(npc) {
        const sludgeType = this.SludgeType();
        if (!(sludgeType > 0)) return;

        const owner = npc.whoAmI + 1;
        const npcArray = Main.npc;
        let count = 0;
        for (let i = 0; i < Main.maxNPCs; i++) {
            const other = npcArray[i];
            if (other.type !== sludgeType || !other.active) continue;
            if (other.localAI[3] === owner) count++;
        }
        if (count >= 5) return;

        const center = npc.Center;
        const index = NewNPC(null, Math.floor(center.X), Math.floor(center.Y) - 10, sludgeType, 0, 0, 0, 0, 0, 255);
        if (index < 0 || index >= Main.maxNPCs) return;
        const sludge = npcArray[index];
        if (sludge) sludge.localAI[3] = owner;
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        const frame = npc.frame;
        npc.frameCounter += Math.abs(npc.velocity.X) * 0.5 + 0.15;
        if (npc.frameCounter >= 6) {
            npc.frameCounter = 0;
            frame.Y += frameHeight;
            if (frame.Y >= frameHeight * 4) frame.Y = 0;
        }
        npc.frame = frame;
    }

    PreDraw(npc, spriteBatch, screenPos) {
        if (npc.life <= npc.lifeMax * 0.5) return true;

        const texture = this.GlowTexture();
        if (!texture) return true;

        const effects = npc.spriteDirection === 1 ? SpriteEffects.FlipHorizontally : SpriteEffects.None;
        Main.spriteBatch[DrawSignature](
            texture,
            Vector2.Subtract(npc.Center, screenPos),
            npc.frame,
            Color.new(255, 255, 255, 130),
            npc.rotation,
            Vector2.new(texture.Width * 0.5, texture.Height * 0.125),
            npc.scale,
            effects,
            0
        );
        return true;
    }

    OnHitPlayer(npc, player) {
        if (this._liquefied === -1) this._liquefied = ModBuff.getTypeByName('Liquefied') ?? -2;
        if (this._liquefied > 0) player.AddBuff(this._liquefied, 300, false);
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            for (let i = 0; i < 20; i++) NewDust(npc.position, npc.width, npc.height, 46, 2.5 * hitDirection, -2.5, 150, Color.White, 1.4);
            return;
        }

        const count = Math.min(12, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) NewDust(npc.position, npc.width, npc.height, 46, hitDirection, -1, 150, Color.White, 0.9);
    }

    ModifyNPCLoot(npcLoot) {
        const jelly = ModItem.getTypeByName('Jelly');
        if (jelly > 0) npcLoot.Add(ItemDropRule.Common(jelly, 1, 1, 2));
        npcLoot.Add(ItemDropRule.Common(327, 65, 1, 1));
        npcLoot.Add(ItemDropRule.Common(3095, 100, 1, 1));
    }
}
