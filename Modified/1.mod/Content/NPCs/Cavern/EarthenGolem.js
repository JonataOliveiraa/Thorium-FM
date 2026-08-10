import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

// Quadros (48x1232 = 22 de 56px): 0 parado | 1-9 andando | 10-21 pisao
const FRAMES = 22;
const WALK_FIRST = 1;
const WALK_LAST = 9;
const SLAM_FIRST = 10;
const SLAM_LAST = 21;
const SLAM_FRAME_TIME = 4;   // ticks por quadro do pisao
const SLAM_HIT_FRAME = 18;   // quadro em que o pe encosta no chao

const SLAM_RANGE_SQ = 160000; // 400px
const SLAM_COOLDOWN = 300;    // ticks de espera entre pisoes
const SLAM_RECOVER = -60;     // tempo negativo depois do pisao (respiro)
const ROCKS = 3;
const ROCK_DAMAGE = 15;

let _stompType = -1, _rockType = -1;
let _typesInit = false;

function initTypes() {
    if (_typesInit) return;
    _typesInit = true;
    _stompType = ModProjectile.getTypeByName('ViscountStomp');
    _rockType = ModProjectile.getTypeByName('ViscountRockSummon');
}

export class EarthenGolem extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.NPC.width = 28;
        this.NPC.height = 40;
        this.NPC.scale = 1.25;
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;
        this.NPC.damage = 20;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 70;
        this.NPC.knockBackResist = 0.35;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath27;
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 50);

        this.AIType = Terraria.ID.NPCID.Zombie;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
        npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
        npc.buffImmune[Terraria.ID.BuffID.OnFire] = true;
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || info.Water) return 0;
        if (!info.Cavern || info.SpawnTileY > Main.maxTilesY - 200) return 0;
        return Main.hardMode ? 0.01 : 0.075;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.EarthenGolem');
        bestiaryEntry.Info.Add(FlavorText);
    }

    /**
     * Roda depois da AI de lutador da vanilla.
     * localAI[0] = quadro atual (0 = andando, 10..21 = pisao)
     * localAI[1] = contador do quadro do pisao
     * localAI[2] = espera ate o proximo pisao
     * localAI[3] = 1 enquanto o golpe do pisao ainda nao saiu
     */
    AI(npc) {
        initTypes();

        const player = Main.player[npc.target];
        const slamming = npc.localAI[0] >= SLAM_FIRST;

        if (slamming) {
            this._slam(npc, player);
            return;
        }

        if (!player || !player.active || player.dead) return;

        const dx = player.Center.X - npc.Center.X;
        const dy = player.Center.Y - npc.Center.Y;
        const inRange = dx * dx + dy * dy < SLAM_RANGE_SQ;
        const canSee = inRange &&
            CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height);

        if (!canSee) return;

        npc.localAI[2]++;

        // Aviso: poeira se juntando em volta do jogador antes do baque
        if (npc.localAI[2] > 0 && npc.localAI[2] % 3 === 0) {
            const dust = Main.dust[Effects.NewDust(
                Vector2.new(player.position.X + player.width / 4, player.position.Y),
                player.width / 2, player.height / 2, 110, 0, 0, 100, WHITE, 0.75
            )];
            if (dust) {
                dust.noGravity = true;
                const ox = Rand.Next(-35, 36);
                const oy = Rand.Next(-35, 36);
                dust.position = Vector2.Add(dust.position, Vector2.new(ox, oy));
                dust.velocity = Vector2.new(-ox * 0.045, -oy * 0.045);
            }
        }

        // Comeca o pisao (so com os pes no chao)
        if (npc.localAI[2] >= SLAM_COOLDOWN && npc.velocity.Y === 0) {
            npc.localAI[0] = SLAM_FIRST;
            npc.localAI[1] = 0;
            npc.localAI[2] = SLAM_RECOVER;
            npc.localAI[3] = 1;
        }
    }

    _slam(npc, player) {
        // Trava no lugar, virado pro jogador
        npc.velocity = Vector2.new(0.01, 0);
        if (player && player.active) {
            npc.direction = player.Center.X > npc.Center.X ? 1 : -1;
            npc.spriteDirection = npc.direction;
        }

        npc.localAI[1]++;
        if (npc.localAI[1] > SLAM_FRAME_TIME) {
            npc.localAI[1] = 0;
            npc.localAI[0]++;
        }

        // O pe bate: onda de choque e pedras caindo em cima do jogador
        if (npc.localAI[0] > SLAM_HIT_FRAME && npc.localAI[3] === 1) {
            npc.localAI[3] = 0;
            this._impact(npc, player);
        }

        if (npc.localAI[0] > SLAM_LAST) {
            npc.localAI[0] = 0;
            npc.localAI[1] = 0;
        }
    }

    _impact(npc, player) {
        const source = null;

        if (_stompType >= 0) {
            const index = NewProjectile(
                source, npc.Center.X, npc.Center.Y + 16, 0, 1,
                _stompType, 0, 0, Main.myPlayer, 0, 0, 0, null
            );
            const shock = Main.projectile[index];
            if (shock) shock.timeLeft = 18;
        }

        if (_rockType >= 0 && player && player.active && !player.dead) {
            for (let i = 0; i < ROCKS; i++) {
                NewProjectile(
                    source,
                    player.Center.X + Rand.Next(-26, 26), player.Center.Y + 10,
                    0, Rand.NextFloat(-15, -12),
                    _rockType, ROCK_DAMAGE, 0, Main.myPlayer, 0, 0, 0, null
                );
            }
        }
    }

    // Parado, andando ou no pisao
    FindFrame(npc, frameHeight) {
        const frame = npc.frame;

        if (npc.localAI[0] >= SLAM_FIRST) {
            frame.Y = Math.min(SLAM_LAST, npc.localAI[0] | 0) * frameHeight;
            npc.frame = frame;
            npc.spriteDirection = npc.direction;
            return;
        }

        npc.spriteDirection = npc.direction;

        if (Math.abs(npc.velocity.X) < 0.1) {
            frame.Y = 0;
            npc.frameCounter = 0;
            npc.frame = frame;
            return;
        }

        npc.frameCounter += Math.abs(npc.velocity.X) * 0.5;
        if (npc.frameCounter >= 3) {
            npc.frameCounter = 0;
            let current = (frame.Y / frameHeight) | 0;
            current = current < WALK_FIRST || current >= WALK_LAST ? WALK_FIRST : current + 1;
            frame.Y = current * frameHeight;
        }

        npc.frame = frame;
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 14, 53, 2.5, 0.75, 150, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 53, 1, 0.75, 75, false);
    }

    // TODO: HeartOfStone (1/20) quando o acessorio existir
    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('SmoothCoal'), 2, 1, 1));
    }
}
