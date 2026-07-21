import { Terraria, Modules } from "../../../TL/ModImports.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Effects } from "../../../TL/Modules/Effects.js";

const { Main, SoundEngine, Dust, Gore, Collision } = Terraria;
const { Vector2, Color } = Modules;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const NewDust = Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class GoblinTrapper extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/GoblinArmy/' + this.constructor.name;
        this.casting = false;
        this.blast = 30;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 19;
    }

    SetDefaults() {
        this.NPC.width = 18;
        this.NPC.height = 50;
        this.NPC.damage = 20;
        this.NPC.defense = 6;
        this.NPC.lifeMax = 90;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.knockBackResist = 0.6;
        this.NPC.aiStyle = 3;
        this.NPC.scale = 1;
        this.AIType = 28;
    }

    AI(npc) {
        const player = Main.player[npc.target];
        if (!player || !player.active) return;

        let casting = this.casting;
        let blast = this.blast;

        const distSq = Vector2.DistanceSquared(player.Center, npc.Center);

        if (Main.invasionType !== 1) {
            casting = false;
        } else if (!casting && npc.velocity.Y === 0 && distSq < 75625) {
            casting = true;
        } else if (casting && distSq > 140625) { 
            casting = false;
        }

        if (npc.confused) casting = false;
        if (casting && (player.dead || !Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'](npc.position, npc.width, npc.height, player.position, player.width, player.height))) {
            casting = false;
        }

        if (casting) {
            npc.ai[3] = -1;
            npc.aiStyle = -1;
            this.AIType = 0;
            this.AnimationType = 0;
            npc.spriteDirection = player.Center.X > npc.Center.X ? 1 : -1;

            if (blast >= 45) {
                let vel = npc.velocity;
                vel.X = 0;
                npc.velocity = vel;
            }

            blast++;
            if (blast >= 190 && (blast - 190) % 15 === 0) {
                Effects.PlaySound(Terraria.ID.SoundID.Item19, npc.Center.X, npc.Center.Y, 0, 0);
                if (Main.netMode !== 1) {
                    const speed = 6 - Math.floor((blast - 190) / 15);   // 6, 5, 4
                    const dir = Vector2.Normalize(Vector2.Subtract(player.Center, npc.Center));
                    const vel = Vector2.Multiply(dir, speed);
                    const spawnPos = Vector2.Add(npc.Center, Vector2.new(8 * npc.spriteDirection, -10));
                    const spikeBallType = ModProjectile.getTypeByName('HostileSpikeBall');
                    Terraria.Projectile['int NewProjectile(IEntitySource source, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'](
                        npc.GetSpawnSourceForNPCFromNPCAI(), spawnPos, vel, spikeBallType, 10, 0, Main.myPlayer, 0, 0, 0, null
                    );
                }
            } else if (blast >= 225) {
                blast = 0;
            }
        } else {
            blast = 30;
            npc.aiStyle = 3;
            this.AIType = 28;
            this.AnimationType = 28;
        }

        this.casting = casting;
        this.blast = blast;
    }

    FindFrame(npc, frameHeight) {
        if (!this.casting) {
            return;
        }

        if (this.blast < 180) {
            npc.frame.Y = (npc.velocity.Y === 0 ? 0 : 1) * frameHeight;
        } else {
            const frame = 16 + Math.floor((this.blast - 180) / 5) % 3;
            npc.frame.Y = frame * frameHeight;
        }
    }

    HitEffect(npc, hit) {
        if (npc.life <= 0) {
            if (Main.netMode === 2) return;
            for (let i = 0; i < 10; i++) {
                NewDust(npc.position, npc.width, npc.height, 5, 2.5 * hit.HitDirection, -2.5, 0, Color.White, 0.8);
            }
        } else {
            this.blast = 30;
            const dustCount = Math.floor((hit.Damage / npc.lifeMax) * 50);
            for (let i = 0; i < dustCount; i++) {
                NewDust(npc.position, npc.width, npc.height, 5, hit.HitDirection, -1, 0, Color.White, 0.6);
            }
        }
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(161, 2, 1, 5)); 
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('YewWood'), 2, 4, 8));
    }

    SpawnChance(spawnInfo) {
        if (Main.invasionType !== 1 || !spawnInfo.Invasion) return 0;
        return 0.2;
    }
}