import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class BloodDrop extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/BloodMoon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 2;
    }

    SetDefaults() {
        this.NPC.width = 35;
        this.NPC.height = 17;
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Slime;
        this.NPC.damage = 10;
        this.NPC.defense = 0;
        this.NPC.lifeMax = 12;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);

        this.AnimationType = Terraria.ID.NPCID.BlueSlime
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    OnHitPlayer(npc, player, target, damage, crit) {
        const buffType = 20;
        const duration = 240;
        player['void AddBuff(int type, int time, bool fromNetPvP)'](buffType, duration, false);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Events.BloodMoon);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.BloodDrop');
        bestiaryEntry.Info.Add(FlavorText);
    }


    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 1, 1, 1));
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 30 : 10;

        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);

            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;

            NewDust(
                npc.position, npc.width, npc.height,
                5, speedX, speedY, 0, Color.Red, scale
            );
        }
    }
}