import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModSystem } from '../../../TL/ModSystem.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { Effects } from '../../../TL/Modules/Effects.js';
import { Rand } from '../../../TL/Modules/Rand.js';

const { Color, Vector2 } = Modules;

const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const {
    BestiaryDatabaseNPCsPopulator,
    FlavorTextBestiaryInfoElement,
    MoonLordPortraitBackgroundProviderBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

export class PatchWerk extends ModNPC {
    static SPEED_SCALE = 0.85;
    static MAX_JUMP_SPEED = 4;
    static MAX_SUMMONS = 5;
    static SUMMONS_MIN_PER_CAST = 1;
    static SUMMONS_MAX_PER_CAST = 2;
    static SUMMON_TRIGGER_TICKS = 480;

    constructor() {
        super();
        this.Texture = 'NPCs/BloodMoon/' + this.constructor.name;
        this.animCounter = 0;
        this.Animation = {
            Walking: 0,
            Invoking: 1,
            Vomiting: 2,
            Charging: 3,
            GoreNova: 4
        }
        this.AnimationState = this.Animation.Walking;
    }

    DeathMessage = (npc) => {
        return Terraria.Localization.Language.GetText('Announcement.HasBeenDefeated_Single'
        ).Value.replace('{0}', ModLocalization.Translate('NPCName.PatchWerk'));
    }

    BossHeadSlot(npc) {
        if (npc.ai[0] == 1) {
            return 1 + Terraria.ID.NPCID.Sets.BossHeadTextures[npc.type];
        }
        return null;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 4;
        Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
        Terraria.ID.NPCID.Sets.BossBestiaryPriority.Add(this.Type);

        this.BestiaryRarityStars = 2;

        this.Music = Terraria.ID.MusicID.OtherworldlyLunarBoss;
    }

    SetDefaults() {
        this.NPC.width = 60;
        this.NPC.height = 60;
        this.NPC.aiStyle = 3;
        this.NPC.damage = 8;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 800;
        this.NPC.knockBackResist = 0.0;
        this.NPC.noGravity = false;
        this.NPC.noTileCollide = false;
        this.NPC.boss = true;
        this.NPC.npcSlots = 10;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 3, 0, 0);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(MoonLordPortraitBackgroundProviderBestiaryInfoElement.new());
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Events.BloodMoon);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.BloodMoon && WorldDB.get('Thorium:HasBeenDefeated_PatchWerk') !== true) {
            return 0.05;
        }
        return 0;
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 5, 1, 1));
    }

    OnKill(npc) {
        const hasBeenDefeteated = WorldDB.get('Thorium:HasBeenDefeated_PatchWerk')
        if(hasBeenDefeteated === true) return Terraria.Main['void NewText(string newText, Color color)'](`${ModLocalization.Translate('SinalizationChatMessage.OnPatchWerkDie'), Color.Orange}`);

        WorldDB.set('Thorium:HasBeenDefeated_PatchWerk', true);
        if (!Terraria.Main.dayTime) {
            const ticksUntilDaybreak = Math.floor(54000 - Terraria.Main.time);
            ModSystem.SetTimeout(() => {
                WorldDB.set('Thorium:CanSpawnAbomination', true);
            }, ticksUntilDaybreak);
        }
    }

    HitEffect(npc, hitDirection, damage) {
        Effects.PlaySound(Terraria.ID.SoundID.NPCHit10, npc.Center.X, npc.Center.Y);
    }

    PreAI(npc) {
        npc.TargetClosest(true);

        if (npc.localAI[1] === 1) {
            let vel = npc.velocity;
            vel.X = 0;
            npc.velocity = vel;

            npc.localAI[2]++;

            if (npc.localAI[2] === 45) {
                const player = Terraria.Main.player[npc.target];
                if (player && player.active && !player.dead) {
                    const remaining = PatchWerk.MAX_SUMMONS - npc.localAI[3];
                    const wanted = Rand.Next(PatchWerk.SUMMONS_MIN_PER_CAST, PatchWerk.SUMMONS_MAX_PER_CAST + 1);
                    const toSummon = Math.min(wanted, Math.max(0, remaining));

                    for (let i = 0; i < toSummon; i++) {
                        Terraria.NPC.NewNPC(
                            Terraria.Projectile.GetNoneSource(),
                            npc.Center.X + (Math.random() * 80 - 40),
                            npc.Center.Y + (Math.random() * 80 - 40),
                            ModNPC.getTypeByName('FamishedMaggot'),
                            0, 0, 0, 0, 0, player.whoAmI
                        );
                    }

                    npc.localAI[3] += toSummon;
                }
            }

            if (npc.localAI[2] >= 90) {
                npc.localAI[1] = 0;
                npc.localAI[2] = 0;
                npc.localAI[0] = 0;
            }
            return false;
        }

        npc.localAI[0]++;

        if (npc.localAI[0] >= PatchWerk.SUMMON_TRIGGER_TICKS && npc.localAI[3] < PatchWerk.MAX_SUMMONS) {
            const player = Terraria.Main.player[npc.target];

            if (player && player.active && !player.dead) {
                const distance = Vector2.Distance(npc.Center, player.Center);

                if (distance < 600) {
                    npc.localAI[1] = 1;
                    npc.localAI[2] = 0;
                    npc.localAI[0] = 0;
                }
            }
        }

        return true;
    }

    AI(npc) {
        if (npc.localAI[1] === 1) return;

        let vel = npc.velocity;
        vel.X *= PatchWerk.SPEED_SCALE;
        if (vel.Y < -PatchWerk.MAX_JUMP_SPEED) {
            vel.Y = -PatchWerk.MAX_JUMP_SPEED;
        }
        npc.velocity = vel;
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;

        if (npc.localAI[1] === 1) {
            frame.Y = frameHeight * 3;
            npc.frame = frame;
            return;
        }

        if (npc.velocity.X === 0 && npc.velocity.Y === 0) {
            frame.Y = 0;
            npc.frame = frame;
            return;
        }

        if (frame.Y < 0 || frame.Y > frameHeight * 2) {
            frame.Y = 0;
        }

        npc.frameCounter += Math.abs(npc.velocity.X);

        if (npc.frameCounter >= 6.0) {
            frame.Y += frameHeight;
            npc.frameCounter = 0.0;
        }

        if (frame.Y > frameHeight * 2) {
            frame.Y = 0;
        }

        npc.frame = frame;
    }
}