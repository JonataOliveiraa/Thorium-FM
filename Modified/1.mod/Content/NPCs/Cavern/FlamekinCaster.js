import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Rand } from '../../../TL/Modules/Rand.js';
import { Effects } from '../../../TL/Modules/Effects.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];
const NewNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];

export class FlamekinCaster extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 3;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[31] = true;
        npc.buffImmune[24] = true;
    }

    SetDefaults() {
        this.NPC.lifeMax = 75;
        this.NPC.damage = 20;
        this.NPC.defense = 4;
        this.NPC.scale = 1.0;
        this.NPC.width = 18;
        this.NPC.height = 32;
        this.NPC.aiStyle = -1;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.lavaImmune = true;
        this.NPC.knockBackResist = 0.5;
        this.NPC.value = Terraria.Item.buyPrice(0, 0, 3, 0);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.FlamekinCaster');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        const flag = Terraria.Main.remixWorld || info.SpawnTileY > (Terraria.Main.rockLayer + Terraria.Main.maxTilesY) / 2;
        if (!(info.CommonEnemy && !info.PlayerSafe && info.SpawnTileY > Terraria.Main.rockLayer && info.SpawnTileY < Terraria.Main.maxTilesY - 200 && !info.Water && flag))
            return 0;
        return Terraria.Main.hardMode ? 0.001 : 0.005;
    }

    OnSpawn(npc, source) {
        npc.ai[0] = 500;
    }

    SpawnFireDust(npc, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const dustIndex = NewDust(
                npc.position, npc.width, npc.height,
                127, 0, 0, 0, Color.Transparent, 1.5 + Math.random()
            );
            if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                const dust = Terraria.Main.dust[dustIndex];
                dust.velocity = Vector2.new(Math.cos(angle) * speed, Math.sin(angle) * speed);
                dust.noGravity = true;
            }

            const dustIndex2 = NewDust(
                npc.position, npc.width, npc.height,
                6, 0, 0, 0, Color.Transparent, 1.0 + Math.random() * 0.5
            );
            if (dustIndex2 >= 0 && dustIndex2 < Terraria.Main.dust.length) {
                const dust = Terraria.Main.dust[dustIndex2];
                dust.velocity = Vector2.new(
                    (Math.random() - 0.5) * 4,
                    -Math.random() * 4
                );
            }
        }
        Effects.AddLight(npc.Center, 1.0, 0.5, 0.1);
    }

    TeleportDust(npc, count) {
        PlaySound(8, npc.Center, 0, 1);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;

            const dustIndex = NewDust(
                npc.position, npc.width, npc.height,
                127, 0, 0, 100, Color.Transparent, 2.0
            );
            if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                const dust = Terraria.Main.dust[dustIndex];
                dust.velocity = Vector2.new(Math.cos(angle) * speed, Math.sin(angle) * speed);
                dust.noGravity = true;
                dust.fadeIn = 1.5;
            }

            const dustIndex2 = NewDust(
                npc.position, npc.width, npc.height,
                6, 0, 0, 0, Color.Transparent, 1.2
            );
            if (dustIndex2 >= 0 && dustIndex2 < Terraria.Main.dust.length) {
                const dust = Terraria.Main.dust[dustIndex2];
                dust.velocity = Vector2.new(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6
                );
            }
        }
    }

    SummonBats(npc, count) {
        PlaySound(45, npc.Center, 0, 1);
        this.SpawnFireDust(npc, 20);

        if (Terraria.Main.netMode !== 1) {
            for (let i = 0; i < count; i++) {
                NewNPC(
                    Terraria.Projectile.GetNoneSource(),
                    Math.floor(npc.Center.X),
                    Math.floor(npc.Center.Y - 14),
                    ModNPC.getTypeByName('BatOutaHell'),
                    0, 0, 0, 0, 0, 255
                );
            }
        }

        npc.localAI[0] = 35;
    }

    AI(npc) {
        Effects.AddLight(npc.Center, 0.8, 0.6, 0.2);
        npc.TargetClosest(true);
        const player = Terraria.Main.player[npc.target];

        if (player.Center.X > npc.Center.X) npc.spriteDirection = 1;
        else if (player.Center.X < npc.Center.X) npc.spriteDirection = -1;

        if (npc.localAI[0] > 0) npc.localAI[0]--;

        npc.ai[1]++;
        npc.velocity = Vector2.new(npc.velocity.X * 0.93, npc.velocity.Y);
        if (npc.velocity.X > -0.1 && npc.velocity.X < 0.1)
            npc.velocity = Vector2.new(0, npc.velocity.Y);

        // Teleporte
        if (npc.ai[2] !== 0 && npc.ai[3] !== 0) {
            this.TeleportDust(npc, 40);
            npc.position = Vector2.new(npc.ai[2] * 16 - npc.width / 2 + 8, npc.ai[3] * 16 - npc.height);
            npc.velocity = Vector2.new(0, 0);
            npc.netUpdate = true;
            npc.ai[2] = 0;
            npc.ai[3] = 0;
            this.TeleportDust(npc, 40);
        }

        npc.ai[0]++;
        if (npc.ai[0] >= 650 && Terraria.Main.netMode !== 1) {
            const tileX = Math.floor(player.Center.X / 16);
            const tileY = Math.floor(player.Center.Y / 16);
            const spot = Vector2.new(0, 0);

            if (npc['bool AI_AttemptToFindTeleportSpot(ref Vector2 chosenTile, int targetTileX, int targetTileY, int rangeFromTargetTile, int telefragPreventionDistanceInTiles, int solidTileCheckFluff, bool solidTileCheckCentered, bool teleportInAir)'](spot, tileX, tileY, 20, 5, 1, false, false)) {
                npc.ai[2] = spot.X;
                npc.ai[3] = spot.Y;
            }
            npc.ai[0] = 0;
            npc.netUpdate = true;
        }

        if (player.dead || npc.ai[1] < 45) return;

        // Fase 1: invoca 1 morcego
        if (npc.ai[1] === 45) {
            if(Math.random() > 0.5) return;
            this.SummonBats(npc, 1);
        }

        // Fase 2: invoca 3 morcegos
        if (npc.ai[1] === 90) {
            if(Math.random() > 0.8) return;
            this.SummonBats(npc, 3);
        }

        // Reset
        if (npc.ai[1] >= 145) {
            npc.ai[1] = -240;
        }
    }

    FindFrame(npc, frameHeight) {
        let frame = npc.frame;

        if (npc.localAI[0] > 0) {
            frame.Y = frameHeight;
        } else if (npc.velocity.Y > 0.5) {
            frame.Y = frameHeight * 2;
        } else {
            frame.Y = 0;
        }

        npc.frame = frame;
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            if (Terraria.Main.netMode === 2) return;
            for (let i = 0; i < 12; i++)
                NewDust(npc.position, npc.width, npc.height, 127, 2.5 * hitDirection, -3, 0, Color.Transparent, 1.5);
            for (let i = 0; i < 8; i++)
                NewDust(npc.position, npc.width, npc.height, 5, 2.5 * hitDirection, -2.5, 0, Color.Transparent, 0.8);
        } else {
            if (npc.ai[1] > 0) npc.ai[1] -= 60;
            for (let i = 0; i < damage / npc.lifeMax * 50; i++)
                NewDust(npc.position, npc.width, npc.height, 5, hitDirection, -1, 0, Color.Transparent, 0.6);
        }
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('MoltenScale'), 10, 1, 1));
    }
}

//MoltenScale