import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Effects } from '../../../TL/Modules/Effects.js';

const { Color } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const SpawnNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];

export class GildedSlime extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 2;
    }

    SetDefaults() {
        this.NPC.width = 36;
        this.NPC.height = 24;
        this.NPC.aiStyle = 1;
        this.NPC.damage = 18;
        this.NPC.defense = 8;
        this.NPC.lifeMax = 90;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 1, 0, 0);
        this.AnimationType = Terraria.ID.NPCID.BlueSlime;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GildedSlime');
        bestiaryEntry.Info.Add(FlavorText);
    }

    PostAI(npc) {
        if (Math.random() < 0.10) {
            NewDust(npc.position, npc.width, npc.height, 43, 0, 0, 0, Color.Gold, 1.1);
        }
        Effects.AddLight(npc.Center, 1, 0.84, 0);
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 30 : 10;

        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);
            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;
            NewDust(npc.position, npc.width, npc.height, 43, speedX, speedY, 0, Color.Gold, scale);
        }
    }

    CheckDead(npc) {
        const slimelingID = ModNPC.getTypeByName('GildedSlimeling');

        if (slimelingID) {
            const amount = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < amount; i++) {
                SpawnNPC(
                    null,
                    Math.floor(npc.Center.X),
                    Math.floor(npc.Center.Y),
                    slimelingID,
                    0, 0, 0, 0, 0, 255
                );
            }
        }
        return true;
    }
}