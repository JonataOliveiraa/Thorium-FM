import { ModBiome } from '../../../TL/ModBiome.js';
import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';
import { SoundHelper } from '../../Global/Utils/SoundHelper.js';

const { Color, Vector2, Rand } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];

const FRAMES = 3;
// Ciclo: fecha -> treme -> abre e cospe as perolas
const CYCLE = 240;
const SHAKE_START = 180;
const CLOSE_AT = 232;
const PEARL_DAMAGE = 40;

// Perolas vanilla: branca / preta / rosa
const WHITE_PEARL = 4412;
const BLACK_PEARL = 4413;
const PINK_PEARL = 4414;

let _pearlType = -1;

export class GigaClam extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
        this.shift = false;
        this._glow = [null, null, null];
        this._texLoaded = false;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.NPC.width = 62;
        this.NPC.height = 40;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 30;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 125;
        this.NPC.knockBackResist = 0.0;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit41;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 35);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
        npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
    }

    SpawnChance(info) {
        if (ModBiome.getByName('AquaticDepths').IsActive) return 0.12;
        return 0;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GigaClam');
        bestiaryEntry.Info.Add(FlavorText);
    }

    // ai[0] = timer do ciclo | ai[1] = perola guardada (0 = nenhuma) | ai[2] = quadro
    AI(npc) {
        // Sorteia a perola uma vez. ai[1] guarda tipo+1 (1 = concha vazia)
        if (npc.ai[1] === 0) {
            const roll = Rand.Next(100) + 1;
            let pearl = 0;
            if (roll < 5) pearl = PINK_PEARL;
            else if (roll < 10) pearl = BLACK_PEARL;
            else if (roll < 25) pearl = WHITE_PEARL;
            npc.ai[1] = pearl + 1;
        }

        npc.ai[0]++;

        if (npc.ai[0] >= 22 && npc.ai[2] > 1) npc.ai[2] = 1;
        if (npc.ai[0] >= 30) npc.ai[2] = 0;

        // Treme antes de cuspir
        if (npc.ai[0] >= SHAKE_START) {
            if (this.shift) {
                npc.rotation += 0.1;
                if (npc.rotation > 0.2) this.shift = false;
            } else {
                npc.rotation -= 0.1;
                if (npc.rotation < -0.2) this.shift = true;
            }
        }

        if (npc.ai[0] >= CLOSE_AT) {
            npc.ai[2] = 1;
            npc.rotation = 0;
        }

        if (npc.ai[0] < CYCLE) return;

        npc.ai[2] = 2;

        if (_pearlType === -1) _pearlType = ModProjectile.getTypeByName('HostilePearl');
        if (_pearlType >= 0) {
            const center = npc.Center;
            NewProjectile(null, center.X, center.Y, 0, -2, _pearlType, PEARL_DAMAGE, 0, Main.myPlayer, 0, 0, 0, null);
            NewProjectile(null, center.X, center.Y, 0.7, -2, _pearlType, PEARL_DAMAGE, 0, Main.myPlayer, 0, 0, 0, null);
            NewProjectile(null, center.X, center.Y, -0.7, -2, _pearlType, PEARL_DAMAGE, 0, Main.myPlayer, 0, 0, 0, null);
        }

        FxHelper.burst(Vector2.new(npc.Center.X - 12, npc.Center.Y - 12), 20, 20, 10, 16, 4, 1.65);
        SoundHelper.play(['NPCDeath9', 'NPCDeath1'], npc.Center.X, npc.Center.Y);

        npc.ai[0] = 0;
    }

    FindFrame(npc, frameHeight) {
        const frame = npc.frame;
        frame.Y = (npc.ai[2] | 0) * frameHeight;
        npc.frame = frame;
    }

    // A perola guardada brilha por cima da concha
    PostDraw(npc, spriteBatch, screenPos) {
        if (!this._texLoaded) {
            this._texLoaded = true;
            for (let i = 0; i < 3; i++) {
                try { this._glow[i] = tl.texture.load(`Textures/NPCs/AquaticDepths/GigaClam_Effect${i + 1}.png`); } catch (_) { }
            }
        }

        const pearl = (npc.ai[1] | 0) - 1;
        if (pearl <= 0) return;

        const tex = pearl === PINK_PEARL ? this._glow[2] : (pearl === BLACK_PEARL ? this._glow[1] : this._glow[0]);
        if (!tex) return;

        const frame = npc.frame;
        spriteBatch[DRAW](
            tex,
            Vector2.new(npc.Center.X - screenPos.X, npc.Center.Y - screenPos.Y),
            frame, Color.Multiply(Color.White, 0.8), npc.rotation,
            Vector2.new(frame.Width / 2, frame.Height / 2 + 4), 1,
            Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0
        );
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 8, 5, 2.5, 0.8, 0, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 8, 37, 2.5, 1.6, 0, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 37, 1, 0.8, 0, false);
    }

    // Solta a perola que estava guardando. TODO: BubbleTea quando o item existir
    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('DepthScales'), 2, 1, 2));
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('NanoClamCane'), 20, 1, 1));
    }

    OnKill(npc) {
        const pearl = (npc.ai[1] | 0) - 1;
        if (pearl <= 0) return;

        NewItem(npc.position.X | 0, npc.position.Y | 0, npc.width, npc.height, pearl, 1, false, 0, false);
    }
}
