import { ModBiome } from '../../../TL/ModBiome.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';
import { SoundHelper } from '../../Global/Utils/SoundHelper.js';

const { Vector2, Rand } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const FRAMES = 4;
const SPEED = 3;
const ACCEL = 0.25;
const IDLE_SPEED = 0.25;
const VENOM_CHANCE = 10;   // 1 em N
const VENOM_TIME = 120;
const STINGERS = 8;        // espinhos disparados ao morrer

let _stingerType = -1;

export class Blowfish extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.NPC.width = 34;
        this.NPC.height = 34;
        this.NPC.scale = 1.2;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 20;
        this.NPC.defense = 5;
        this.NPC.lifeMax = 50;
        this.NPC.knockBackResist = 0.65;
        this.NPC.noGravity = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 2, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
        npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
    }

    SpawnChance(info) {
        if (ModBiome.getByName('AquaticDepths').IsActive) return 0.2;
        return 0;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Blowfish');
        bestiaryEntry.Info.Add(FlavorText);
    }

    // Nada devagar atras do jogador e quica nas paredes
    AI(npc) {
        let player = Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || !player || player.dead || !player.active) {
            npc.TargetClosest(true);
            player = Main.player[npc.target];
        }

        const vel = npc.velocity;

        if (!npc.wet) {
            vel.Y += 0.3;
            if (vel.Y > 8) vel.Y = 8;
            npc.velocity = vel;
            return;
        }

        const center = npc.Center;
        const chasing = player && player.active && !player.dead && player.wet &&
            CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height);

        if (chasing) {
            const dx = player.Center.X - center.X;
            const dy = player.Center.Y - center.Y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            vel.X += (dx / dist * SPEED - vel.X) * ACCEL;
            vel.Y += (dy / dist * SPEED - vel.Y) * ACCEL;
        } else {
            // Sem alvo: fica boiando devagar
            vel.X *= 0.98;
            vel.Y = Math.sin(Main.GameUpdateCount / 40 + npc.whoAmI) * IDLE_SPEED;
        }

        // Quica em vez de encostar na parede
        if (SolidCollision(Vector2.new(npc.position.X + vel.X, npc.position.Y), npc.width, npc.height)) vel.X = -vel.X;
        if (SolidCollision(Vector2.new(npc.position.X, npc.position.Y + vel.Y), npc.width, npc.height)) vel.Y = -vel.Y;

        npc.velocity = vel;
        npc.spriteDirection = vel.X > 0 ? 1 : -1;
        npc.rotation = vel.X * 0.05;
    }

    // So anima dentro d'agua
    FindFrame(npc, frameHeight) {
        if (!npc.wet) {
            npc.frameCounter = 0;
            const frame = npc.frame;
            frame.Y = 0;
            npc.frame = frame;
            return;
        }

        npc.frameCounter++;
        if (npc.frameCounter > 8) {
            npc.frameCounter = 0;
            const frame = npc.frame;
            frame.Y = (((frame.Y / frameHeight | 0) + 1) % FRAMES) * frameHeight;
            npc.frame = frame;
        }
    }

    OnHitPlayer(npc, player) {
        if (Rand.Next(VENOM_CHANCE) !== 0) return;
        player.AddBuff(Terraria.ID.BuffID.Venom, VENOM_TIME, false);
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 8, 5, 2.5, 1, 0, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 10, 176, 6, 1.25, 0);
            FxHelper.burst(npc.position, npc.width, npc.height, 8, 113, 4, 1, 0);
            SoundHelper.play(['Item17', 'Item2'], npc.Center.X, npc.Center.Y);
            SoundHelper.play(['Item14'], npc.Center.X, npc.Center.Y);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 5, 1, 0.8, 0, false);
    }

    // Explode em espinhos ao morrer
    OnKill(npc) {
        if (_stingerType === -1) _stingerType = ModProjectile.getTypeByName('BlowfishStinger');
        if (_stingerType < 0) return;

        const center = npc.Center;
        const damage = Math.max(1, npc.damage / 2 | 0);
        const step = Math.PI * 2 / STINGERS;

        for (let i = 0; i < STINGERS; i++) {
            const angle = i * step;
            NewProjectile(
                null,
                center.X, center.Y,
                Math.cos(angle) * 2.5, Math.sin(angle) * 2.5,
                _stingerType, damage, 1, Main.myPlayer, 0, 0, 0, null
            );
        }
    }

    // TODO: BubbleTea (1/30) quando o item existir
    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('DepthScales'), 1, 1, 2));
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Coral, 3, 1, 3));
    }
}
