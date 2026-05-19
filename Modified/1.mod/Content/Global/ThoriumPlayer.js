import { Terraria, Modules, Microsoft } from "../../TL/ModImports.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Color } from "../../TL/Modules/Color.js";
import { Effects } from "../../TL/Modules/Effects.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";
import { Rectangle } from "../../TL/Modules/Rectangle.js";
import { LifeShieldPlayer } from "./LifeShieldPlayer.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { Rand } from "../../TL/Modules/Rand.js";
import { ModItem } from "../../TL/ModItem.js";
import { Bard, Healer, Thrower } from "./ThoriumClasses.js";
import { ModHealerItem } from "../../Common/ModHealerItem.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];
const StrikeNPCNoInteraction = 'double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)';

const { ItemID } = Terraria.ID

export class ThoriumPlayer extends ModPlayer {
    static class = {
        Bard: new Bard(),
        Healer: new Healer(),
        Thrower: new Thrower()
    }

    constructor() {
        super()
        this.previousItemType = -1;
    }

    //Basic
    static InCombat = false;
    static CombatTimer = 0;
    static CombatDelay = 320;
    static CombatTimeAccumulated = 0

    //Cave Rare Mosnter
    static SalamanterEyeEquipped = false;
    static GiantShellSpineEquipped = false
    static CrawdadClawEquipped = false

    static CrietzEquipped = false
    static CrietzInvoke = false
    static CrietzMaxTimeDelay = 60
    static CrietzTimeDelay = 0

    // Spring Steps
    static SpringStepsEquipped = false;
    static jumps = 0;
    static allowJump = true;

    // Armor, Accessories, etc.
    static LifeRecoveryDelayTime = 0;
    static LifeRecoveryDelayMaxTime = 100;
    static LifeRecoveryExtraValue = 0;

    static LavaHugBuffDelayTime = 0;
    static LivingWoodAcornArmorBuff = false;

    static IncubatedEggBuff = false;
    static IncubatedEggLimit = 4
    static InccubatedEggCount = 0

    static RadiantCorruptionActive = false

    static IcyArmorBuff = false;
    static IcyArmorPro = false;

    static YewWoodSetBonus = false
    static YewWoodAccumulated = 0
    static YewWoodHitsCount = 0

    static NoviceClericSetBonus = false
    static NoviceClericCrossCount = 0
    static NoviceClericCrossDelay = 0
    static NoviceClericCrossMaxDelay = 0
    static NoviceCleric

    static BloomingSetBonus = false

    static ThumbRingEquipped = false

    static SpiritsGraceEquipped = false
    static SpiritsGraceDieEffect = false

    static MoltenScaleEquipped = false
    static MoltenScaleMaxTimeDelay = 15
    static MoltenScaleTimeDelay = 0

    static SeaTurtlesBulwarkEquipped = false
    static SeaTurtlesBulwarkMaxTimeDelay = 60
    static SeaTurtlesBulwarkTimeDelay = 0

    static CoralSetBuff = false
    static CoralSetCount = 0
    static CoralSetResetCount = 0

    static CoralSlasherCharge = 0;
    static CoralSlasherReady = false;

    // Sheath
    static _hitThisSwing = false;
    static ShealthTypes = {
        0: 'LeatherSheath',
        1: 'LeechingSheath',
        2: 'TitanSlayerSheath'
    };
    static SheatType = undefined;
    static SheathMaxCooldown = undefined;
    static SheathCooldown = 0;
    static SheatDamageMultiplier = 0;
    static SheatCriticalChanceBonus = 0;

    // LifeShield
    static LifeShieldActive = false;
    static LifeShieldIsDefault = true;
    static LifeShieldMaxExtraLife = null;
    static LifeShieldHealValue = 1;
    static LifeShieldTimeDelay = 0;
    static LifeShieldMaxTimeDelay = 120;

    static LuckyRabbitsFootEquipped = false
    static BandofReplenishmentEquipped = false

    OnEnterWorld(player) {
    }

    ResetEffects(player) {
        ThoriumPlayer.SpringStepsEquipped = false;
        ThoriumPlayer.IncubatedEggBuff = false;
        ThoriumPlayer.LivingWoodAcornArmorBuff = false;
        ThoriumPlayer.IcyArmorBuff = false;

        ThoriumPlayer.LifeShieldActive = false;
        ThoriumPlayer.LifeShieldMaxExtraLife = null
        ThoriumPlayer.LifeShieldHealValue = 1;
        // ThoriumPlayer.LifeShieldTimeDelay = 0;
        // ThoriumPlayer.LifeShieldMaxTimeDelay = 120;

        ThoriumPlayer.LifeRecoveryDelayMaxTime = 100;
        ThoriumPlayer.LifeRecoveryExtraValue = 0;

        ThoriumPlayer.SheatType = undefined;
        ThoriumPlayer.SheathMaxCooldown = undefined;
        ThoriumPlayer.SheatDamageMultiplier = 0;
        ThoriumPlayer.SheatCriticalChanceBonus = 0;

        ThoriumPlayer.LuckyRabbitsFootEquipped = false
        ThoriumPlayer.BandofReplenishmentEquipped = false

        ThoriumPlayer.SalamanterEyeEquipped = false
        ThoriumPlayer.CrawdadClawEquipped = false
        ThoriumPlayer.GiantShellSpineEquipped = false

        ThoriumPlayer.CrietzEquipped = false

        ThoriumPlayer.NoviceClericSetBonus= false

        ThoriumPlayer.class.Bard.symphonicDamage = 0
        ThoriumPlayer.class.Healer.radiantDamage = 0
        ThoriumPlayer.class.Thrower.throwingDamage = 0

        ThoriumPlayer.class.Bard.multiplier = 1.0
        ThoriumPlayer.class.Healer.multiplier = 1.0
        ThoriumPlayer.class.Healer.healPowerMultiply = 1.0
        ThoriumPlayer.class.Thrower.multiplier = 1.0

        ThoriumPlayer.MoltenScaleEquipped = false

        ThoriumPlayer.RadiantCorruptionActive = false

        ThoriumPlayer.SeaTurtlesBulwarkEquipped = false

        ThoriumPlayer.YewWoodSetBonus = false
        ThoriumPlayer.YewWoodAccumulated = 0

        ThoriumPlayer.ThumbRingEquipped = false

        ThoriumPlayer.SpiritsGraceEquipped = false

        ThoriumPlayer.CoralSetBuff = false
        ThoriumPlayer.CoralSetResetCount = 0
    }

    PreUpdate(player) {
        if (player.dead) {
            ThoriumPlayer.SheathCooldown = 0;
        }

        if (player.HeldItem && player.HeldItem.type !== this.previousItemType) {
            ThoriumPlayer.SheathCooldown = 0;
            this.previousItemType = player.HeldItem.type;
        }

        if (ThoriumPlayer.CoralSetBuff && ThoriumPlayer.CoralSetCount > 0) {
            ThoriumPlayer.LifeShieldActive = true;
            ThoriumPlayer.LifeShieldMaxExtraLife = ThoriumPlayer.CoralSetCount;
        }

        if (ThoriumPlayer.LifeShieldActive) {
            if (ThoriumPlayer.LifeShieldMaxExtraLife === null) return;
            Terraria.GameContent.TextureAssets.Heart = LifeShieldPlayer.Heart_Shield_Texture;
            Terraria.GameContent.TextureAssets.Heart2 = LifeShieldPlayer.Heart2_Shield_Texture;
            Terraria.GameContent.TextureAssets.FancyHeart = LifeShieldPlayer.Heart_Shield_Texture;
            Terraria.GameContent.TextureAssets.FancyHeart2 = LifeShieldPlayer.Heart2_Shield_Texture;
            Terraria.GameContent.TextureAssets.BarHeart = LifeShieldPlayer.BarHeart_Shield_Texture;
            Terraria.GameContent.TextureAssets.BarHeart2 = LifeShieldPlayer.BarHeart2_Shield_Texture;

            ThoriumPlayer.LifeShieldIsDefault = false;

            if (player.statLife < player.statLifeMax2 && !player.dead) {
                ThoriumPlayer.LifeShieldTimeDelay++;
                if (ThoriumPlayer.LifeShieldMaxTimeDelay <= ThoriumPlayer.LifeShieldTimeDelay) {
                    ThoriumPlayer.LifeShieldTimeDelay = 0;
                    LifeShieldPlayer.HealPlayer(player, ThoriumPlayer.LifeShieldHealValue);
                }
            }
        } else if (!ThoriumPlayer.LifeShieldIsDefault) {
            Terraria.GameContent.TextureAssets.Heart = LifeShieldPlayer.Default_Heart;
            Terraria.GameContent.TextureAssets.Heart2 = LifeShieldPlayer.Default_Heart2;
            Terraria.GameContent.TextureAssets.FancyHeart = LifeShieldPlayer.Default_HeartFancy;
            Terraria.GameContent.TextureAssets.FancyHeart2 = LifeShieldPlayer.Default_HeartFancy2;
            Terraria.GameContent.TextureAssets.BarHeart = LifeShieldPlayer.Default_BarHeart;
            Terraria.GameContent.TextureAssets.BarHeart2 = LifeShieldPlayer.Default_BarHeart2;
            ThoriumPlayer.LifeShieldIsDefault = true;
        }
    }

    PostUpdate(player) {
        if (ThoriumPlayer.InCombat) {
            ThoriumPlayer.CombatTimer++;
            ThoriumPlayer.CombatTimeAccumulated++

            if (ThoriumPlayer.CombatTimer >= ThoriumPlayer.CombatDelay) {
                ThoriumPlayer.InCombat = false;
                ThoriumPlayer.CombatTimer = 0;
                ThoriumPlayer.CombatTimeAccumulated = 0
            }
        }

        if (!ThoriumPlayer.CrietzInvoke && ThoriumPlayer.CrietzEquipped) {
            ThoriumPlayer.CrietzTimeDelay++

            if (ThoriumPlayer.CrietzTimeDelay >= ThoriumPlayer.CrietzMaxTimeDelay) {
                ThoriumPlayer.CrietzInvoke = true
                ThoriumPlayer.CrietzTimeDelay = 0
            }
        }

        if (ThoriumPlayer.SeaTurtlesBulwarkEquipped && ThoriumPlayer.SeaTurtlesBulwarkTimeDelay > 0) {
            ThoriumPlayer.SeaTurtlesBulwarkTimeDelay--
        }

        const coralSlasherType = ModItem.getTypeByName('CoralSlasher');
        if (player.HeldItem.type === coralSlasherType && ThoriumPlayer.CoralSlasherCharge >= 3) {
            const dustIdx = Terraria.Dust.NewDust(
                player.position, player.width, player.height,
                33, 0, 0, 0, Color.White, 1.2
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (dust) {
                dust.noGravity = true;
                const vel = dust.velocity;
                vel.X = 0;
                vel.Y = Rand.Next(-4, -2) * 0.5;
                dust.velocity = vel;
            }
            if (!ThoriumPlayer.CoralSlasherReady && player.itemAnimation <= 1) {
                ThoriumPlayer.CoralSlasherReady = true;
            }
        }

        if (!ThoriumPlayer.SpringStepsEquipped) return;

        if (player.velocity.Y < 0 && ThoriumPlayer.allowJump) {
            ThoriumPlayer.allowJump = false;
            ThoriumPlayer.jumps++;
            for (let i = 0; i < 5; i++) {
                Terraria.Dust.NewDust(player.position, player.width, player.height, 6, 0, 0, 0, Color.OrangeRed, 1.2);
            }
        }

        if (player.velocity.Y > 0 || player.sliding || player.justJumped) {
            ThoriumPlayer.allowJump = true;
        }

        if (ThoriumPlayer.jumps >= 3) {
            for (let i = 0; i < 20; i++) {
                Terraria.Dust.NewDust(player.position, player.width, player.height, 6, 0, 0, 0, Color.OrangeRed, 1.5);
            }
            Effects.PlaySound(Terraria.ID.SoundID.Item74, player.Center.x, player.Center.y);
            ThoriumPlayer.jumps = 0;
        }
    }

    ModifyMaxStats(player) {
        if (ThoriumPlayer.LifeShieldActive) return this.CumulativeHealth = ThoriumPlayer.LifeShieldMaxExtraLife;
        return this.CumulativeHealth = 0;
    }

    ModifyWeaponDamage(player, item, damage) {
        let finalDamage = damage

        if (
            ThoriumPlayer.SheathMaxCooldown !== undefined &&
            ThoriumPlayer.SheatType !== undefined &&
            ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown &&
            item.melee &&
            item.useStyle === Terraria.ID.ItemUseStyleID.Swing
        ) {
            switch (ThoriumPlayer.SheatType) {
                case 0:
                    finalDamage += this.MultiplyDamage(damage);
            }
        }

        if (player.FindBuffIndex(ModBuff.getTypeByName('CharmedBuff'))) {
            finalDamage -= this.WeaponDamage * 0.2
        }

        return this.WeaponDamage = finalDamage;
    }

    ModifyShootStats(player, stats) {
        let finalDamageBonus = 0

        if (player.HeldItem.useAmmo == Terraria.ID.AmmoID.Arrow && ThoriumPlayer.ThumbRingEquipped) {
            finalDamageBonus += stats.damage * 0.05
        }

        stats.damage += finalDamageBonus
    }

    PostUpdateBuffs(player) {
        if (
            ThoriumPlayer.SheathMaxCooldown !== undefined &&
            ThoriumPlayer.SheatType !== undefined &&
            ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown
        ) {
            player.meleeCrit += ThoriumPlayer.SheatCriticalChanceBonus;
        }
    }

    OnHitNPC(player, item, npc, damageDone, knockBack) {
        ThoriumPlayer.EnterCombat();

        if (
            ThoriumPlayer.SheathMaxCooldown !== undefined &&
            ThoriumPlayer.SheatType !== undefined &&
            ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown &&
            item.melee &&
            item.useStyle === Terraria.ID.ItemUseStyleID.Swing
        ) {
            ThoriumPlayer.SheathCooldown = 0;
            ThoriumPlayer._hitThisSwing = true;
        }

        if (ThoriumPlayer.CrietzInvoke && ThoriumPlayer.IsCriticalDamage(item, damageDone)) {
            ThoriumPlayer.CrietzProjectile(player, npc)
        }

        if (ThoriumPlayer.CoralSetBuff) {
            if(!ModHealerItem.healerItemsName.has(item.type)) return
            
            ThoriumPlayer.CoralSetCount += Math.max(1, Math.floor(damageDone / 4));
            if (ThoriumPlayer.CoralSetCount > 20) ThoriumPlayer.CoralSetCount = 20;
        }
    }

    OnHitNPCWithProj(player, npc, projectile) {
        ThoriumPlayer.EnterCombat();

        const isRangedWeapon = player.HeldItem.ranged
        if (isRangedWeapon) ThoriumPlayer.YewWoodHitsCount++

        const isHealerWeapon = ModHealerItem.healerItemsName.has(player.HeldItem.type)
        if(isHealerWeapon) {
            if(ThoriumPlayer.BloomingSetBonus) player.AddBuff(ModBuff.getTypeByName('OvergrowthBuff'), 120, false)
        }

        if (ThoriumPlayer.IncubatedEggBuff) {
            if (projectile.minion || Terraria.ID.ProjectileID.Sets.MinionShot[projectile.type]) {
                if (ThoriumPlayer.InccubatedEggCount >= ThoriumPlayer.IncubatedEggLimit) return
                if (Math.random() < 0.9) return;

                const eggType = ModProjectile.getTypeByName('IncubatedSpider');
                const source = projectile.GetProjectileSource_FromThis();

                NewProjectile(source, npc.Center, Vector2.new(0, -2), eggType, 2, 0, player.whoAmI, 0, 0, 0, null);
                ThoriumPlayer.InccubatedEggCount++
            }
        }

        if (ThoriumPlayer.CrietzInvoke) {
            ThoriumPlayer.CrietzProjectile(player, npc)
        }

        if (ThoriumPlayer.YewWoodHitsCount > 6 && ThoriumPlayer.YewWoodSetBonus && isRangedWeapon) {
            let damage = player.HeldItem.damage
            ThoriumPlayer.MiniCriticalDamage(npc, damage + Rand.Next(damage, damage + Math.round(damage * 0.1)))
            ThoriumPlayer.YewWoodHitsCount = 0
        }

        if (ThoriumPlayer.ThumbRingEquipped) {
            if (projectile.arrow) {
                npc.AddBuff(153, Rand.Next(60, 120), false)
            }
        }

        if (ThoriumPlayer.CoralSetBuff) {
            if(!ModHealerItem.healerItemsName.has(player.HeldItem.type)) return

            ThoriumPlayer.CoralSetCount += Math.max(1, Math.floor(projectile.damage / 4));
            if (ThoriumPlayer.CoralSetCount > 20) ThoriumPlayer.CoralSetCount = 20;
        }
    }

    OnHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        ThoriumPlayer.EnterCombat();

        if (!pvp && ThoriumPlayer.BandofReplenishmentEquipped) {
            if (damage > 3 && Rand.Next(0, 3) === 0) {
                player.Heal(1)

                player.statMana += 1;
                player.ManaEffect(1)
            }
        }

        if (!pvp && ThoriumPlayer.SeaTurtlesBulwarkEquipped && ThoriumPlayer.SeaTurtlesBulwarkTimeDelay <= 0) {
            const projType = ModProjectile.getTypeByName('SeaTurtlesBulwarkPro');
            const speed = 2.0 + Math.random() * 1.5;
            const angle = Math.random() * Math.PI * 2;
            const vel = Vector2.new(Math.cos(angle) * speed, Math.sin(angle) * speed);
            const source = Terraria.Projectile.GetNoneSource()
            const healValue = Math.floor(damage * 0.25)

            NewProjectile(
                source,
                player.Center,
                vel,
                projType,
                0,
                0,
                player.whoAmI,
                0, 0, healValue,
                null
            );

            ThoriumPlayer.SeaTurtlesBulwarkTimeDelay = ThoriumPlayer.SeaTurtlesBulwarkMaxTimeDelay;
        }
    }

    PostItemCheck(player) {
        if (player.itemAnimation === 1 &&
            ThoriumPlayer.SheatType !== undefined &&
            player.HeldItem.melee) {
            ThoriumPlayer.SheathCooldown = 0;
            ThoriumPlayer._hitThisSwing = false;
        }
    }

    MultiplyDamage(damage) {
        return damage * (1 + ThoriumPlayer.SheatDamageMultiplier);
    }

    UseTimeMultiplier(player, item) {
        if (ThoriumPlayer.YewWoodAccumulated > 0) {
            if (player.HeldItem.ranged)
                return 1.0 - ThoriumPlayer.YewWoodAccumulated * 0.025;
        }
        return 1.0;
    }

    UseAnimationMultiplier(player, item) {
        if (ThoriumPlayer.YewWoodAccumulated > 0) {
            if (player.HeldItem.ranged)
                return 1.0 - ThoriumPlayer.YewWoodAccumulated * 0.025;
        }
        return 1.0;
    }

    ModifyManaCost(player, item, mana) {
        if(ThoriumPlayer.NoviceClericSetBonus) {

        }
    }

    OnRespawn(player) {
        ThoriumPlayer.CoralSetCount = 0

        ThoriumPlayer.CoralSlasherCharge = 0;
        ThoriumPlayer.CoralSlasherReady = false;

        if (ThoriumPlayer.SpiritsGraceDieEffect) {
            player['void AddBuff(int type, int time, bool fromNetPvP)'](ModBuff.getTypeByName('SpiritsGraceBuff'), 60, false);
            ThoriumPlayer.SpiritsGraceDieEffect = false
        }
    }

    static MiniCriticalDamage(npc, damage) {
        npc[StrikeNPCNoInteraction](
            Math.round(damage * 0.75),
            0,
            npc.direction ?? 1,
            true, false, false
        );
    }

    static IsCriticalDamage(item, damageDone) {
        const baseDamage = item.damage;
        return damageDone >= baseDamage * 1.5;
    }

    static ReadySeathEffect(player) {
        const numDusts = 36;
        const baseSpeed = 7;

        for (let i = 0; i < numDusts; i++) {
            const angle = (i / numDusts) * Math.PI * 2;
            const speedVariation = baseSpeed + (Math.random() * 2.0 - 1.0);
            const speedX = Math.cos(angle) * speedVariation;
            const speedY = Math.sin(angle) * speedVariation;

            let dustIndex = Terraria.Dust.NewDust(player.Center, 0, 0, 228, 0, 0, 50, Color.White, 2.0 + (Math.random() * 0.6));
            let d = Terraria.Main.dust[dustIndex];
            d.noGravity = true;
            d.rotation = angle;
            d.velocity = Vector2.new(speedX, speedY);
        }

        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2;
            const speedX = Math.cos(angle) * (baseSpeed * 0.35);
            const speedY = Math.sin(angle) * (baseSpeed * 0.35);

            let dustIndex = Terraria.Dust.NewDust(player.Center, 0, 0, 228, 0, 0, 100, Color.White, 1.3 + (Math.random() * 0.4));
            let d = Terraria.Main.dust[dustIndex];
            d.noGravity = true;
            d.velocity = Vector2.new(speedX, speedY);
        }
    }

    static LuckyRabbitsFootSpawnCoins(npc) {
        const COPPER = ItemID.CopperCoin;
        const SILVER = ItemID.SilverCoin;
        const GOLD = ItemID.GoldCoin;
        const PLAT = ItemID.PlatinumCoin;

        let value = npc.value;

        let plat = Math.floor(value / 1000000);
        value %= 1000000;

        let gold = Math.floor(value / 10000);
        value %= 10000;

        let silver = Math.floor(value / 100);
        value %= 100;

        let copper = value;

        const x = npc.position.X;
        const y = npc.position.Y;
        const w = npc.width;
        const h = npc.height;

        if (plat > 0)
            NewItem(x, y, w, h, PLAT, plat, false, 0, false);

        if (gold > 0)
            NewItem(x, y, w, h, GOLD, gold, false, 0, false);

        if (silver > 0)
            NewItem(x, y, w, h, SILVER, silver, false, 0, false);

        if (copper > 0)
            NewItem(x, y, w, h, COPPER, copper, false, 0, false);
    }

    static HealHPInHealerClass(player, value) {
        if(value <= 0) return 0;
        return player.Heal(Math.max(1, value * this.class.Healer.healPowerMultiply + this.class.Healer.healPowerExtraValue))
    }

    static EnterCombat() {
        ThoriumPlayer.InCombat = true;
        ThoriumPlayer.CombatTimer = 0;
    }

    static CrietzProjectile(player, npc) {
        const projType = ModProjectile.getTypeByName('CrietzPro');
        const speed = 2;
        const count = Rand.Next(2, 4);
        const baseDir = Vector2.new(0, -1);
        for (let i = 0; i < count; i++) {
            const angle = (Rand.NextFloat() < 0.5 ? -1 : 1) * (0.3 + Rand.NextFloat() * 0.3);
            const dir = Vector2.RotatedBy(baseDir, angle);
            const vel = Vector2.Multiply(dir, speed);
            const damage = player.HeldItem != null ? player.HeldItem.damage : 10;
            const source = player.GetProjectileSource_Item(player.HeldItem);
            Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'](
                source, npc.Center, vel, projType, damage, 4, player.whoAmI, 0, 0, 0, null
            );
        }
        ThoriumPlayer.CrietzInvoke = false;
    }
}