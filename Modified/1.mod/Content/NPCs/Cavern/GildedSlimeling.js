import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Effects } from '../../../TL/Modules/Effects.js';

const { Color } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class GildedSlimeling extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 2;
    }

    SetDefaults() {
        this.NPC.width = 16;
        this.NPC.height = 12;
        this.NPC.aiStyle = 1;
        this.NPC.damage = 10;
        this.NPC.defense = 2;
        this.NPC.lifeMax = 30;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 0);
        this.AnimationType = Terraria.ID.NPCID.BlueSlime;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GildedSlimeling');
        bestiaryEntry.Info.Add(FlavorText);
    }

    PostAI(npc) {
        if (Math.random() < 0.10) {
            NewDust(npc.position, npc.width, npc.height, 43, 0, 0, 0, Color.Gold, 0.8);
        }
        Effects.AddLight(npc.Center, 1, 0.84, 0);
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 20 : 5;

        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 0.8 + (Math.random() - 0.5) : 0.5 + (Math.random() - 0.5);
            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;
            NewDust(npc.position, npc.width, npc.height, 43, speedX, speedY, 0, Color.Gold, scale);
        }
    }
}