import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';

const { Main, NPC } = Terraria;
const { Color } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const NewNPC = NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const CountNPCS = NPC['int CountNPCS(int Type)'];
const BURIED_CHAMPION_KEY = 'Thorium:HasBeenDefeated_BuriedChampion';

export class BizarreRockFormation extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/MarbleCave/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Main.npcFrameCount[this.Type] = 3;
    Terraria.ID.NPCID.Sets.CantTakeLunchMoney[this.Type] = true;
  }

  SetDefaults() {
    this.NPC.width = 30;
    this.NPC.height = 40;
    this.NPC.damage = 0;
    this.NPC.defense = 10;
    this.NPC.lifeMax = 300;
    this.NPC.rarity = 4;
    this.NPC.chaseable = false;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
    this.NPC.knockBackResist = 0;
    this.NPC.aiStyle = -1;
    this.NPC.scale = 1;
  }

  ApplyBuffImmunity(npc) {
    npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Marble);
    const flavor = FlavorTextBestiaryInfoElement.new();
    flavor._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
    bestiaryEntry.Info.Add(flavor);
  }

  SpawnChance(info) {
    if (!info.CommonEnemy || !info.BelowSurface || info.PlayerSafe) return 0;
    if (info.SpawnTileType !== Terraria.ID.TileID.MarbleBlock) return 0;
    if (!NPC.downedBoss3) return 0;
    const buriedChampionType = ModNPC.getTypeByName('BuriedChampion');
    if (CountNPCS(this.Type) > 0 || (buriedChampionType > 0 && CountNPCS(buriedChampionType) > 0)) return 0;
    return WorldDB.get(BURIED_CHAMPION_KEY) === true ? 0.025 : 1;
  }

  AI(npc) {
    const velocity = npc.velocity;
    velocity.Y += 1;
    npc.velocity = velocity;

    if (npc.life < npc.lifeMax * 0.33) {
      if (Main.netMode !== 2) {
        const dust = NewDustDirect(npc.position, npc.width, npc.height, 6, 0, 0, 100, Color.White, 1);
        if (dust) {
          const dustVelocity = dust.velocity;
          dustVelocity.X *= 0.2;
          dustVelocity.Y *= 0.2;
          dust.velocity = dustVelocity;
          dust.noGravity = true;
        }
      }
      npc.localAI[0] = 2;
    } else if (npc.life < npc.lifeMax * 0.66) {
      npc.localAI[0] = 1;
    } else {
      npc.localAI[0] = 0;
    }
  }

  FindFrame(npc, frameHeight) {
    const frame = npc.frame;
    frame.Y = (npc.localAI[0] | 0) * frameHeight;
    npc.frame = frame;
  }

  HitEffect(npc, hitDirection, damage) {
    if (Main.netMode === 2) return;

    if (npc.life <= 0) {
      FxHelper.burst(npc.position, npc.width, npc.height, 20, 1, 6, 1.5, 0, false);
      FxHelper.burst(npc.position, npc.width, npc.height, 20, 57, 6, 1.2, 0, false);
      return;
    }

    const count = Math.min(10, Math.floor(damage / npc.lifeMax * 50));
    for (let i = 0; i < count; i++) {
      const dust = NewDustDirect(npc.position, npc.width, npc.height, 1, hitDirection, -1, 0, Color.White, 1);
      if (dust) dust.noGravity = true;
    }
  }

  OnKill(npc) {
    const buriedChampionType = ModNPC.getTypeByName('BuriedChampion');
    if (Main.netMode === 1 || buriedChampionType < 0 || CountNPCS(buriedChampionType) > 0) return;

    const center = npc.Center;
    NewNPC(null, center.X | 0, (center.Y - 10) | 0, buriedChampionType, 0, 0, 0, 0, 0, 255);
    MiscHelper.ThoriumChatMessage('BuriedChampionAppear', Color.new(175, 75, 225));
  }
}
