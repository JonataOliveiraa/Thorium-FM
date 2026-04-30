import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { ModSystem } from '../../../TL/ModSystem.js';

const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const {
    BestiaryDatabaseNPCsPopulator,
    FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const { Color, Vector2, Rand } = Modules;
const Main = new NativeClass('Terraria', 'Main');
const Player = new NativeClass('Terraria', 'Player');
const Vector2Native = new NativeClass('Microsoft.Xna.Framework', 'Vector2');
const NPC = new NativeClass('Terraria', 'NPC');
const SoundEngine = new NativeClass('Terraria.Audio', 'SoundEngine');
const Dust = new NativeClass('Terraria', 'Dust');
const Projectile = new NativeClass('Terraria', 'Projectile');
const UnifiedRandom = new NativeClass('Terraria.Utilities', 'UnifiedRandom');
const SpriteEffects = new NativeClass('Microsoft.Xna.Framework.Graphics', 'SpriteEffects');
const TextureAssets = new NativeClass('Terraria.GameContent', 'TextureAssets');

const PlaySound = SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];
const NewProjectile2 = Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const Next = UnifiedRandom['int Next(int minValue, int maxValue)'];
const vector = (x, y) => { let v = Vector2Native.new(); v.X = x; v.Y = y; return v; };
const NewNPC = NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];

export class Abomination extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/BloodMoon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 3;
    }

    SetDefaults() {
        this.NPC.width = 35;
        this.NPC.height = 17;
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;
        this.NPC.damage = 10;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 120;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    OnHitPlayer(npc, player, target, damage, crit) {
        const buffType = 24;
        const duration = 240;
        player['void AddBuff(int type, int time, bool fromNetPvP)'](buffType, duration, false);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Events.BloodMoon);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Abomination');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.BloodMoon && WorldDB.get('Thorium:CanSpawnAbomination') === true) {
            return 0.15;
        }
        return 0;
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 5, 20, 4));
    }

    PostAI(npc) {
        npc.TargetClosest(true);

        const player = Terraria.Main.player[npc.target];
        if (player && player.active && !player.dead) {
            npc.direction = (player.Center.X < npc.Center.X) ? -1 : 1;
        }

        let vel = npc.velocity;

        if (vel.Y === 0) {
            vel.X += npc.direction * 0.4;

            if (Math.abs(vel.X) > 4.5) {
                vel.X = 4.5 * npc.direction;
            }
        }

        npc.velocity = vel;
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
                5, speedX, speedY, 0, Color.new(0, 0, 0, 0), scale
            );
        }
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;

        if (npc.velocity.X === 0 && npc.velocity.Y === 0) {
            frame.Y = 0;
            npc.frame = frame;
            return;
        }

        npc.frameCounter += Math.abs(npc.velocity.X);

        if (npc.frameCounter >= 6.0) {
            frame.Y += frameHeight;
            npc.frameCounter = 0.0;

            if (frame.Y >= frameHeight * Terraria.Main.npcFrameCount[this.Type]) {
                frame.Y = 0;
            }
        }

        npc.frame = frame;
    }

    OnKill(npc) {
        const player = Main.player[npc.target];
        const centerX = npc.Center.X;
        const centerY = npc.Center.Y;

        ModSystem.SetTimeout(() => {
            Terraria.NPC.NewNPC(
                Terraria.Projectile.GetNoneSource(),
                centerX + (Math.random() * 80 - 40),
                centerY + (Math.random() * 80 - 40),
                ModNPC.getTypeByName('BloodDrop'),
                0, 0, 0, 0, 0, player.whoAmI
            );
        }, 15);

        ModSystem.SetTimeout(() => {
            Terraria.NPC.NewNPC(
                Terraria.Projectile.GetNoneSource(),
                centerX + (Math.random() * 80 - 40),
                centerY + (Math.random() * 80 - 40),
                ModNPC.getTypeByName('SeveredLegs'),
                0, 0, 0, 0, 0, player.whoAmI
            );
        }, 30);

        ModSystem.SetTimeout(() => {
            Terraria.NPC.NewNPC(
                Terraria.Projectile.GetNoneSource(),
                centerX + (Math.random() * 80 - 40),
                centerY + (Math.random() * 80 - 40),
                ModNPC.getTypeByName('GraveLimb'),
                0, 0, 0, 0, 0, player.whoAmI
            );
        }, 45);
    }
}