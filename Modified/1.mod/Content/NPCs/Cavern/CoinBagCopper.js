import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Rand } from '../../../TL/Modules/Rand.js';

const { Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

export class CoinBagCopper extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 5;
    }

    SetDefaults() {
        this.NPC.width = 12;
        this.NPC.height = 20;
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;
        this.NPC.damage = 0;
        this.NPC.defense = 40;
        this.NPC.lifeMax = 60;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit41;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath43;
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 40);
        this.NPC.knockBackResist = 0.2;
        this.NPC.noTileCollide = false;
        this.NPC.noGravity = false;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.CopperCoinBag');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.SpawnTileY > Terraria.Main.rockLayer && info.Underground && info.SpawnTileY < Terraria.Main.maxTilesY - 200 && !info.Water) {
            return 0.001;
        }
        return 0;
    }

    PreAI(npc) {
        if (npc.localAI[0] === 0) {
            npc.velocity = Vector2.new(0, npc.velocity.Y);
            return false;
        }

        return true;
    }

    PostAI(npc) {
        if (npc.localAI[0] === 1) {
            npc.TargetClosest(true);
            const player = Terraria.Main.player[npc.target];
            if (player && player.active && !player.dead) {
                npc.direction = (player.Center.X < npc.Center.X) ? 1 : -1;
                let vel = npc.velocity;
                vel.Y += 0.2;
                if (Math.abs(vel.Y) > 8) vel.Y = 8;
                npc.velocity = Vector2.new(npc.direction * 2.0, vel.Y);
            }
        }
    }

    FindFrame(npc, frameHeight) {
        let frame = npc.frame;

        if (npc.localAI[0] === 0) {
            frame.Y = 0;
            npc.frame = frame;
            npc.frameCounter = 0;
            return;
        }

        const inAir = Math.abs(npc.velocity.Y) > 1.0;

        if (inAir) {
            npc.frameCounter++;
            if (npc.frameCounter >= 9) {
                npc.frameCounter = 0;
                frame.Y += frameHeight;
            }
            if (frame.Y < frameHeight * 3) frame.Y = frameHeight * 3;
            if (frame.Y >= frameHeight * 5) frame.Y = frameHeight * 3;
            npc.frame = frame;
            return;
        }

        npc.frameCounter += Math.abs(npc.velocity.X) + 1;
        if (npc.frameCounter >= 12) {
            npc.frameCounter = 0;
            frame.Y += frameHeight;
        }

        if (frame.Y < frameHeight) frame.Y = frameHeight;
        if (frame.Y >= frameHeight * 3) frame.Y = frameHeight;

        npc.frame = frame;
    }

    DropCoins(npc, amount) {
        Terraria.Item['int NewItem(IEntitySource source, int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'](
            npc.GetItemSource_Loot(),
            Math.floor(npc.position.X),
            Math.floor(npc.position.Y),
            npc.width,
            npc.height,
            Terraria.ID.ItemID.CopperCoin,
            amount,
            false,
            0,
            false
        );
    }

    OnHitByPlayer(npc, player, item, damageDone, knockBack) {
        if (npc.localAI[0] === 0) {
            npc.localAI[0] = 1;
            npc.netUpdate = true;
        }
        this.DropCoins(npc, Rand.Next(2, 6));
    }

    OnHitByProjectile(npc, projectile) {
        if (npc.localAI[0] === 0) {
            npc.localAI[0] = 1;
            npc.netUpdate = true;
        }
        this.DropCoins(npc, Rand.Next(2, 6));
    }

    OnKill(npc) {
        this.DropCoins(npc, Rand.Next(10, 21));
    }
}