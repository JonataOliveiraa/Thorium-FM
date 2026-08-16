import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { SoundHelper } from '../../Global/Utils/SoundHelper.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;

const NewNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const CountNPCS = Terraria.NPC['int CountNPCS(int Type)'];
const FindTeleportSpot = 'bool AI_AttemptToFindTeleportSpot(ref Vector2 chosenTile, int targetTileX, int targetTileY, int rangeFromTargetTile, int telefragPreventionDistanceInTiles, int solidTileCheckFluff, bool solidTileCheckCentered, bool teleportInAir)';
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const STATE_IDLE = 0;
const STATE_WINDUP = 1;
const STATE_ATTACK = 2;
const STATE_ROOTED = 3;
const STATE_BURROW = 4;
const STATE_EMERGE = 5;

// 0-7 respirando | 8,11,12 inflando | 13,14 cuspindo | 15-19 se fechando
// 20-24 afundando na terra | 9 e 10 sao recolores azul/dourado, nao entram na animacao
const FRAME_COUNT = 25;
const FRAME_IDLE_END = 7;
const FRAME_WINDUP_START = 8;
const FRAME_WINDUP_LOOP = 11;
const FRAME_WINDUP_END = 12;
const FRAME_ATTACK_START = 13;
const FRAME_ATTACK_END = 14;
const FRAME_CLOSE_START = 15;
const FRAME_CLOSE_END = 19;
const FRAME_BURROW_START = 20;
const FRAME_BURROW_END = FRAME_COUNT - 1;

const BURROW_FRAME_TIME = 6;
const EMERGE_FRAME_TIME = 3;
const BURROW_TIME = (FRAME_BURROW_END - FRAME_BURROW_START + 1) * BURROW_FRAME_TIME;
const EMERGE_TIME = (FRAME_BURROW_END - FRAME_CLOSE_START + 1) * EMERGE_FRAME_TIME;

const WINDUP_AT = 300;
const ATTACK_AT = 390;
const RELEASE_AT = 410;

const MAX_PETALS = 3;
const PETAL_RECOUNT_RATE = 10;

const ROOT_DELAY = 550;
const ROOT_DELAY_ENRAGED = 500;
const TELEPORT_DELAY = 600;
const STUN_SETBACK = 240;

const DRAW_OFFSET_Y = 10;
const DUST_GORE = 5;
const DUST_LEAF = 39;

const SFX_SPAWN = ['NPCHit1'];
const SFX_SHOOT = ['NPCDeath9'];
const SFX_BURROW = ['Item69', 'Item8'];
const SFX_EMERGE = ['Grass', 'Item69'];
const SFX_STUN = ['Zombie40', 'NPCHit1'];
const SFX_ANGER = ['Zombie98', 'Zombie40', 'NPCHit1'];

let _petalType = -1, _weedType = -1, _proType = -1, _typesInit = false;

function initTypes() {
    if (_typesInit) return;
    _typesInit = true;
    _petalType = ModNPC.getTypeByName('CorpsePetal') ?? -1;
    _weedType = ModNPC.getTypeByName('CorpseWeed') ?? -1;
    _proType = ModProjectile.getTypeByName('CorpseBloomPro') ?? -1;
}

export class CorpseBloom extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Jungle/' + this.constructor.name;
        this._swordTex = null;
        this._swordOrigin = null;
        this._texTried = false;
    }

    DeathMessage = (npc) => {
        return Terraria.Localization.Language.GetText('Announcement.HasBeenDefeated_Single'
        ).Value.replace('{0}', ModLocalization.Translate('NPCName.CorpseBloom'));
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAME_COUNT;
        Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
        this.BestiaryRarityStars = 5;
        this.Music = Terraria.ID.MusicID.QueenBee;
    }

    SetDefaults() {
        this.NPC.width = 62;
        this.NPC.height = 44;
        this.NPC.damage = 35;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 1100;
        this.NPC.npcSlots = 15;
        this.NPC.lavaImmune = true;
        this.NPC.knockBackResist = 0;
        this.NPC.aiStyle = -1;
        this.NPC.scale = 1.2;
        this.NPC.boss = true;
        this.NPC.HitSound = SoundHelper.resolve('NPCHit13', 'NPCHit1');
        this.NPC.DeathSound = SoundHelper.resolve('NPCDeath1');
        this.NPC.value = ModNPC.NPCValue(0, 1, 50, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
        npc.buffImmune[31] = true;
    }

    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        npc.lifeMax = Math.floor(1100 * balance);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.UndergroundJungle);
        const flavor = FlavorTextBestiaryInfoElement.new();
        flavor._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(flavor);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || !info.BelowSurface) return 0;
        if (info.SpawnTileType !== Terraria.ID.TileID.JungleGrass) return 0;
        if (!Terraria.NPC.downedBoss2) return 0;
        if (info.Water || info.PlayerSafe) return 0;
        if (WorldDB.get('Thorium:HasBeenDefeated_CorpseBloom') === true) return 0;
        if (CountNPCS(this.Type) > 0) return 0;
        return 0.05;
    }

    OnSpawn(npc) {
        initTypes();
    }

    FindFrame(npc, frameHeight) {
        const state = npc.ai[0];
        const localAI = npc.localAI;
        let counter = localAI[0];

        if (state === STATE_BURROW) {
            counter = Math.min(FRAME_BURROW_END, FRAME_BURROW_START + Math.floor(npc.ai[1] / BURROW_FRAME_TIME));
        } else if (state === STATE_EMERGE) {
            counter = Math.max(FRAME_CLOSE_START, FRAME_BURROW_END - Math.floor(npc.ai[1] / EMERGE_FRAME_TIME));
        } else if (state === STATE_IDLE) {
            if (counter > FRAME_IDLE_END) counter = 0;
            npc.frameCounter++;
            if (npc.frameCounter > 5) {
                counter++;
                if (counter > FRAME_IDLE_END) counter = 0;
                npc.frameCounter = 0;
            }
        } else if (state === STATE_WINDUP) {
            if (counter < FRAME_WINDUP_START || counter > FRAME_WINDUP_END) counter = FRAME_WINDUP_START;
            npc.frameCounter++;
            if (npc.frameCounter > 4) {
                counter++;
                if (counter > FRAME_WINDUP_END || counter < FRAME_WINDUP_LOOP) counter = FRAME_WINDUP_LOOP;
                npc.frameCounter = 0;
            }
        } else if (state === STATE_ATTACK) {
            if (counter < FRAME_ATTACK_START) counter = FRAME_ATTACK_START;
            npc.frameCounter++;
            if (npc.frameCounter > 6) {
                counter++;
                if (counter > FRAME_ATTACK_END) counter = FRAME_ATTACK_END;
                npc.frameCounter = 0;
            }
        } else {
            if (counter < FRAME_CLOSE_START) counter = FRAME_CLOSE_START;
            npc.frameCounter++;
            if (npc.frameCounter > 5) {
                counter++;
                if (counter > FRAME_CLOSE_END) counter = FRAME_CLOSE_END;
                npc.frameCounter = 0;
            }
        }

        localAI[0] = counter;

        const frame = npc.frame;
        frame.Y = counter * frameHeight;
        npc.frame = frame;

        npc.gfxOffY = DRAW_OFFSET_Y;
    }

    PostDraw(npc, spriteBatch, screenPos) {
        if (npc.ai[0] !== STATE_ROOTED || npc.localAI[2] !== 0) return;
        if (!this._texTried) {
            this._texTried = true;
            this._swordTex = tl.texture.load('Textures/Projectiles/Sword_Indicator.png');
            this._swordOrigin = Vector2.new(14, 60);
        }
        if (!this._swordTex) return;

        const center = npc.Center;
        spriteBatch[DRAW](
            this._swordTex,
            Vector2.new(center.X - screenPos.X, center.Y - screenPos.Y + DRAW_OFFSET_Y),
            null, Color.White, 0, this._swordOrigin, 1, SpriteEffects.None, 0
        );
    }

    AI(npc) {
        initTypes();
        npc.TargetClosest(true);

        const player = Main.player[npc.target];
        if (!player || !player.active) return;

        const ai = npc.ai;
        const localAI = npc.localAI;
        const center = npc.Center;

        npc.gfxOffY = DRAW_OFFSET_Y;
        Effects.AddLight(center, 0.15, 0.3, 0.15);

        if (ai[0] === STATE_BURROW) return this._updateBurrow(npc, player);
        if (ai[0] === STATE_EMERGE) return this._updateEmerge(npc);

        this._setBuried(npc, false);

        const helpless = ai[0] === STATE_ROOTED && localAI[2] !== 0;
        npc.dontTakeDamage = helpless;
        npc.chaseable = !helpless;

        if ((Main.GameUpdateCount + npc.whoAmI) % PETAL_RECOUNT_RATE === 0) {
            ai[2] = this._countPetals(npc);
        }

        if (ai[0] !== STATE_ROOTED) ai[1] += ai[2] < MAX_PETALS ? 1 : 2;

        if (ai[1] > WINDUP_AT) {
            if (ai[0] < STATE_WINDUP) ai[0] = STATE_WINDUP;
            if (ai[1] > ATTACK_AT) {
                if (ai[0] < STATE_ATTACK) ai[0] = STATE_ATTACK;
                if (ai[1] > RELEASE_AT && (localAI[0] >= FRAME_ATTACK_START || ai[1] > RELEASE_AT + 30)) {
                    ai[0] = STATE_IDLE;
                    ai[1] = 0;
                    npc.netUpdate = true;
                    if (ai[2] < MAX_PETALS) this._spawnPetals(npc, center);
                    else if (!player.dead) this._shootSpores(npc, center, player);
                }
            }
        }

        if (npc.life < npc.lifeMax * 0.66) this._updateEscape(npc);

        this._checkAnger(npc, center);
    }

    _setBuried(npc, buried) {
        npc.dontTakeDamage = buried;
        npc.chaseable = !buried;
        npc.damage = buried ? 0 : npc.defDamage;
    }

    _updateBurrow(npc, player) {
        this._setBuried(npc, true);

        if (npc.ai[1] === 0) {
            SoundHelper.play(SFX_BURROW, npc.Center.X, npc.Center.Y);
            this._teleportDust(npc.position, npc.width, npc.height, 20, -6, -4, 1.25);
        }

        if (++npc.ai[1] < BURROW_TIME) return;

        if (Main.netMode !== 1) {
            const spot = Vector2.new(0, 0);
            const tileX = Math.floor(player.Center.X / 16);
            const tileY = Math.floor(player.Center.Y / 16);
            if (npc[FindTeleportSpot](spot, tileX, tileY, 20, 5, 1, false, false)) {
                npc.position = Vector2.new(spot.X * 16 - npc.width / 2 + 8, spot.Y * 16 - npc.height);
                npc.velocity = Vector2.Zero;
                npc.netOffset = Vector2.Zero;
            }
        }

        npc.ai[0] = STATE_EMERGE;
        npc.ai[1] = 0;
        npc.localAI[2] = 0;
        npc.netUpdate = true;

        SoundHelper.play(SFX_EMERGE, npc.Center.X, npc.Center.Y);
        this._teleportDust(npc.position, npc.width, npc.height, 30, -12, -8, 1.5);
    }

    _updateEmerge(npc) {
        this._setBuried(npc, true);

        if (++npc.ai[1] < EMERGE_TIME) return;

        npc.ai[0] = STATE_IDLE;
        npc.ai[1] = 0;
        npc.ai[3] = 0;
        npc.localAI[0] = 0;
        this._setBuried(npc, false);
    }

    _countPetals(npc) {
        if (_petalType < 0) return MAX_PETALS;
        const npcs = Main.npc;
        const me = npc.whoAmI;
        let count = 0;
        for (let i = 0; i < Main.maxNPCs; i++) {
            const other = npcs[i];
            if (!other.active || other.type !== _petalType || other.localAI[2] !== me) continue;
            if (++count >= MAX_PETALS) break;
        }
        return count;
    }

    _spawnPetals(npc, center) {
        SoundHelper.play(SFX_SPAWN, center.X, center.Y);
        if (Main.netMode === 1 || _petalType < 0) return;

        const source = null;
        const x = center.X;
        const y = center.Y - 26;
        const count = Math.min(MAX_PETALS, MAX_PETALS - Math.floor(npc.ai[2]));

        for (let i = 0; i < count; i++) {
            const drift = i === 0 ? -2 : (i === 1 ? 2 : 0.1);
            const index = NewNPC(source, x, y, _petalType, 0, drift, 0, 0, 0, 255);
            if (index < Main.maxNPCs) Main.npc[index].localAI[2] = npc.whoAmI;
        }
        npc.ai[2] += count;
    }

    _shootSpores(npc, center, player) {
        SoundHelper.play(SFX_SHOOT, center.X, center.Y);
        if (Main.netMode === 1 || _proType < 0) return;

        const source = null;
        const away = player.Center.X < center.X;
        const minX = away ? -3 : 0.5;
        const maxX = away ? 0.5 : 3;
        const baseY = player.position.Y < center.Y - 20 ? -2 : 0;
        const x = center.X;
        const y = center.Y - 30;

        for (let i = 0; i < 6; i++) {
            NewProjectile(source, x, y,
                Rand.NextFloat(minX, maxX), Rand.NextFloat(baseY - 6, baseY - 4),
                _proType, 20, 5, Main.myPlayer, 0, 0, 0, null);
        }
    }

    _updateEscape(npc) {
        const ai = npc.ai;
        const enraged = npc.life < npc.lifeMax * 0.33;

        if (ai[1] < WINDUP_AT) ai[3] += enraged ? 2 : 1;

        if (ai[0] < STATE_ROOTED && ai[3] >= (enraged ? ROOT_DELAY_ENRAGED : ROOT_DELAY)) {
            ai[0] = STATE_ROOTED;
            npc.localAI[0] = FRAME_CLOSE_START;
            npc.netUpdate = true;
        }

        if (ai[3] < TELEPORT_DELAY) return;

        ai[3] = 0;
        ai[1] = 0;
        ai[0] = STATE_BURROW;
        npc.netUpdate = true;
    }

    _teleportDust(position, width, height, count, minY, maxY, scale) {
        const origin = Vector2.new(position.X, position.Y + 14);
        for (let i = 0; i < count; i++) {
            const dust = NewDustDirect(origin, width, height, DUST_LEAF,
                Rand.NextFloat(-4, 4), Rand.NextFloat(minY, maxY), 50, Color.White, scale);
            if (dust) dust.noGravity = true;
        }
    }

    _checkAnger(npc, center) {
        const localAI = npc.localAI;
        const stage = localAI[1];
        if (stage >= 3) return;

        const lifeMax = npc.lifeMax;
        if (stage === 0 && npc.life >= lifeMax * 0.75) return;
        if (stage === 1 && npc.life >= lifeMax * 0.5) return;
        if (stage === 2 && npc.life >= lifeMax * 0.25) return;

        localAI[1] = stage + 1;
        SoundHelper.play(SFX_ANGER, center.X, center.Y);

        if (Main.netMode !== 1 && _weedType >= 0) {
            const index = NewNPC(null, center.X, center.Y - 14, _weedType, 0, 0, 0, 0, 0, 255);
            if (index < Main.maxNPCs) Main.npc[index].localAI[2] = npc.whoAmI;
        }

        FxHelper.ring(center.X, center.Y, 30, 20, 20, DUST_LEAF, 4, 1.5, 0, 100);
    }

    OnHitByPlayer(npc, player, item, damageDone, knockBack) {
        if (npc.ai[0] !== STATE_ROOTED || npc.localAI[2] !== 0) return;

        const center = npc.Center;
        npc.ai[0] = STATE_IDLE;
        npc.ai[1] = 0;
        npc.ai[3] = STUN_SETBACK;
        npc.localAI[0] = 0;
        npc.localAI[2] = 1;
        npc.netUpdate = true;

        SoundHelper.play(SFX_STUN, center.X, center.Y);
        FxHelper.burst(npc.position, 20, 20, 10, DUST_GORE, 3, 1.35, 50);
        FxHelper.burst(npc.position, 20, 20, 20, DUST_LEAF, 4, 1.25, 100);
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 20, DUST_GORE, 2.5, 1.6, 0, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 20, DUST_LEAF, 2.5, 1.2, 0, false);
            return;
        }

        const count = Math.min(8, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) {
            Effects.NewDust(npc.position, npc.width, npc.height, DUST_LEAF, hitDirection, -1, 0, Color.White, 0.9);
        }
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.JungleSpores, 1, 8, 8));
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('WeedEater'), 1, 1, 1));
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('BloomGuard'), 1, 1, 1));
    }

    OnKill(npc) {
        WorldDB.set('Thorium:HasBeenDefeated_CorpseBloom', true);

        if (Main.netMode !== 1) {
            const npcs = Main.npc;
            const me = npc.whoAmI;
            for (let i = 0; i < Main.maxNPCs; i++) {
                const other = npcs[i];
                if (!other.active || other.localAI[2] !== me) continue;
                if (other.type === _petalType || other.type === _weedType) other.EncourageDespawn(10);
            }
        }

        MiscHelper.ThoriumChatMessage('CorpseBloomDefeat', Color.new(175, 75, 225));
    }
}
