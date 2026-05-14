import { Terraria, Modules } from "./../../../TL/ModImports.js";
import { ModNPC } from "./../../../TL/ModNPC.js";

const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator } = Terraria.GameContent.Bestiary;

export class StormHatchling extends ModNPC {
  constructor() {
    super();
    this.Texture = "NPCs/Boss/" + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.npcFrameCount[this.Type] = 4;
  }

  SetDefaults() {
    this.NPC.lifeMax = 20;
    this.NPC.damage = 20;
    this.NPC.defense = 2;
    this.NPC.knockBackResist = 0.2;
    this.NPC.width = 32;
    this.NPC.height = 32;
    this.NPC.aiStyle = -1;
    this.NPC.noGravity = true;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
    this.NPC.value = ModNPC.NPCValue(0, 0, 0, 0);
  }

  PreAI(npc) {
    npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    return true;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(
      BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Sky
    );
  }

  SpawnChance(info) {
    return 0;
  }

  ModifyNPCLoot(npcLoot) {
  }

  HitEffect(npc, hitDirection, damage) {
    if (npc.life <= 0) {
      for (let i = 0; i < 20; i++) {

        Terraria.Dust.NewDust(
          npc.position, npc.width, npc.height,
          15, 2.5 * hitDirection, -2.5, 125, Color.new(0, 0, 0, 0), 1.25
        );

        Terraria.Dust.NewDust(
          npc.position, npc.width, npc.height,
          87, 2.5 * hitDirection, -2.5, 0, Color.new(0, 0, 0, 0), 0.75
        );
      }
    } else {
      const count = Math.floor((damage / npc.lifeMax) * 50);
      for (let i = 0; i < count; i++) {
        Terraria.Dust.NewDust(
          npc.position, npc.width, npc.height,
          5, hitDirection, -1.0, 125, Color.new(0, 0, 0, 0), 1.0
        );
      }
    }
  }

  FindFrame(npc, frameHeight) {
    npc.spriteDirection = npc.direction;
    let frame = npc.frame;

    npc.frameCounter += 1.0;
    if (npc.frameCounter >= 4.0) {
      frame.Y += frameHeight;
      npc.frameCounter = 0.0;
    }

    if (frame.Y >= frameHeight * 4) {
      frame.Y = 0;
    }

    npc.frame = frame;
  }

  AI(npc) {
    let player = Terraria.Main.player[npc.target];
    if (npc.target < 0 || npc.target == 255 || player.dead || !player.active) {
      npc.TargetClosest(true);
      player = Terraria.Main.player[npc.target];
    }
    let vel = npc.velocity;
    let toPlayer = Vector2.Subtract(player.Center, npc.Center);
    let dir = Vector2.SafeNormalize(toPlayer, Vector2.Zero);

    const speed = 7
    const accel = 0.2
    vel = Vector2.Add(vel, Vector2.Multiply(dir, accel));

    if (Vector2.DistanceSquared(Vector2.Zero, vel) > speed * speed) {
      vel = Vector2.Multiply(Vector2.SafeNormalize(vel, Vector2.Zero), speed);
    }

    npc.velocity = vel;
    npc.direction = npc.spriteDirection = vel.X > 0 ? 1 : -1;
  }
}
