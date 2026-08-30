import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule, Conditions } = Terraria.GameContent.ItemDropRules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class Shambler extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Dungeon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 15;
        Terraria.ID.NPCID.Sets.Skeletons[this.Type] = true;
        this.BestiaryRarityStars = 1;
    }

    SetDefaults() {
        this.NPC.width = 18;
        this.NPC.height = 40;
        this.NPC.aiStyle = 3;
        this.NPC.damage = 30;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 90;
        this.NPC.knockBackResist = 0.35;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit2;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath2;
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 30);
        this.AIType = 3;
        this.AnimationType = 21;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.TheDungeon);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Shambler');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.Dungeon) return 0;
        return (Main.hardMode && Terraria.NPC.downedPlantBoss) ? 0.025 : 0.1;
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            for (let i = 0; i < 15; i++) NewDust(npc.position, npc.width, npc.height, 26, 2.5 * hitDirection, -2.5, 0, Color.White, 1);
            const spot = Vector2.new(
                npc.position.X + Math.random() * npc.width,
                npc.position.Y + Math.random() * npc.height * 0.5
            );
            NewGore(spot, npc.velocity, 42, 1);
            NewGore(spot, npc.velocity, 43, 1);
            NewGore(spot, npc.velocity, 44, 1);
            return;
        }

        const count = Math.min(10, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) NewDust(npc.position, npc.width, npc.height, 26, hitDirection, -1, 0, Color.White, 0.75);
    }

    ModifyNPCLoot(npcLoot) {
        const notExpert = Conditions.NotExpert ? Conditions.NotExpert.new() : null;
        const isExpert = Conditions.IsExpert ? Conditions.IsExpert.new() : null;
        if (notExpert && isExpert) {
            npcLoot.Add(ItemDropRule.ByCondition(notExpert, 154, 1, 1, 3, 1));
            npcLoot.Add(ItemDropRule.ByCondition(isExpert, 154, 1, 2, 6, 1));
        } else {
            npcLoot.Add(ItemDropRule.Common(154, 1, 1, 3));
        }

        const ballnChain = ModItem.getTypeByName('BallnChain');
        if (ballnChain > 0) npcLoot.Add(ItemDropRule.Common(ballnChain, 20, 1, 1));

        npcLoot.Add(ItemDropRule.Common(3095, 100, 1, 1));
        npcLoot.Add(ItemDropRule.Common(327, 65, 1, 1));
        npcLoot.Add(ItemDropRule.Common(932, 250, 1, 1));
        npcLoot.Add(ItemDropRule.Common(1307, 300, 1, 1));
        npcLoot.Add(ItemDropRule.Common(959, 450, 1, 1));
    }

    OnKill(npc) {
        const ballType = ModProjectile.getTypeByName('ShambleBall');
        if (!(ballType > 0)) return;

        let index = npc.target;
        const player = Main.player[index];
        const debuff = ModBuff.getTypeByName('ShambleBallDebuff');

        if (index < 0 || index > 254 || !player || !player.active || player.dead || (debuff > 0 && player.buffImmune[debuff])) {
            index = 255;
        } else {
            const dx = npc.Center.X - player.Center.X;
            const dy = npc.Center.Y - player.Center.Y;
            if (dx * dx + dy * dy > 62500) index = 255;
        }

        const center = npc.Center;
        NewProjectile(null, center.X, center.Y, 0, 2, ballType, 0, 0, Main.myPlayer, 0, index, 0, null);
    }
}
