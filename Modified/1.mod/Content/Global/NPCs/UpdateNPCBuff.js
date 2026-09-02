import { GlobalNPC } from "../../../TL/GlobalNPC.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Terraria } from "../../../TL/ModImports.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { ThoriumPlayer } from "../ThoriumPlayer.js";
import { ElementalDecayBuff } from "../../Buffs/ElementalDecayBuff.js";
import { SingedBuff } from "../../Buffs/SingedBuff.js";
import { GraniteSurgeBuff } from "../../Buffs/GraniteSurgeBuff.js";

const { NPCID } = Terraria.ID;

const CLOTHIER_VANITY_SETS = [
    { phases: [0, 1], pieces: ['UselessWig', 'UselessVest', 'UselessBoots'] },
    { phases: [2, 3], pieces: ['ExplosiveHat', 'ExplosiveCloak', 'ExplosiveBooties'] },
    { phases: [4, 5], pieces: ['MeatShieldsWig', 'MeatShieldsVest', 'MeatShieldsBoots'] },
    { phases: [6, 7], pieces: ['TrashWig', 'TrashTracksuit', 'TrashBoots'] }
];
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const FindBuffIndex = 'int FindBuffIndex(int type)';
const StrikeNPCNoInteraction = 'double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)';

export class UpdateNPCBuff extends GlobalNPC {
    static Flag = {
        Stunned: 1,
        Petrify: 2,
        Charmed: 4,
        Decay: 8,
        Singed: 16,
        Distorted: 32
    };

    static Tint = { None: 0, Pink: 1, Stone: 2 };

    static Ready = false;
    static FlagByBuff = new Map();
    static GraniteSurgeType = -1;
    static StunnedType = -1;
    static StunImmuneNPCs = new Set();

    static Tinted = new Uint8Array(Terraria.Main.maxNPCs);

    static Repel = { Bat: 1, Fish: 2, Insect: 4, Skeleton: 8, Zombie: 16 };
    static RepelCache = new Map();
    static RepelSpawnBlockChance = 0.75;
    static ConfusedType = 31;
    static ConfusedTime = 180;

    static Pink = Color.Pink;
    static Transparent = Color.Transparent;
    static Stone = Color.new(115, 115, 115);
    static Gold = Color.LightGoldenrodYellow;

    static SlowCharmed = Vector2.new(0.85, 0.85);
    static SlowDistorted = Vector2.new(0.60, 0.60);
    static PetrifyOffset = Vector2.new(2, 2);

    static FreezeLifeMax = 900;
    static CharmedLifeMax = 400;
    static CharmedDamageMult = 0.80;

    static WormParts = new Set([
        NPCID.EaterofWorldsHead,
        NPCID.EaterofWorldsBody,
        NPCID.EaterofWorldsTail,
        NPCID.GiantWormHead,
        NPCID.GiantWormBody,
        NPCID.GiantWormTail,
        NPCID.TheDestroyer,
        NPCID.TheDestroyerBody,
        NPCID.TheDestroyerTail
    ]);

    static Init() {
        const flag = UpdateNPCBuff.Flag;
        const map = UpdateNPCBuff.FlagByBuff;

        const bind = (name, bit) => {
            const type = ModBuff.getTypeByName(name);
            if (type > 0) map.set(type, bit);
        };

        bind('StunnedBuff', flag.Stunned);
        bind('PetrifyBuff', flag.Petrify);
        bind('CharmedBuff', flag.Charmed);
        bind('ElementalDecayBuff', flag.Decay);
        bind('SingedBuff', flag.Singed);
        bind('DistortedTimeEnemy', flag.Distorted);

        UpdateNPCBuff.GraniteSurgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
        UpdateNPCBuff.StunnedType = ModBuff.getTypeByName('StunnedBuff') ?? -1;

        UpdateNPCBuff.StunImmuneNPCs.clear();
        for (const name of ['RedHag', 'GreenHag', 'BlueHag', 'CyanHag']) {
            const type = ModNPC.getTypeByName(name);
            if (type > 0) UpdateNPCBuff.StunImmuneNPCs.add(type);
        }

        UpdateNPCBuff.Ready = true;
    }

    ClearImmuneBuffs(npc) {
        const stunned = UpdateNPCBuff.StunnedType;
        if (stunned <= 0 || !UpdateNPCBuff.StunImmuneNPCs.has(npc.type)) return;

        const index = npc[FindBuffIndex](stunned);
        if (index >= 0) npc.DelBuff(index);
    }

    ReadFlags(npc) {
        const types = npc.buffType;
        if (types[0] === 0) return 0;

        const map = UpdateNPCBuff.FlagByBuff;
        let flags = 0;

        for (let i = 0, n = types.length; i < n; i++) {
            const type = types[i];
            if (type === 0) break;
            flags |= map.get(type) ?? 0;
        }

        return flags;
    }

    IsSmall(npc) {
        return !UpdateNPCBuff.WormParts.has(npc.type)
            && npc.lifeMax < UpdateNPCBuff.FreezeLifeMax
            && !npc.boss;
    }

    SetTint(npc, slot, want) {
        if (UpdateNPCBuff.Tinted[slot] === want) return;
        UpdateNPCBuff.Tinted[slot] = want;

        const tint = UpdateNPCBuff.Tint;
        npc.color = want === tint.Stone ? UpdateNPCBuff.Stone
            : want === tint.Pink ? UpdateNPCBuff.Pink
            : UpdateNPCBuff.Transparent;
    }

    static RepelMaskOf(npc) {
        const cached = UpdateNPCBuff.RepelCache.get(npc.type);
        if (cached !== undefined) return cached;

        let mask = 0;
        const repel = UpdateNPCBuff.Repel;
        if (ThoriumPlayer.IsBatNPC(npc)) mask |= repel.Bat;
        if (ThoriumPlayer.IsFishNPC(npc)) mask |= repel.Fish;
        if (ThoriumPlayer.IsInsectNPC(npc)) mask |= repel.Insect;
        if (ThoriumPlayer.IsSkeletonNPC(npc)) mask |= repel.Skeleton;
        if (ThoriumPlayer.IsZombieNPC(npc)) mask |= repel.Zombie;

        UpdateNPCBuff.RepelCache.set(npc.type, mask);
        return mask;
    }

    static ActiveRepelMask() {
        const repel = UpdateNPCBuff.Repel;
        let mask = 0;
        if (ThoriumPlayer.repellentBats) mask |= repel.Bat;
        if (ThoriumPlayer.repellentFish) mask |= repel.Fish;
        if (ThoriumPlayer.repellentInsects) mask |= repel.Insect;
        if (ThoriumPlayer.repellentSkeletons) mask |= repel.Skeleton;
        if (ThoriumPlayer.repellentZombies) mask |= repel.Zombie;
        return mask;
    }

    static IsRepelled(npc) {
        const active = UpdateNPCBuff.ActiveRepelMask();
        if (active === 0) return false;
        if (npc.boss || npc.friendly || npc.townNPC) return false;
        return (UpdateNPCBuff.RepelMaskOf(npc) & active) !== 0;
    }

    OnSpawn(npc) {
        if (!UpdateNPCBuff.IsRepelled(npc)) return;
        if (Math.random() >= UpdateNPCBuff.RepelSpawnBlockChance) return;

        npc.active = false;
        npc.life = 0;
    }

    OnHitPlayer(npc, player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        if (!UpdateNPCBuff.IsRepelled(npc)) return;
        npc.AddBuff(UpdateNPCBuff.ConfusedType, UpdateNPCBuff.ConfusedTime, false);
    }

    PreAI(npc) {
        if (npc.target === 255) return true;
        if (UpdateNPCBuff.IsRepelled(npc)) npc.target = 255;
        return true;
    }

    PostAI(npc) {
        if (!UpdateNPCBuff.Ready) UpdateNPCBuff.Init();

        this.ClearImmuneBuffs(npc);

        const slot = npc.whoAmI;
        const flags = this.ReadFlags(npc);
        const tint = UpdateNPCBuff.Tint;

        if (flags === 0) {
            this.SetTint(npc, slot, tint.None);
            return;
        }

        const flag = UpdateNPCBuff.Flag;
        const small = this.IsSmall(npc);
        const frozen = small && (flags & flag.Petrify) !== 0;
        const charmed = small && (flags & flag.Charmed) !== 0;

        if (frozen) {
            npc.position = npc.oldPosition;
            npc.netOffset = Vector2.Zero;
            npc.frameCounter = 0;
            npc.velocity = Vector2.Zero;
            this.PetrifyEffects(npc);
        } else if (small && (flags & flag.Stunned) !== 0) {
            npc.velocity = Vector2.Zero;
        }

        this.SetTint(npc, slot, frozen ? tint.Stone : charmed ? tint.Pink : tint.None);

        if (charmed) {
            if (!frozen) npc.velocity = Vector2.Multiply(npc.velocity, UpdateNPCBuff.SlowCharmed);
            this.CharmEffects(npc);
        }

        if ((flags & flag.Decay) !== 0) this.DecayEffects(npc);
        if ((flags & flag.Singed) !== 0) this.SingedEffects(npc);

        if (small && !frozen && (flags & flag.Distorted) !== 0) {
            npc.velocity = Vector2.Multiply(npc.velocity, UpdateNPCBuff.SlowDistorted);
        }
    }

    PetrifyEffects(npc) {
        Effects.AddLight(npc.Center, 0.1, 0.1, 0.1);

        if (Rand.Next(4) === 0) return;

        const index = NewDust(
            Vector2.Subtract(npc.position, UpdateNPCBuff.PetrifyOffset),
            npc.width, npc.height,
            1, 0, 0, 100, UpdateNPCBuff.Transparent, 0.6
        );
        const dust = Terraria.Main.dust[index];
        if (!dust) return;

        dust.noGravity = true;
        const velocity = Vector2.Multiply(dust.velocity, 1.8);
        velocity.Y -= 0.5;
        dust.velocity = velocity;

        if (Rand.Next(4) === 0) {
            dust.noGravity = false;
            dust.scale *= 0.5;
        }
    }

    CharmEffects(npc) {
        if (Math.random() < 0.85) return;

        let direction = Vector2.new(Rand.Next(-10, 11), Rand.Next(-10, 11));
        direction = Vector2.Normalize(direction);
        direction.X *= 0.66;

        const index = NewGore(
            Vector2.Add(npc.position, Vector2.new(Rand.Next(npc.width + 1), Rand.Next(npc.height + 1))),
            Vector2.Multiply(direction, Rand.Next(3, 6) * 0.33),
            331,
            Rand.Next(40, 121) * 0.01
        );
        Terraria.Main.gore[index].sticky = false;
    }

    DecayEffects(npc) {
        npc.localAI[0]++;

        if (!Rand.NextChance(0.25)) return;

        if (npc.localAI[0] >= 60) {
            npc.localAI[0] = 0;
            npc[StrikeNPCNoInteraction](ElementalDecayBuff.Damage, 0, npc.direction ?? 1, false, false, false);
        }

        for (let type = 86; type <= 90; type++) {
            const index = NewDust(
                npc.position, npc.width, npc.height,
                type, 0, -1, 100, UpdateNPCBuff.Transparent, 0.75
            );
            const dust = Terraria.Main.dust[index];
            if (!dust) continue;

            dust.noGravity = true;
            if (Rand.NextChance(0.25)) dust.scale *= 0.6;
        }
    }

    SingedEffects(npc) {
        npc.localAI[1]++;

        if (!Rand.NextChance(0.25)) return;

        if (npc.localAI[1] >= 60) {
            npc.localAI[1] = 0;
            npc[StrikeNPCNoInteraction](SingedBuff.Damage, 0, npc.direction ?? 1, false, false, false);
        }

        const index = NewDust(
            npc.position, npc.width, npc.height,
            66,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            150, UpdateNPCBuff.Gold, 0.4
        );
        const spark = Terraria.Main.dust[index];
        if (!spark) return;

        spark.noGravity = true;
        spark.fadeIn = 0.6;
    }

    UpdateLifeRegen(npc, damage) {
        if (!UpdateNPCBuff.Ready) UpdateNPCBuff.Init();
        if (npc[FindBuffIndex](UpdateNPCBuff.GraniteSurgeType) < 0) return;

        if (npc.lifeRegen > 0) npc.lifeRegen = 0;
        npc.lifeRegen -= GraniteSurgeBuff.Damage;

        if (Math.random() >= 0.2) return;

        const index = NewDust(
            npc.position, npc.width, npc.height,
            59, 0, 0, 100, UpdateNPCBuff.Transparent, 1
        );
        const spark = Terraria.Main.dust[index];
        if (spark) spark.noGravity = true;
    }

    OnHitByPlayer(npc, player, item, damageDone, knockBack) {
        if (!UpdateNPCBuff.Ready) UpdateNPCBuff.Init();
        if (!damageDone || npc[FindBuffIndex](UpdateNPCBuff.GraniteSurgeType) < 0) return;

        const extra = Math.floor(damageDone * GraniteSurgeBuff.DamageTakenBonus);
        if (extra < 1) return;

        npc[StrikeNPCNoInteraction](extra, 0, npc.direction ?? 1, false, true, false);
    }

    ModifyHitPlayer(npc, player, modifiers) {
        if (!UpdateNPCBuff.Ready) UpdateNPCBuff.Init();
        if (UpdateNPCBuff.WormParts.has(npc.type)) return;
        if (npc.lifeMax >= UpdateNPCBuff.CharmedLifeMax || npc.boss) return;
        if ((this.ReadFlags(npc) & UpdateNPCBuff.Flag.Charmed) === 0) return;

        modifiers.damage = modifiers.damage * UpdateNPCBuff.CharmedDamageMult;
    }

    OnKill(npc) {
        if (npc.boss) ThoriumPlayer.BossKillTimer = 540;
        if (ThoriumPlayer.LuckyRabbitsFootEquipped && Rand.Next(0, 5) === 0) {
            ThoriumPlayer.LuckyRabbitsFootSpawnCoins(npc);
        }

        if (ThoriumPlayer.FabergeEggEquipped) {
            ThoriumPlayer.TrySpawnFabergeEgg(
                Terraria.Main.player[Terraria.Main.myPlayer],
                npc,
                ThoriumPlayer.FabergeEggKillChance
            );
        }
    }

    SetupShop(npc, player, npcShop) {
        // Merchant
        if (npc.type === 17) {
            if (Terraria.NPC.downedBoss3) {
                npcShop.Add(ModItem.getTypeByName('YarnBall'));
            }
        }
        
        // Witch Doctor
        if (npc.type === 228) {
            npcShop.Add(ModItem.getTypeByName('MantisCane'));
        }
        
        // Skeleton Merchant
        if (npc.type === 453) {
            npcShop.Add(ModItem.getTypeByName('Trapper'));
    
            const rotation = [];
            for (const name of ['GiantShellSpine', 'SalamanderEye', 'CrawdadClaw']) {
                const type = ModItem.getTypeByName(name);
                if (type > 0) rotation.push(type);
            }
            if (rotation.length > 0) {
                const phase = Terraria.Main.moonPhase;
                npcShop.Add(rotation[(phase > 0 ? phase : 0) % rotation.length]);
            }
        }

        if (npc.type === Terraria.ID.NPCID.GoblinTinkerer) {
            npcShop.Add(ModItem.getTypeByName('CorkGrease'));
        }

        if (npc.type === Terraria.ID.NPCID.Clothier) {
            const set = CLOTHIER_VANITY_SETS.find(s => s.phases.includes(Terraria.Main.moonPhase));
            if (set) {
                for (const name of set.pieces) {
                    npcShop.Add(ModItem.getTypeByName(name));
                }
            }
        }
    }
}
