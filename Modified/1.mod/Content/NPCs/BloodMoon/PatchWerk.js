import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModGore } from '../../../TL/ModGore.js';
import { ModSystem } from '../../../TL/ModSystem.js';
import { WorldDB } from '../../../TL/WorldDB.js';

const { Camera, Color, Vector2, Utils } = Modules;
const Main = new NativeClass('Terraria', 'Main');
const Player = new NativeClass('Terraria', 'Player');
const Vector2Native = new NativeClass('Microsoft.Xna.Framework', 'Vector2');
const NPC = new NativeClass('Terraria', 'NPC');
const SoundEngine = new NativeClass('Terraria.Audio', 'SoundEngine');
const Dust = new NativeClass('Terraria', 'Dust');
const Projectile = new NativeClass('Terraria', 'Projectile');
const UnifiedRandom = new NativeClass('Terraria.Utilities', 'UnifiedRandom');

const PlaySound = SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NextVector2Square = Utils['Vector2 NextVector2Square(UnifiedRandom r, float min, float max)'];
const RotatedByRandom = Utils['Vector2 RotatedByRandom(Vector2 spinninpoint, double maxRadians)'];
const Normalize = Vector2['void Normalize()'];
const NewProjectile2 = Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const Distance = Vector2['float Distance(Vector2 value1, Vector2 value2)'];

const Next = UnifiedRandom['int Next(int minValue, int maxValue)'];

const vector = (x, y) => { let v = Vector2Native.new(); v.X = x; v.Y = y; return v; };
const AnyPlayerAlive = () => {
    for (let i = 0; i < Main.maxPlayers; i++) {
        if (Main.player[i].active && !Main.player[i].dead) return true;
    }
    return false;
};

const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const {
    BestiaryDatabaseNPCsPopulator,
    FlavorTextBestiaryInfoElement,
    MoonLordPortraitBackgroundProviderBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];

export class PatchWerk extends ModNPC {
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
        this.NPC.width = 110;
        this.NPC.height = 110;
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
        this.SpawnWithHigherTime = 30;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(MoonLordPortraitBackgroundProviderBestiaryInfoElement.new());

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.BloodMoon && WorldDB.get('Thorium:HasBeenDefeated_PatchWerk') !== true) {
            return 0.07;
        }
        return 0;
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 5, 20, 4));
    }

    OnKill(npc) {
        const hasBeenDefeteated = WorldDB.get('HasBeenDefeated_PatchWerk')
        if(hasBeenDefeteated === true) return Terraria.Main['void NewText(string newText, Color color)'](`${ModLocalization.Translate('SinalizationChatMessage.OnPatchWerkDie'), Color.Orange}`);

        WorldDB.set('Thorium:HasBeenDefeated_PatchWerk', true);
        if (!Terraria.Main.dayTime) {
            const ticksUntilDaybreak = Math.floor(54000 - Terraria.Main.time);
            ModSystem.SetTimeout(() => {
                WorldDB.set('Thorium:CanSpawnAbomination', true);
            }, ticksUntilDaybreak);
        }
    }

    PreAI(npc) {
        const player = Main.player[npc.target];
        if (npc.localAI[1] === 1) {
            let vel = npc.velocity;
            vel.X = 0;
            npc.velocity = vel;

            npc.localAI[2]++;

            if (npc.localAI[2] === 45) {
                const player = Terraria.Main.player[npc.target];
                if (player && player.active && !player.dead) {
                    for (let i = 0; i < 3; i++) {
                        Terraria.NPC.NewNPC(
                            Terraria.Projectile.GetNoneSource(),
                            npc.Center.X + (Math.random() * 80 - 40),
                            npc.Center.Y + (Math.random() * 80 - 40),
                            ModNPC.getTypeByName('FamishedMaggot'),
                            0, 0, 0, 0, 0, player.whoAmI
                        );
                    }
                }
            }

            if (npc.localAI[2] >= 90) {
                npc.localAI[1] = 0;
                npc.localAI[2] = 0;
                npc.localAI[0] = 0;
            }
            return false;
        }

        npc.TargetClosest(true);
        npc.localAI[0]++;

        if (npc.localAI[0] >= 480) {
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

        // Movimento mais lento
        let vel = npc.velocity;
        if (vel.Y === 0) {
            vel.X += npc.direction * 0.3;
            if (Math.abs(vel.X) > 3.5) {
                vel.X = 3.5 * npc.direction;
            }
        }
        npc.velocity = vel;

        return true;
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