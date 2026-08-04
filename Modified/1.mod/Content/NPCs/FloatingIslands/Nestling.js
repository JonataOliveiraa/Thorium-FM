import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const ANIM_SOURCE = 252;

const HOVER_ABOVE = 170;      // altura que ele tenta manter sobre voce
const HOVER_DEADZONE = 70;    // folga vertical: sem isso ele briga pela altura
const SPEED = 4.6;
const MAX_SPEED_X = 6.5;
const MAX_SPEED_Y = 5.5;
const ACCEL = 0.035;           // inercia: baixo = curva larga, voo solto
const WOBBLE = 0.07;          // velocidade do bater de asas
const WOBBLE_STRENGTH = 1.5;  // o quanto ele serpenteia no caminho
const REAIM_MIN = 70;         // de quantos em quantos ticks ele erra o rumo
const REAIM_MAX = 130;
const ANGLE_JITTER = 0.3;     // desvio de rumo em radianos
const FACE_DEADZONE = 0.9;    // so vira de lado com velocidade acima disso

const HOVER_MIN = 240;
const HOVER_MAX = 420;
const SWOOP_MIN = 90;
const SWOOP_MAX = 150;
const SWOOP_SPEED = 1.20;

const SHOT_COOLDOWN = 280; 
const SHOT_SPEED = 8;
const SHOT_DAMAGE = 12;

let _attackType = -1;

export class Nestling extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/FloatingIslands/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = Main.npcFrameCount[ANIM_SOURCE];
    }

    SetDefaults() {
        this.NPC.width = 32;
        this.NPC.height = 32;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 20;
        this.NPC.defense = 2;
        this.NPC.lifeMax = 75;
        this.NPC.knockBackResist = 0.8;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath4;
        this.NPC.value = ModNPC.NPCValue(0, 0, 2, 0);

        this.AnimationType = ANIM_SOURCE;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || info.Water) return 0;
        if (!info.Sky) return 0;
        return 0.4;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Sky);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Nestling');
        bestiaryEntry.Info.Add(FlavorText);
    }

    /**
     * ai[0] = fase do bater de asas | ai[2] = tempo ate a proxima cuspida
     * localAI[0] = quando refazer a mira | localAI[1] = desvio de rumo atual
     * localAI[2] = pressa desta investida | localAI[3] = ciclo pairar/mergulhar
     *
     * O C# roda a BatAI da vanilla antes e so aplica um vies por cima. Como a
     * BatAI nativa e bugada no TL, o voo inteiro e feito aqui.
     */
    AI(npc) {
        let player = Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || !player || !player.active || player.dead) {
            npc.TargetClosest(true);
            player = Main.player[npc.target];
        }
        if (!player || !player.active || player.dead) return;

        const center = npc.Center;
        const playerCenter = player.Center;

        // Alterna entre pairar la em cima e mergulhar em cima de voce
        const swooping = this._updateSwoop(npc);

        // No mergulho ele vem direto em voce. Pairando ele fica acima, mas se
        // voce subir acima dele, ele para de fugir pro alto e vai atras.
        const wantY = (swooping || playerCenter.Y < center.Y)
            ? playerCenter.Y
            : playerCenter.Y - HOVER_ABOVE;

        let dx = playerCenter.X - center.X;
        let dy = wantY - center.Y;
        if (!swooping && Math.abs(dy) < HOVER_DEADZONE) dy = 0;

        npc.localAI[0]--;
        if (npc.localAI[0] <= 0) {
            npc.localAI[0] = REAIM_MIN + Math.random() * (REAIM_MAX - REAIM_MIN);
            npc.localAI[1] = (Math.random() - 0.5) * 2 * ANGLE_JITTER;
            npc.localAI[2] = 0.85 + Math.random() * 0.3;
        }

        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let dirX = dx / dist;
        let dirY = dy / dist;

        const ca = Math.cos(npc.localAI[1]);
        const sa = Math.sin(npc.localAI[1]);
        const rx = dirX * ca - dirY * sa;
        const ry = dirX * sa + dirY * ca;

        npc.ai[0] += WOBBLE;
        if (npc.ai[0] > Math.PI * 2) npc.ai[0] -= Math.PI * 2;
        const sine = Math.sin(npc.ai[0]);

        const speed = SPEED * (npc.localAI[2] || 1) * (swooping ? SWOOP_SPEED : 1);
        const wobble = swooping ? WOBBLE_STRENGTH * 0.4 : WOBBLE_STRENGTH;
        const wantVX = rx * speed - ry * sine * wobble;
        const wantVY = ry * speed + rx * sine * wobble;

        const maxX = MAX_SPEED_X * (swooping ? SWOOP_SPEED : 1);
        const maxY = MAX_SPEED_Y * (swooping ? SWOOP_SPEED : 1);

        const vel = npc.velocity;
        let vx = vel.X + (wantVX - vel.X) * ACCEL + (Math.random() - 0.5) * 0.15;
        let vy = vel.Y + (wantVY - vel.Y) * ACCEL + (Math.random() - 0.5) * 0.15;

        if (vx > maxX) vx = maxX;
        else if (vx < -maxX) vx = -maxX;
        if (vy > maxY) vy = maxY;
        else if (vy < -maxY) vy = -maxY;

        npc.velocity = Vector2.new(vx, vy);

        // Zona morta larga: sem ela ele ficava piscando de lado a cada balanco
        if (Math.abs(vx) > FACE_DEADZONE) npc.direction = vx > 0 ? 1 : -1;
        npc.spriteDirection = npc.direction;

        this._tryShoot(npc, player);
    }

    /**
     * localAI[3] positivo = pairando, negativo = mergulhando. Devolve true
     * enquanto ele estiver no mergulho.
     */
    _updateSwoop(npc) {
        if (npc.localAI[3] === 0) {
            npc.localAI[3] = HOVER_MIN + Math.random() * (HOVER_MAX - HOVER_MIN);
        }

        if (npc.localAI[3] > 0) {
            npc.localAI[3]--;
            if (npc.localAI[3] <= 0) {
                npc.localAI[3] = -(SWOOP_MIN + Math.random() * (SWOOP_MAX - SWOOP_MIN));
            }
            return false;
        }

        npc.localAI[3]++;
        if (npc.localAI[3] >= 0) {
            npc.localAI[3] = HOVER_MIN + Math.random() * (HOVER_MAX - HOVER_MIN);
        }
        return true;
    }

    _tryShoot(npc, player) {
        npc.ai[2]++;
        if (npc.ai[2] < 0) return;

        if (!CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height)) return;

        if (_attackType === -1) _attackType = ModProjectile.getTypeByName('NestlingAttack') ?? -2;

        if (_attackType >= 0) {
            const center = npc.Center;
            const playerCenter = player.Center;
            const dx = playerCenter.X - center.X;
            const dy = playerCenter.Y - center.Y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            NewProjectile(
                Terraria.Projectile.GetNoneSource(),
                center.X, center.Y,
                dx / dist * SHOT_SPEED, dy / dist * SHOT_SPEED,
                _attackType, SHOT_DAMAGE, 0, Main.myPlayer,
                0, 0, 0, null
            );
        }

        npc.ai[2] = -SHOT_COOLDOWN;
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 15, 5, 2.5, 1.25, 75, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 13, 1, 0.6, 0, false);
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Feather, 1, 1, 1));
    }
}
