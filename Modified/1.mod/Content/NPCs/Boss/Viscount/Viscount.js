import { Terraria, Microsoft, Modules } from '../../../../TL/ModImports.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { ModBuff } from '../../../../TL/ModBuff.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { WorldDB } from '../../../../TL/WorldDB.js';
import { MiscHelper } from '../../../Global/Utils/MiscHelper.js';
import { SoundHelper } from '../../../Global/Utils/SoundHelper.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';
import { BestiaryOrder } from '../../../Global/Utils/BestiaryOrder.js';

const MasterPetDrop = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];

const { Color, Vector2, Rand, Effects } = Modules;
const WHITE = Color.White;
const { Main } = Terraria;
const { ItemDropRule, Conditions } = Terraria.GameContent.ItemDropRules;
const IItemDropRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'IItemDropRule');
const OneFromRulesRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'OneFromRulesRule');
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const CountNPCS = Terraria.NPC['int CountNPCS(int Type)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];
const GetLight = Terraria.Lighting['Color GetColor(int x, int y)'];
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const HOVER_HEIGHT = 250;   // altura em que ele paira acima do jogador
const HOVER_BOB = 60;       // amplitude do sobe-e-desce
const HOVER_BOB_SPEED = 1.4;
const STEER = 0.05;         // suavidade da aproximacao (menor = mais macio)
const MAX_SPEED_X = 5.5;
const MAX_SPEED_Y = 7;
const FACING_DEADZONE = 110; // px que o jogador precisa passar do centro pra ele virar
// Ele se posta de lado (nao em cima) e so troca de posto de tempos em tempos
const PERCH_MIN = 130;
const PERCH_MAX = 340;
const PERCH_TIME = 180;
const PERCH_CHASE = 800;    // acima disso ele corta caminho direto pro jogador
const STOMP_SINK = 10;      // aumenta = ele para mais perto/dentro do chao no pisao
const MAX_BITEY_BABIES = 6; // teto de morcegos vivos (cada mordida cura o boss)
const STOMPED_DURATION = 90; // janela de dano melee 3x depois do pisao
const SCREAM_DURATION = 60;
const ROCK_COUNT = 7;      // pedras por grito
const SCREAM_WAVES = 8;   // marcadores invisiveis do grito (so efeito)

// Maldicao do morcego (so no expert, abaixo de 33%)
const CURSE_INTERVAL = 1600;   // ~15s entre uma maldicao e outra
const CURSE_WARNING = 240;    // 4s de aneis vermelhos antes de pegar
const CURSE_RANGE_SQ = 1562500; // 1250px

const LIFE_CLASSIC = 5000;
const LIFE_EXPERT = 7000;
const LIFE_MASTER = 8925;

// Frames (142x1978 = 23 frames de 86px): 0-8 voo | 9-13 pisao | 14-17 atordoado | 19-22 grito
const FRAME_COUNT = 23;

const ATK_BLOOD = 0;
const ATK_STOMP = 1;
const ATK_SCREAM = 2;
const ATK_BABIES = 3;

const SFX_ECHO = ['DD2_DrakinBreathIn'];
const SFX_BLOOD = ['Item87', 'Item20'];
const SFX_SCREAM = ['DD2_LightningBugHurt'];
const SFX_SUMMON = ['Zombie40', 'NPCHit32', 'NPCHit1'];
const SFX_CURSE = ['Zombie100', 'NPCDeath43', 'NPCDeath1'];
const SFX_CURSE_WARN = ['Zombie104', 'NPCHit28', 'NPCHit1'];

let _rippleType = -1, _ripple2Type = -1, _ripple3Type = -1;
let _bloodType = -1, _rockSummonType = -1, _rockSummon2Type = -1;
let _stompType = -1, _stomp2Type = -1, _screamType = -1;
let _biteyType = -1, _curseBuff = -1;
let _typesInit = false;

function initTypes() {
    if (_typesInit) return;
    _typesInit = true;
    _rippleType = ModProjectile.getTypeByName('ViscountRipple');
    _ripple2Type = ModProjectile.getTypeByName('ViscountRipple2');
    _ripple3Type = ModProjectile.getTypeByName('ViscountRipple3');
    _bloodType = ModProjectile.getTypeByName('ViscountBlood');
    _rockSummonType = ModProjectile.getTypeByName('ViscountRockSummon');
    _rockSummon2Type = ModProjectile.getTypeByName('ViscountRockSummon2');
    _stompType = ModProjectile.getTypeByName('ViscountStomp');
    _stomp2Type = ModProjectile.getTypeByName('ViscountStomp2');
    _screamType = ModProjectile.getTypeByName('CountScream');
    _biteyType = ModNPC.getTypeByName('BiteyBaby');

    _curseBuff = ModBuff.getTypeByName('VampiresCurseBuff') ?? -1;
}

function hasBuff(entity, type) {
    if (!type || type < 0) return false;
    return entity.FindBuffIndex(type) > -1;
}

function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
}

// Topo do primeiro tile solido abaixo de (x, y)
function groundBelow(x, y) {
    const tileX = Math.floor(x / 16);
    const tileY = Math.floor(y / 16);
    for (let i = 0; i < 40; i++) {
        if (MiscHelper.SolidTileAt(tileX, tileY + i)) return (tileY + i) * 16;
    }
    return null;
}

export class Viscount extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/Viscount/' + this.constructor.name;
        this._resetState();

        this._glowMouth = null;
        this._glowBlood = null;
        this._swordTex = null;
        this._texLoaded = false;
    }

    _resetState() {
        this.counting = 0;
        this.counter = 0;
        this.rage = 15;
        this.flux = 0;
        this.shift = false;
        this.perchSide = Math.random() < 0.5 ? -1 : 1;
        this.perchDist = PERCH_MIN;
        this.perchTimer = 0;
        this.openMouth = false;
        this.blood = false;
        this.stomp = false;
        this.stomped = false;
        this.scream = false;
        this.stompedTimer = 0;
        this.screamTimer = 0;
    }

    _loadTextures() {
        if (this._texLoaded) return;
        this._texLoaded = true;
        try { this._glowMouth = tl.texture.load('Textures/NPCs/Boss/Viscount/Viscount_Glow1.png'); } catch (_) { }
        try { this._glowBlood = tl.texture.load('Textures/NPCs/Boss/Viscount/Viscount_Glow.png'); } catch (_) { }
        try { this._swordTex = tl.texture.load('Textures/Projectiles/Sword_Indicator.png'); } catch (_) { }
    }

    DeathMessage = (npc) => {
        return Terraria.Localization.Language.GetText('Announcement.HasBeenDefeated_Single'
        ).Value.replace('{0}', ModLocalization.Translate('NPCName.Viscount'));
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAME_COUNT;
        Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
        this.BestiaryRarityStars = 3;

        // TODO: trocar por "Bat Ballad" se entrar suporte a musica custom
        this.Music = Terraria.ID.MusicID.Boss5;
    }

    PostSetupContent() {
        BestiaryOrder.BossAfter(this.Type, 266);
    }

    SetDefaults() {
        this.NPC.width = 70;
        this.NPC.height = 70;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 30;
        this.NPC.defense = 8;
        this.NPC.lifeMax = 5000;
        this.NPC.scale = 1.2;
        this.NPC.npcSlots = 25;
        this.NPC.boss = true;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.lavaImmune = true;
        this.NPC.knockBackResist = 0.0;
        this.NPC.HitSound = SoundHelper.resolve('NPCHit13', 'NPCHit1');
        this.NPC.DeathSound = SoundHelper.resolve('NPCDeath38', 'NPCDeath4', 'NPCDeath1');
        this.NPC.value = ModNPC.NPCValue(0, 5, 0, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    }

    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        let lifeMax = LIFE_CLASSIC;
        if (Main.masterMode) lifeMax = LIFE_MASTER;
        else if (Main.expertMode) lifeMax = LIFE_EXPERT;

        npc.lifeMax = Math.floor(lifeMax * balance);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
    }

    OnSpawn(npc) {
        initTypes();
        this._resetState();
    }

    ModifyNPCLoot(npcLoot) {
        // Classico: drops soltos. Expert/Master: so a bolsa (que contem tudo).
        const notExpert = Conditions.NotExpert.new();

        npcLoot.Add(ItemDropRule.ByCondition(notExpert, Terraria.ID.ItemID.HealingPotion, 1, 5, 15, 1));
        npcLoot.Add(ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('ViscountMask'), 7, 1, 1, 1));

        // Uma arma por vitoria. TODO: Dracula Fang e trofeu.
        const options = [
            ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('BatWing'), 1, 1, 1, 1),
            ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('GuanoGunner'), 1, 1, 1, 1),
            ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('VampireScepter'), 1, 1, 1, 1),
            ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('ViscountCane'), 1, 1, 1, 1),
            ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('BatScythe'), 1, 1, 1, 1),
            ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('SonarCannon'), 1, 1, 1, 1)
        ].makeGeneric(IItemDropRule);

        const oneDropRule = OneFromRulesRule.new();
        oneDropRule['void .ctor(int chanceDenominator, IItemDropRule[] options)'](1, options);
        npcLoot.Add(oneDropRule);

        npcLoot.Add(ItemDropRule.BossBag(ModItem.getTypeByName('ViscountTreasureBag')));
    }

    // Corpo-a-corpo causa 3x enquanto ele esta atordoado pos-pisao
    OnHitByPlayer(npc, player, item, damageDone, knockBack) {
        if (!this.stomped || damageDone <= 0) return;

        const bonus = Math.floor(damageDone * 2);
        try {
            npc['double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)'](
                bonus, 0, player.direction, false, false, false
            );
        } catch (_) {
            npc.life = Math.max(0, npc.life - bonus);
        }

        FxHelper.burst(npc.position, npc.width, npc.height, 8, 5, 4, 1.6);
    }

    FindFrame(npc, frameHeight) {
        if (this.scream) {
            if (++this.counting > 10 && this.counter < 22) {
                this.counter++;
                this.counting = 0;
            }
        } else if (this.stomp) {
            if (++this.counting > 4 && this.counter < 13) {
                this.counter++;
                this.counting = 0;
            }
        } else if (this.stomped) {
            if (this.counter < 17) {
                if (++this.counting > 6) {
                    this.counter++;
                    this.counting = 0;
                }
            } else {
                this.counter = 17;
            }
        } else {
            if (++this.counting > 4) {
                this.counter = (this.counter + 1) % 9;
                this.counting = 0;
            }
        }

        const frame = npc.frame;
        frame.Y = this.counter * frameHeight;
        npc.frame = frame;
    }

    PostDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();
        if (!this.openMouth && !this.blood && !this.stomped) return;

        const frame = npc.frame;
        const drawPos = Vector2.new(npc.Center.X - screenPos.X, npc.Center.Y - screenPos.Y);
        const origin = Vector2.new(frame.Width / 2, frame.Height / 2 + 4);
        const color = GetLight(Math.floor(npc.Center.X / 16), Math.floor(npc.Center.Y / 16));
        const effects = npc.spriteDirection < 0 ? SpriteEffects.None : SpriteEffects.FlipHorizontally;
        const Draw = spriteBatch[DRAW];

        if (this.openMouth && this._glowMouth) {
            Draw(this._glowMouth, drawPos, frame, color, npc.rotation, origin, npc.scale, effects, 0);
        }
        if (this.blood && this._glowBlood) {
            Draw(this._glowBlood, drawPos, frame, color, npc.rotation, origin, npc.scale, effects, 0);
        }
        if (this.stomped && this._swordTex) {
            Draw(this._swordTex, drawPos, null, WHITE, 0, Vector2.new(this._swordTex.Width / 2, 90), 1, SpriteEffects.None, 0);
        }
    }

    AI(npc) {
        initTypes();

        let player = Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || !player || player.dead || !player.active) {
            npc.TargetClosest(true);
            player = Main.player[npc.target];
        }

        if (!player || !player.active || player.dead) {
            this.openMouth = this.blood = this.stomp = this.stomped = this.scream = false;
            const v = npc.velocity;
            v.Y += 0.1;
            npc.velocity = v;
            npc.EncourageDespawn(10);
            return;
        }

        let source = null;
        const spawnSource = () => source ?? (source = null);
        const vel = npc.velocity;
        const npcCenter = npc.Center;
        const playerCenter = player.Center;

        // Estados travados sao cronometrados aqui (FindFrame so roda no cliente)
        if (this.stomped) {
            if (++this.stompedTimer > STOMPED_DURATION) {
                this.stomped = false;
                this.stompedTimer = this.counter = this.counting = 0;
            }
        }
        if (this.scream) {
            if (++this.screamTimer > SCREAM_DURATION) {
                this.scream = false;
                this.screamTimer = this.counter = this.counting = 0;
            }
        }

        const dx = playerCenter.X - npcCenter.X;
        const dy = playerCenter.Y - npcCenter.Y;
        const distSQ = dx * dx + dy * dy;
        const locked = this.stomp || this.stomped;

        if (!locked && Math.abs(dx) > FACING_DEADZONE) {
            npc.spriteDirection = dx <= 0 ? 1 : -1;
        }

        // ---- Voo: ele se posta de lado do jogador e troca de posto sozinho ----
        if (!locked && !this.scream) {
            this.flux += this.shift ? -HOVER_BOB_SPEED : HOVER_BOB_SPEED;
            if (this.flux > HOVER_BOB) this.shift = true;
            else if (this.flux < -HOVER_BOB) this.shift = false;

            const arrived = Math.abs(dx) > PERCH_MIN * 0.5 &&
                Math.abs(Math.abs(dx) - this.perchDist) < 40 &&
                Math.sign(dx) === -this.perchSide;

            if (--this.perchTimer <= 0 || arrived && this.perchTimer < PERCH_TIME * 0.4) {
                // Costuma trocar de lado, mas nem sempre: fica menos previsivel
                this.perchSide = Math.random() < 0.7 ? -this.perchSide : this.perchSide;
                this.perchDist = PERCH_MIN + Math.random() * (PERCH_MAX - PERCH_MIN);
                this.perchTimer = PERCH_TIME + Rand.Next(0, 120);
            }

            const chasing = Math.abs(dx) > PERCH_CHASE;
            const targetX = chasing ? playerCenter.X : playerCenter.X + this.perchSide * this.perchDist;
            const targetY = playerCenter.Y - HOVER_HEIGHT + this.flux;

            const desiredX = clamp((targetX - npcCenter.X) * 0.035, -MAX_SPEED_X, MAX_SPEED_X);
            const desiredY = clamp((targetY - npcCenter.Y) * 0.05, -MAX_SPEED_Y, MAX_SPEED_Y);

            vel.X += (desiredX - vel.X) * STEER;
            vel.Y += (desiredY - vel.Y) * STEER * 1.4;
        }

        npc.ai[0]++;
        npc.ai[2]++;

        const life = npc.life / npc.lifeMax;
        this.rage = life >= 0.25 ? (life >= 0.5 ? (life >= 0.75 ? 15 : 30) : 45) : 60;

        if (npc.ai[0] === 0) {
            if (life < 0.6) npc.ai[1] = Rand.Next(4);
            else if (life < 0.75) npc.ai[1] = Rand.Next(3);
            else if (life < 0.9) npc.ai[1] = Rand.Next(2);
            else npc.ai[1] = ATK_BLOOD;
            npc.TargetClosest(true);
        }

        // ---- Echo shots ----
        if (!locked && !this.blood && !this.scream) {
            if (npc.ai[2] === 0) this.openMouth = false;

            const ready = npc.ai[2] >= (100 - this.rage);
            const cursed = (ready || npc.ai[2] >= 0) && hasBuff(player, _curseBuff);

            let mouthX = 0, mouthY = 0, dirX = 0, dirY = 0;
            if (ready || cursed) {
                mouthX = npcCenter.X;
                mouthY = npcCenter.Y - 10;
                const ddx = playerCenter.X - mouthX;
                const ddy = playerCenter.Y - mouthY;
                const len = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
                dirX = ddx / len;
                dirY = ddy / len;
            }

            if (ready && !cursed) {
                const blocked = !CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height);

                if (blocked && _ripple2Type >= 0) {
                    NewProjectile(spawnSource(), mouthX, mouthY, dirX * 12, dirY * 12, _ripple2Type, 20, 0, Main.myPlayer, 0, 0, 0, null);
                    npc.ai[2] = -10;
                } else if (distSQ > 250000 && _ripple3Type >= 0) {
                    NewProjectile(spawnSource(), mouthX, mouthY, dirX * 12, dirY * 12, _ripple3Type, 20, 0, Main.myPlayer, 0, 0, 0, null);
                    npc.ai[2] = -20;
                } else if (_rippleType >= 0) {
                    NewProjectile(spawnSource(), mouthX, mouthY, dirX * 7.5, dirY * 7.5, _rippleType, 15, 0, Main.myPlayer, 0, 0, 0, null);
                    npc.ai[2] = -20;
                }

                SoundHelper.play(SFX_ECHO, npcCenter.X, npcCenter.Y);
                this.openMouth = true;
            } else if (npc.ai[2] >= 0 && cursed && _ripple2Type >= 0) {
                NewProjectile(spawnSource(), mouthX, mouthY, dirX * 6, dirY * 6, _ripple2Type, 10, 0, Main.myPlayer, 0, 0, 0, null);
                SoundHelper.play(SFX_ECHO, npcCenter.X, npcCenter.Y);
                this.openMouth = true;
                npc.ai[2] = -20;
            }
        } else {
            this.openMouth = false;
            npc.ai[2] = -60;
        }

        // ---- Ataque 0: blood splash ----
        if (npc.ai[1] === ATK_BLOOD) {
            if (npc.ai[0] === 60) {
                FxHelper.ring(npcCenter.X, npcCenter.Y, 18, 50, 50, 90, 3.25, 1.25, Math.atan2(vel.Y, vel.X), 100, true);
            }

            if (npc.ai[0] > 60) {
                this.blood = true;

                const t = npc.ai[0] + this.rage;
                if (t === 130 || t === 190 || t >= 250) {
                    const count = t === 130 ? 3 : (t === 190 ? 8 : 13);
                    for (let i = 0; i < count && _bloodType >= 0; i++) {
                        NewProjectile(
                            source, npcCenter.X, npcCenter.Y,
                            Rand.NextFloat(-3, 3), Rand.NextFloat(-4, -2),
                            _bloodType, 15, 0, Main.myPlayer, 0, 0, 0, null
                        );
                    }
                    if (t >= 250) npc.ai[0] = -180 - this.rage;
                } else if (t === 129 || t === 189 || t === 249) {
                    SoundHelper.play(SFX_BLOOD, npcCenter.X, npcCenter.Y);
                    FxHelper.ring(npcCenter.X, npcCenter.Y, 14, 20, 20, 5, 5, 1.5, Math.atan2(vel.Y, vel.X));
                }
            } else {
                this.blood = false;
            }
        }

        // ---- Ataque 1: pisao ----
        else if (npc.ai[1] === ATK_STOMP) {
            if (npc.ai[0] >= 300 && !this.stomp && !this.stomped &&
                CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height)) {
                this.stomp = true;
                this.counter = 9;
                this.counting = 0;
                vel.Y = -5;
                npc.ai[0] = 301;
            }

            if (this.stomp) {
                vel.X = 0;
                vel.Y = Math.min(vel.Y + 0.32, 19);

                const timedOut = npc.ai[0] >= 390;
                const grounded = vel.Y > 0 &&
                    SolidCollision(Vector2.new(npc.position.X, npc.position.Y + npc.height - STOMP_SINK), npc.width, 24);

                if (npc.ai[0] >= 345 && (timedOut || (grounded && npc.Bottom.Y > player.Bottom.Y - 20))) {
                    this.stomp = false;
                    vel.Y = 0;
                    this.counter = 14;
                    this.counting = 0;

                    if (timedOut) {
                        npc.ai[0] = -60;
                    } else {
                        // Encosta certinho no chao antes de tocar a onda
                        const ground = groundBelow(npcCenter.X, npc.Bottom.Y);
                        if (ground !== null) {
                            npc.position = Vector2.new(npc.position.X, ground - npc.height + STOMP_SINK);
                        }

                        if (_stompType >= 0) {
                            NewProjectile(spawnSource(), npc.Center.X, npc.Center.Y + 60, 0, 1, _stompType, 30, 0, Main.myPlayer, 1, 0, 0, null);
                        }
                        if (_stomp2Type >= 0 && Vector2.DistanceSquared(playerCenter, npc.Center) < 250000) {
                            NewProjectile(spawnSource(), playerCenter.X, playerCenter.Y, Rand.NextFloat(-0.25, 0.25), 0, _stomp2Type, 30, 0, Main.myPlayer, 0, 0, 0, null);
                        }

                        this.stomped = true;
                        this.stompedTimer = 0;
                        npc.ai[0] = -150 - this.rage;
                    }
                }
            }

            if (this.stomped) vel.Y = 0;
        }

        // ---- Ataque 2: grito + queda de pedras ----
        else if (npc.ai[1] === ATK_SCREAM) {
            if (npc.ai[0] >= 60) {
                vel.X = 0;
                vel.Y = 0.1;
            }

            const t = npc.ai[0] + this.rage;

            if (t === 160) {
                this.scream = true;
                this.screamTimer = 0;
                this.counter = 19;
                this.counting = 0;
            }

            if (t === 180) {
                SoundHelper.play(SFX_SCREAM, npcCenter.X, npcCenter.Y);

                if (_screamType >= 0) {
                    NewProjectile(spawnSource(), npcCenter.X, npcCenter.Y - 20, npc.spriteDirection * 0.1, 0, _screamType, 0, 0, Main.myPlayer, 0, 0, 0, null);
                }
                for (let i = 0; i < ROCK_COUNT && _rockSummonType >= 0; i++) {
                    NewProjectile(
                        source, playerCenter.X + Rand.Next(-300, 300), playerCenter.Y + 16,
                        0, Rand.NextFloat(-12, -8), _rockSummonType, 25, 0, Main.myPlayer, 0, 0, 0, null
                    );
                }
                for (let i = 0; i < SCREAM_WAVES && _rockSummon2Type >= 0; i++) {
                    NewProjectile(
                        source, npcCenter.X, npcCenter.Y,
                        Rand.NextFloat(-8, 8), Rand.NextFloat(-8, 8), _rockSummon2Type, 0, 0, Main.myPlayer, 0, 0, 0, null
                    );
                }
                FxHelper.ring(npcCenter.X, npcCenter.Y, 20, 30, 30, 110, 4, 1.5);
            } else if (t === 185) {
                FxHelper.ring(npcCenter.X, npcCenter.Y, 20, 30, 30, 110, 6, 1.5);
            } else if (t >= 190) {
                FxHelper.ring(npcCenter.X, npcCenter.Y, 20, 30, 30, 110, 8, 1.5);
                npc.ai[0] = -120 - this.rage;
            }
        }

        // ---- Ataque 3: Bitey Babies ----
        else if (npc.ai[1] === ATK_BABIES && npc.ai[0] >= 90) {
            SoundHelper.play(SFX_SUMMON, npcCenter.X, npcCenter.Y);

            if (_biteyType >= 0 && CountNPCS(_biteyType) <= MAX_BITEY_BABIES - 3) {
                const cx = npcCenter.X | 0;
                const cy = npcCenter.Y | 0;
                NewNPC(spawnSource(), cx - 40, cy + 10, _biteyType, 0, 0, 0, 0, 0, npc.target);
                NewNPC(spawnSource(), cx, cy + 30, _biteyType, 0, 0, 0, 0, 0, npc.target);
                NewNPC(spawnSource(), cx + 40, cy + 10, _biteyType, 0, 0, 0, 0, 0, npc.target);
            }

            FxHelper.burst(npc.position, npc.width, npc.height, 12, 5, 8, 1.5);

            npc.ai[0] = -180 - this.rage;
        }

        npc.velocity = vel;

        // ---- Expert <= 33%: Vampire's Curse ----
        // Ciclo: CURSE_INTERVAL de espera, com os ultimos CURSE_WARNING ticks
        // marcados por aneis vermelhos cada vez mais rapidos em volta do jogador.
        if (npc.life >= npc.lifeMax * 0.33 || !Main.expertMode) return;

        npc.ai[3]++;
        const untilCurse = CURSE_INTERVAL - npc.ai[3];
        const inRange = Vector2.DistanceSquared(playerCenter, npcCenter) < CURSE_RANGE_SQ;

        if (untilCurse === CURSE_WARNING) {
            SoundHelper.play(SFX_CURSE_WARN, npcCenter.X, npcCenter.Y);
        }

        if (untilCurse > 0) {
            if (untilCurse > CURSE_WARNING || !inRange) return;

            const step = untilCurse > 150 ? 30 : (untilCurse > 60 ? 15 : 8);
            if (npc.ai[3] % step === 0) {
                const grow = 1 - untilCurse / CURSE_WARNING;
                FxHelper.ring(playerCenter.X, playerCenter.Y, 16, 50, 50, 90, 3, 1.25 + grow, 0, 100, true);
            }
            return;
        }

        SoundHelper.play(SFX_CURSE, npcCenter.X, npcCenter.Y);
        FxHelper.burst(npc.position, npc.width, npc.height, 12, 90, 8, 1);
        FxHelper.ring(npcCenter.X, npcCenter.Y, 24, 40, 40, 90, 10, 1.75, Math.atan2(vel.Y, vel.X));

        if (_curseBuff > 0 && inRange && !hasBuff(player, 156) && !hasBuff(player, _curseBuff)) {
            player.AddBuff(_curseBuff, 600, false);
            FxHelper.ring(player.Center.X, player.Center.Y, 14, 50, 50, 5, 3, 1.25, 0, 75, true);
        }

        if (npc.ai[1] !== ATK_STOMP) npc.ai[0] = -300;
        npc.ai[2] = -60;
        npc.ai[3] = 0;
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 14, 54, 3, 1.25, 100, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 14, 5, 2, 2, 150, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) {
            Effects.NewDust(npc.position, npc.width, npc.height, 5, hitDirection, -1, 150, WHITE, 2);
        }
    }

    // A BloodAltar checa essa chave pra liberar a quebra do altar
    OnKill(npc) {
    if (Math.random() < 0.25 && Terraria.Main.masterMode) {
        MasterPetDrop(npc.position.X, npc.position.Y, npc.width, npc.height,
            ModItem.getTypeByName('BloodSausage'), 1, false, 0, false);
    }

        WorldDB.set('Thorium:HasBeenDefeated_Viscount', true);
    }
}
