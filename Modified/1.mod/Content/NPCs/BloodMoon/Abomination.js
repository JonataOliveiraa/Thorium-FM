import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { ModSystem } from '../../../TL/ModSystem.js';

const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const {
    BestiaryDatabaseNPCsPopulator,
    FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const { Color } = Modules;
const { Main } = Terraria;

const NewNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];

const GORE_COLOR = Color.new(180, 20, 20, 255);

// Pedacos que ele solta ao morrer
const DEATH_SPAWNS = ['BloodDrop', 'SeveredLegs', 'GraveLimb'];

export class Abomination extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/BloodMoon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 3;
    }

    SetDefaults() {
        this.NPC.width = 35;
        this.NPC.height = 17;
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;
        this.NPC.knockBackResist = 0.3;
        this.NPC.damage = 10;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 120;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    // A assinatura estava curta demais (npc, player, target, damage, crit).
    // A do TL e essa aqui; so o player era usado, entao nao quebrava, mas
    // qualquer parametro alem do 2o vinha errado.
    OnHitPlayer(npc, player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        player['void AddBuff(int type, int time, bool fromNetPvP)'](Terraria.ID.BuffID.Bleeding, 240, false);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Events.BloodMoon);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Abomination');
        bestiaryEntry.Info.Add(FlavorText);
    }

    // info.BloodMoon e uma flag global do mundo, vale ate no subterraneo.
    // A checagem de altura e o que prende ele na superficie.
    SpawnChance(info) {
        if (!info.CommonEnemy || !info.BloodMoon) return 0;
        if (!info.AboveSurface || info.SpawnTileY > Terraria.Main.worldSurface) return 0;
        if (info.Water || info.PlayerSafe) return 0;
        if (WorldDB.get('Thorium:CanSpawnAbomination') !== true) return 0;

        return 0.15;
    }

    // Estava Common(Blood, 5, 20, 4): minimo 20 e maximo 4, invertido
    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 5, 2, 4));
    }

    PostAI(npc) {
        npc.TargetClosest(true);

        const player = Terraria.Main.player[npc.target];
        if (player && player.active && !player.dead) {
            npc.direction = (player.Center.X < npc.Center.X) ? -1 : 1;
        }

        const vel = npc.velocity;
        if (vel.Y !== 0) return; // no ar a vanilla cuida, nao precisa reescrever

        vel.X += npc.direction * 0.05;
        if (Math.abs(vel.X) > 1.8) vel.X = 1.8 * npc.direction;

        npc.velocity = vel;
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 30 : 10;

        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);

            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;

            // A cor era criada dentro do laco: 30 objetos nativos por morte
            NewDust(
                npc.position, npc.width, npc.height,
                5, speedX, speedY, 0, GORE_COLOR, scale
            );
        }
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;

        if (npc.velocity.X === 0 && npc.velocity.Y === 0) {
            frame.Y = 0;
            npc.frame = frame;
            return;
        }

        npc.frameCounter += Math.abs(npc.velocity.X);

        if (npc.frameCounter >= 6.0) {
            frame.Y += frameHeight;
            npc.frameCounter = 0.0;

            if (frame.Y >= frameHeight * Terraria.Main.npcFrameCount[this.Type]) {
                frame.Y = 0;
            }
        }

        npc.frame = frame;
    }

    /**
     * NewNPC quer X e Y inteiros: antes ia float e o alvo saia de
     * Main.player[npc.target] sem checar, o que estoura quando npc.target e
     * 255 (sem alvo). 255 e justamente o valor de "nenhum alvo".
     */
    OnKill(npc) {
        const target = npc.target >= 0 && npc.target < 255 ? npc.target : 255;
        const center = npc.Center;
        const source = null;

        for (const name of DEATH_SPAWNS) {
            const type = ModNPC.getTypeByName(name);
            if (!(type > 0)) continue;

            NewNPC(
                source,
                (center.X + (Math.random() * 80 - 40)) | 0,
                (center.Y - Math.random() * 30) | 0,
                type,
                0, 0, 0, 0, 0, target
            );
        }
    }
}