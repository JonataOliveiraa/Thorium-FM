import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { SoundHelper } from '../../Global/Utils/SoundHelper.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const FindTeleportSpot = 'bool AI_AttemptToFindTeleportSpot(ref Vector2 chosenTile, int targetTileX, int targetTileY, int rangeFromTargetTile, int telefragPreventionDistanceInTiles, int solidTileCheckFluff, bool solidTileCheckCentered, bool teleportInAir)';

const PHASE_IDLE = 0;
const PHASE_CHARGING = 1;
const PHASE_ATTACKING = 2;
const PHASE_MOVING = 3;
const CHARGE_AT = 0;
const ATTACK_AT = 60;
const SHOOT_AT = 80;
const CYCLE_END = 90;
const CYCLE_RESET = -180;
const MOVE_LOCKOUT = -120;

const MOVE_WARNING = 560;
const MOVE_AT = 600;
const SPAWN_TIMER = 650;
const FAR_RANGE_SQ = 122500;

const FALL_SPEED = 5;
const GROUND_SEARCH = 60;

const FRAME_COUNT = 25;
const DRAW_OFFSET_Y = 5;
const DUST_GORE = 5;
const DUST_LEAF = 39;

const SFX_MOVE = ['Grass'];
const SFX_SHOOT = ['NPCDeath9'];

let _proType = -1;

export class CorpseWeed extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Jungle/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAME_COUNT;
        Terraria.ID.NPCID.Sets.CantTakeLunchMoney[this.Type] = true;
        Terraria.ID.NPCID.Sets.DontDoHardmodeScaling[this.Type] = true;
    }

    SetDefaults() {
        this.NPC.width = 18;
        this.NPC.height = 32;
        this.NPC.lifeMax = 200;
        this.NPC.damage = 25;
        this.NPC.defense = 0;
        this.NPC.aiStyle = -1;
        this.NPC.npcSlots = 4;
        this.NPC.knockBackResist = 0;
        this.NPC.noGravity = false;
        this.NPC.noTileCollide = false;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = 0;
    }

    ApplyBuffImmunity(npc) {
        const immune = npc.buffImmune;
        for (let i = 0; i < immune.length; i++) immune[i] = true;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.UndergroundJungle);
        const flavor = FlavorTextBestiaryInfoElement.new();
        flavor._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(flavor);
    }

    OnSpawn(npc) {
        npc.ai[0] = SPAWN_TIMER;
        npc.localAI[2] = 255;
        if (_proType < 0) _proType = ModProjectile.getTypeByName('CorpseWeedPro') ?? -1;
        this._snapToGround(npc);
    }

    FindFrame(npc, frameHeight) {
        const localAI = npc.localAI;
        const phase = localAI[1];
        let counter = localAI[0];

        if (phase === PHASE_MOVING) {
            if (counter < 17) counter = 17;
            npc.frameCounter++;
            if (npc.frameCounter > 6) {
                counter++;
                if (counter >= FRAME_COUNT - 1) counter = FRAME_COUNT - 1;
                npc.frameCounter = 0;
            }
        } else if (phase === PHASE_CHARGING) {
            if (counter < 8) counter = 8;
            npc.frameCounter++;
            if (npc.frameCounter > 4) {
                counter++;
                if (counter > 12) counter = 11;
                npc.frameCounter = 0;
            }
        } else if (phase === PHASE_ATTACKING) {
            if (counter < 13) counter = 13;
            npc.frameCounter++;
            if (npc.frameCounter > 5) {
                counter++;
                if (counter >= 16) counter = 16;
                npc.frameCounter = 0;
            }
        } else {
            if (counter >= 8) counter = 0;
            npc.frameCounter++;
            if (npc.frameCounter > 6) {
                counter++;
                if (counter > 7) counter = 0;
                npc.frameCounter = 0;
            }
        }

        localAI[0] = counter;

        const frame = npc.frame;
        frame.Y = counter * frameHeight;
        npc.frame = frame;

        npc.gfxOffY = DRAW_OFFSET_Y;
    }

    AI(npc) {
        npc.TargetClosest(true);

        const player = Main.player[npc.target];
        const ai = npc.ai;
        const localAI = npc.localAI;

        npc.gfxOffY = DRAW_OFFSET_Y;

        if (!player || !player.active || player.dead) {
            ai[1] = MOVE_LOCKOUT;
            npc.velocity = Vector2.new(0, FALL_SPEED);
            npc.EncourageDespawn(10);
            return;
        }

        const center = npc.Center;
        const pCenter = player.Center;

        Effects.AddLight(center, 0.12, 0.25, 0.12);
        npc.spriteDirection = pCenter.X > center.X ? 1 : -1;

        const vel = npc.velocity;
        vel.Y = FALL_SPEED;
        vel.X = Math.abs(vel.X) < 0.1 ? 0 : vel.X * 0.93;
        npc.velocity = vel;

        ai[1]++;

        if (localAI[1] === PHASE_IDLE || localAI[1] === PHASE_MOVING) {
            ai[0]++;
            const dx = pCenter.X - center.X;
            const dy = pCenter.Y - center.Y;
            if (ai[0] < MOVE_WARNING - 4 && dx * dx + dy * dy > FAR_RANGE_SQ) ai[0] += 4;
        }

        if (ai[0] >= MOVE_WARNING) {
            localAI[1] = PHASE_MOVING;
            if (localAI[0] < 9) localAI[0] = 9;
            ai[1] = MOVE_LOCKOUT;
        }

        if (ai[0] >= MOVE_AT && Main.netMode !== 1) {
            ai[0] = 0;
            npc.netUpdate = true;

            const spot = Vector2.new(0, 0);
            const tileX = Math.floor(pCenter.X / 16);
            const tileY = Math.floor(pCenter.Y / 16);

            if (npc[FindTeleportSpot](spot, tileX, tileY, 20, 5, 1, false, false)) {
                this._teleport(npc, spot.X, spot.Y);
                return;
            }
            localAI[1] = PHASE_IDLE;
            localAI[0] = 0;
        }

        if (localAI[1] === PHASE_MOVING) return;

        if (ai[1] >= CHARGE_AT) localAI[1] = PHASE_CHARGING;
        if (ai[1] >= ATTACK_AT) localAI[1] = PHASE_ATTACKING;

        if (ai[1] === SHOOT_AT) this._shoot(npc, center, pCenter);

        if (ai[1] > CYCLE_END) {
            localAI[1] = PHASE_IDLE;
            ai[1] = CYCLE_RESET;
            npc.netUpdate = true;
        }
    }

    _shoot(npc, center, pCenter) {
        SoundHelper.play(SFX_SHOOT, center.X, center.Y);
        if (_proType < 0) _proType = ModProjectile.getTypeByName('CorpseWeedPro') ?? -1;
        if (Main.netMode === 1 || _proType < 0) return;

        const x = center.X + npc.spriteDirection * 10;
        const y = center.Y - 18;
        const aim = Vector2.SafeNormalize(Vector2.new(pCenter.X - x, pCenter.Y - y), Vector2.UnitX);

        NewProjectile(null, x, y, aim.X * 8, aim.Y * 8, _proType, 25, 0, Main.myPlayer, 0, 0, 0, null);
    }

    _snapToGround(npc) {
        const tileX = Math.floor(npc.Center.X / 16);
        const tileY = Math.floor((npc.position.Y + npc.height) / 16);

        for (let i = 0; i < GROUND_SEARCH; i++) {
            if (!MiscHelper.SolidOrSolidTopTileAt(tileX, tileY + i)) continue;
            npc.position = Vector2.new(npc.position.X, (tileY + i) * 16 - npc.height);
            npc.velocity = Vector2.Zero;
            return;
        }
    }

    _teleport(npc, destX, destY) {
        SoundHelper.play(SFX_MOVE, npc.Center.X, npc.Center.Y);
        this._teleportDust(npc.position, npc.width, npc.height, 15, -3, 3, 1.25);

        npc.position = Vector2.new(destX * 16 - npc.width / 2 + 8, destY * 16 - npc.height);
        npc.velocity = Vector2.Zero;
        npc.netOffset = Vector2.Zero;

        npc.localAI[1] = PHASE_IDLE;
        npc.localAI[0] = 0;

        this._teleportDust(npc.position, npc.width, npc.height, 25, -10, -6, 1.5);
    }

    _teleportDust(position, width, height, count, minY, maxY, scale) {
        const origin = Vector2.new(position.X, position.Y + 14);
        for (let i = 0; i < count; i++) {
            const dust = NewDustDirect(origin, width, height, DUST_LEAF,
                Rand.NextFloat(-3, 3), Rand.NextFloat(minY, maxY), 75, Color.White, scale);
            if (dust) dust.noGravity = true;
        }
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 10, DUST_LEAF, 2.5, 1, 0, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 10, DUST_GORE, 2.5, 1, 0, false);
            return;
        }

        const count = Math.min(5, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) {
            Effects.NewDust(npc.position, npc.width, npc.height, DUST_LEAF, hitDirection, -1, 0, Color.White, 0.75);
        }
    }
}
