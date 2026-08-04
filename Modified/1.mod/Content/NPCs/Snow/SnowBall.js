import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { Rectangle } from '../../../TL/Modules/Rectangle.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const FRAMES = 8;
const BASE_SIZE = 22;      // tamanho no estagio 1
const START_LIFE = 0.2;    // nasce com 20% da vida (bola pequena)

// Rolar pelo chao faz ele crescer de volta
const GROWTH_PER_TICK = 0.33; // x |velocidade X|, limitado a GROWTH_CAP
const GROWTH_CAP = 1.5;
const GROWTH_STEP = 10;       // pontos de "rolagem" por ganho de vida
const HIT_SETBACK = -90;      // apanhar trava o crescimento por um tempo

const SPEED = 3.5;
const ACCEL = 0.1;
const GRAVITY = 0.35;
const MAX_FALL = 10;
const STEP_HEIGHT = 16;    // altura de degrau que ele sobe rolando
const SEPARATE_EVERY = 8;  // ticks entre um empurrao e outro entre bolas

export class SnowBall extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Snow/' + this.constructor.name;
        this._eyesTex = null;
        this._texLoaded = false;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.NPC.width = BASE_SIZE;
        this.NPC.height = BASE_SIZE;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 8;
        this.NPC.defense = 0;
        this.NPC.lifeMax = 40;
        this.NPC.knockBackResist = 0.2;
        this.NPC.coldDamage = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath15;
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 90);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
        npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
        npc.buffImmune[Terraria.ID.BuffID.Frostburn] = true;
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.Water) return 0;
        if (info.SpawnTileType !== 147 && info.SpawnTileType !== 161) return 0; // neve / gelo
        if (!info.Snow && !info.Ice) return 0;
        return info.Day ? 0.12 : 0.06;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Snow);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.SnowBall');
        bestiaryEntry.Info.Add(FlavorText);
    }

    // Quanto o corpo cresce em cada estagio (mesma conta do original)
    _sizeIncrease(stage) {
        return 8 * (stage - 1) + (stage > 3 ? 4 : 0);
    }

    _stage(npc) {
        const stage = Math.floor(FRAMES * npc.life / npc.lifeMax) + 1;
        return stage < 1 ? 1 : (stage > FRAMES ? FRAMES : stage);
    }

    OnSpawn(npc) {
        npc.life = Math.max(1, Math.floor(npc.lifeMax * START_LIFE));
    }

    /**
     * ai[0] = estagio atual  | ai[1] = timer de crescimento
     * ai[2] = contador de "travado"  | ai[3] = cooldown do empurrao entre bolas
     */
    AI(npc) {
        const oldStage = npc.ai[0] | 0;
        const stage = this._stage(npc);

        // Mudou de tamanho: reajusta hitbox (ancorada no chao) e o dano
        if (oldStage !== stage) {
            npc.ai[0] = stage;
            npc.damage = Math.floor(npc.defDamage * ((stage - 1) / 3.5 + 1));

            const grow = this._sizeIncrease(stage);
            const bottom = npc.position.Y + npc.height;
            npc.width = Math.round(BASE_SIZE + grow * 0.6);
            npc.height = Math.round(BASE_SIZE + grow * 0.75);
            npc.position = Vector2.new(npc.position.X, bottom - npc.height);
        }

        if (npc.target < 0 || npc.target === 255 || !Main.player[npc.target] ||
            Main.player[npc.target].dead || !Main.player[npc.target].active) {
            npc.TargetClosest(true);
        }
        const player = Main.player[npc.target];

        const vel = npc.velocity;
        const onGround = SolidCollision(
            Vector2.new(npc.position.X, npc.position.Y + npc.height), npc.width, 4
        );

        // ---- Crescimento: so rolando no chao, e apanhar atrasa ----
        if (npc.justHit) {
            npc.ai[1] = HIT_SETBACK;
        } else if (npc.life < npc.lifeMax && onGround) {
            npc.ai[1] += Math.min(Math.abs(vel.X) * GROWTH_PER_TICK, GROWTH_CAP);
            if (npc.ai[1] >= GROWTH_STEP) {
                npc.life = Math.min(npc.lifeMax, npc.life + Math.max(1, Math.floor(npc.lifeMax / 100)));
                npc.ai[1] -= GROWTH_STEP;
            }
        }

        // ---- Direcao: vai atras do jogador ----
        if (player && player.active && !player.dead) {
            npc.direction = player.Center.X > npc.Center.X ? 1 : -1;
        } else if (npc.direction === 0) {
            npc.direction = 1;
        }

        // Vento da nevasca empurra a bola
        let speed = SPEED;
        if (player && player.ZoneSnow && Main.cloudAlpha > 0) {
            speed += Math.abs(Main.windSpeedTarget) * 2 * Math.sign(Main.windSpeedTarget) * npc.direction;
        }
        if (speed < 1) speed = 1;

        vel.X += ACCEL * npc.direction;
        if (vel.X > speed) vel.X = speed;
        if (vel.X < -speed) vel.X = -speed;

        // ---- Gravidade e degraus ----
        vel.Y += GRAVITY;
        if (vel.Y > MAX_FALL) vel.Y = MAX_FALL;

        const aheadX = npc.position.X + (vel.X > 0 ? npc.width : -1) + vel.X;
        const blocked = SolidCollision(Vector2.new(aheadX, npc.position.Y + 2), 1, npc.height - 4);

        if (blocked && onGround) {
            const canStep = !SolidCollision(
                Vector2.new(aheadX, npc.position.Y - STEP_HEIGHT + 2), 1, npc.height - 4
            );

            if (canStep) {
                // Sobe o degrau rolando
                npc.position = Vector2.new(npc.position.X, npc.position.Y - STEP_HEIGHT);
                npc.ai[2] = 0;
            } else {
                // Parede alta demais: perde a paciencia e vira
                npc.ai[2]++;
                if (npc.ai[2] > 20) {
                    npc.direction *= -1;
                    vel.X = 0;
                    npc.ai[2] = 0;
                }
            }
        } else if (npc.ai[2] > 0) {
            npc.ai[2]--;
        }

        npc.velocity = vel;

        // ---- Bolas nao se empilham ----
        npc.ai[3]--;
        if (npc.ai[3] <= 0) {
            npc.ai[3] = SEPARATE_EVERY;
            this._separate(npc);
        }

        npc.rotation += npc.velocity.X * 0.05;
        npc.spriteDirection = npc.direction;
    }

    _separate(npc) {
        const center = npc.Center;
        for (let i = 0; i < Main.maxNPCs; i++) {
            if (i === npc.whoAmI) continue;
            const other = Main.npc[i];
            if (!other || !other.active || other.type !== npc.type) continue;

            const dx = other.Center.X - center.X;
            const dy = other.Center.Y - center.Y;
            if (Math.abs(dx) + Math.abs(dy) >= npc.width) continue;

            const vel = npc.velocity;
            vel.X += dx > 0 ? -0.4 : 0.4;
            vel.Y += dy > 0 ? -0.4 : 0.4;
            npc.velocity = vel;
        }
    }

    // O quadro e o tamanho da bola
    FindFrame(npc, frameHeight) {
        const frame = npc.frame;
        frame.Y = ((npc.ai[0] | 0) - 1) * frameHeight;
        if (frame.Y < 0) frame.Y = 0;
        npc.frame = frame;
    }

    // Corpo gira; os olhos ficam sempre em pe
    PreDraw(npc, spriteBatch, screenPos) {
        if (!this._texLoaded) {
            this._texLoaded = true;
            try { this._eyesTex = tl.texture.load('Textures/NPCs/Snow/SnowBall_Eyes.png'); } catch (_) { }
        }

        const texture = Terraria.GameContent.TextureAssets.Npc[this.Type].Value;
        if (!texture) return true;

        const frame = npc.frame;
        const stage = npc.ai[0] | 0 || 1;
        const bodyHeight = BASE_SIZE + this._sizeIncrease(stage);

        // Pivo no meio da bola, perto da base do sprite
        const origin = Vector2.new(frame.Width / 2, frame.Height - (bodyHeight / 2 + 2));
        const pos = Vector2.new(
            npc.position.X - screenPos.X + npc.width / 2,
            npc.position.Y - screenPos.Y + npc.height +
            (-frame.Height + origin.Y) * npc.scale + 4 + npc.gfxOffY + bodyHeight * 0.125
        );

        const effects = npc.spriteDirection === 1 ? SpriteEffects.FlipHorizontally : SpriteEffects.None;
        const color = npc.GetAlpha(Terraria.Lighting['Color GetColor(int x, int y)'](
            Math.floor(npc.Center.X / 16), Math.floor(npc.Center.Y / 16)
        ));
        const Draw = spriteBatch[DRAW];

        Draw(texture, pos, frame, color, npc.rotation, origin, npc.scale, effects, 0);
        if (this._eyesTex) {
            Draw(this._eyesTex, pos, frame, color, 0, origin, npc.scale, effects, 0);
        }

        return false;
    }

    HitEffect(npc, hitDirection, damage) {
        const stage = npc.ai[0] | 0 || 1;
        const count = Math.floor(5 * ((stage - 1) / 3.5 + 1) * (npc.life <= 0 ? 3 : 1));
        FxHelper.burst(npc.position, npc.width, npc.height, Math.min(24, count), 176, 2, 2);
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('IcyShard'), 5, 1, 1));
    }
}
