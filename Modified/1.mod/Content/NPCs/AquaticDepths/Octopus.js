import { ModBiome } from '../../../TL/ModBiome.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ProjAI } from '../../../TL/ProjAI.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const ARMS = 6;
const SPEED = 1;
const ACCEL = 0.05;
const IDLE_SPEED = 0.5;
const STOP_RANGE_SQ = 250000;

let _armType = -1;

export class Octopus extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 1;
    }

    SetDefaults() {
        this.NPC.width = 28;
        this.NPC.height = 44;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 20;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 90;
        this.NPC.knockBackResist = 0.3;
        this.NPC.noGravity = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 4, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    }

    CanFallThroughPlatforms(npc) {
        return true;
    }

    SpawnChance(info) {
        if (ModBiome.getByName('AquaticDepths').IsActive) return 0.15;
        return 0;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Octopus');
        bestiaryEntry.Info.Add(FlavorText);
    }

    AI(npc) {
        let player = Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || !player || player.dead || !player.active) {
            npc.TargetClosest(true);
            player = Main.player[npc.target];
        }

        const vel = npc.velocity;
        const center = npc.Center;

        if (player && player.active && !player.dead) {
            const dx = player.Center.X - center.X;
            const dy = player.Center.Y - center.Y;
            const distSq = dx * dx + dy * dy;
            const blocked = !CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height);

            if (distSq < STOP_RANGE_SQ && blocked) {
                // Perto mas atras da parede: para e deixa os bracos trabalharem
                npc.velocity = Vector2.Zero;
            } else {
                const dist = Math.sqrt(distSq) || 1;
                vel.X += (dx / dist * SPEED - vel.X) * ACCEL;
                vel.Y += (dy / dist * SPEED - vel.Y) * ACCEL;
                npc.velocity = vel;
            }
        } else {
            vel.X *= 0.98;
            vel.Y = Math.sin(Main.GameUpdateCount / 50 + npc.whoAmI) * IDLE_SPEED;
            npc.velocity = vel;
        }

        npc.spriteDirection = npc.velocity.X > 0 ? 1 : -1;

        // Cria os bracos uma vez so
        if (npc.localAI[0] !== 0) return;
        npc.localAI[0] = 1;

        if (_armType === -1) _armType = ModProjectile.getTypeByName('OctopusArm');
        if (_armType < 0) return;

        let damage = Math.max(1, npc.damage / 2 | 0);
        if (Main.expertMode) damage = Math.max(1, damage / 2 | 0);

        for (let i = 0; i < ARMS; i++) {
            const index = NewProjectile(
                null,
                center.X, center.Y, 0, 0,
                _armType, damage, 0, Main.myPlayer, 0, 0, 0, null
            );

            const arm = Main.projectile[index];
            if (!arm) continue;

            // ai[0] = dono, ai[1] = indice do braco (define o setor de varredura)
            const ai = new ProjAI(arm, false);
            ai[0] = npc.whoAmI;
            ai[1] = i;
        }
    }

    FindFrame(npc, frameHeight) {
        const frame = npc.frame;
        frame.Y = 0;
        npc.frame = frame;
        npc.rotation = 0;
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 14, 151, 2.5, 0.7, 0, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 151, 1, 0.7, 0, false);
    }

    // TODO: SeaNinjaStar e Takoyaki quando os itens existirem
    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('DepthScales'), 2, 1, 2));
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.BlackInk, 10, 1, 1));
    }
}
