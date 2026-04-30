import { Terraria, Modules, Microsoft } from "../../TL/ModImports.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModTexture } from "../../TL/ModTexture.js";
import { Color } from "../../TL/Modules/Color.js";
import { Effects } from "../../TL/Modules/Effects.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";
import { Rectangle } from "../../TL/Modules/Rectangle.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ThoriumPlayer extends ModPlayer {

    // SpringSteps
    static SpringStepsEquipped = false;
    static jumps = 0;
    static allowJump = true;

    // Armor, Accessories, etc.
    static LifeRecoveryBuffDelayTime = 0;
    static LavaHugBuffDelayTime = 0;
    static LivingWoodAcornArmorBuff = false;
    static IncubatedEggBuff = false;
    static IcyArmorBuff = false;
    static IcyArmorPro = false;

    // Sheath
    static _hitThisSwing = false;
    static Types = {
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
    static Default_Heart;
    static Default_Heart2;
    static Default_HeartFancy;
    static Default_HeartFancy2;
    static Default_BarHeart;
    static Default_BarHeart2;
    static Heart_Shield_Texture;
    static Heart2_Shield_Texture;
    static BarHeart_Shield_Texture;
    static BarHeart2_Shield_Texture;

    constructor() {
        super();
        this.previousItemType = -1;
    }

    OnEnterWorld(player) {
    }

    ResetEffects(player) {
        ThoriumPlayer.SpringStepsEquipped = false;
        ThoriumPlayer.IncubatedEggBuff = false;
        ThoriumPlayer.LivingWoodAcornArmorBuff = false;
        ThoriumPlayer.IcyArmorBuff = false;

        ThoriumPlayer.LifeShieldActive = false;

        ThoriumPlayer.SheatType = undefined;
        ThoriumPlayer.SheathMaxCooldown = undefined;
        ThoriumPlayer.SheatDamageMultiplier = 0;
        ThoriumPlayer.SheatCriticalChanceBonus = 0;
    }

    PreUpdate(player) {
        if (player.dead) {
            ThoriumPlayer.SheathCooldown = 0;
        }

        if (player.HeldItem && player.HeldItem.type !== this.previousItemType) {
            ThoriumPlayer.SheathCooldown = 0;
            this.previousItemType = player.HeldItem.type;
        }

        if (ThoriumPlayer.LifeShieldActive) {
            Terraria.GameContent.TextureAssets.Heart = ThoriumPlayer.Heart_Shield_Texture;
            Terraria.GameContent.TextureAssets.Heart2 = ThoriumPlayer.Heart2_Shield_Texture;
            Terraria.GameContent.TextureAssets.FancyHeart = ThoriumPlayer.Heart_Shield_Texture;
            Terraria.GameContent.TextureAssets.FancyHeart2 = ThoriumPlayer.Heart2_Shield_Texture;
            Terraria.GameContent.TextureAssets.BarHeart = ThoriumPlayer.BarHeart_Shield_Texture;
            Terraria.GameContent.TextureAssets.BarHeart2 = ThoriumPlayer.BarHeart2_Shield_Texture;

            ThoriumPlayer.LifeShieldIsDefault = false;

            if (player.statLife < player.statLifeMax2) {
                ThoriumPlayer.LifeShieldTimeDelay++;
                if (ThoriumPlayer.LifeShieldMaxTimeDelay <= ThoriumPlayer.LifeShieldTimeDelay) {
                    ThoriumPlayer.LifeShieldTimeDelay = 0;
                    ThoriumPlayer.HealPlayer(player, ThoriumPlayer.LifeShieldHealValue);
                }
            }
        } else if (!ThoriumPlayer.LifeShieldIsDefault) {
            Terraria.GameContent.TextureAssets.Heart = ThoriumPlayer.Default_Heart;
            Terraria.GameContent.TextureAssets.Heart2 = ThoriumPlayer.Default_Heart2;
            Terraria.GameContent.TextureAssets.FancyHeart = ThoriumPlayer.Default_HeartFancy;
            Terraria.GameContent.TextureAssets.FancyHeart2 = ThoriumPlayer.Default_HeartFancy2;
            Terraria.GameContent.TextureAssets.BarHeart = ThoriumPlayer.Default_BarHeart;
            Terraria.GameContent.TextureAssets.BarHeart2 = ThoriumPlayer.Default_BarHeart2;
            ThoriumPlayer.LifeShieldIsDefault = true;
        }
    }

    PostUpdate(player) {
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

    UpdateEquips(player) {
    }

    ModifyMaxStats(player) {
        if (ThoriumPlayer.LifeShieldActive) return this.CumulativeHealth = ThoriumPlayer.LifeShieldMaxExtraLife;
        return this.CumulativeHealth = 0;
    }

    ModifyWeaponDamage(player, item, damage) {
        if (
            ThoriumPlayer.SheathMaxCooldown !== undefined &&
            ThoriumPlayer.SheatType !== undefined &&
            ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown &&
            item.melee &&
            item.useStyle === Terraria.ID.ItemUseStyleID.Swing
        ) {
            switch (ThoriumPlayer.SheatType) {
                case 0:
                    return this.WeaponDamage = this.MultiplyDamage(damage);
            }
        }
        return this.WeaponDamage = damage;
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

    OnHitNPC(player, item, target, damage, knockback, crit) {
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
    }

    OnHitNPCWithProj(player, npc, projectile) {
        if (ThoriumPlayer.IncubatedEggBuff) {
            if (projectile.minion || Terraria.ID.ProjectileID.Sets.MinionShot[projectile.type]) {
                if (Math.random() < 0.1) return;

                const eggType = ModProjectile.getTypeByName('IncubatedSpider');
                const source = projectile.GetProjectileSource_FromThis();
                NewProjectile(source, npc.Center, Vector2.new(0, -2), eggType, projectile.damage, projectile.knockBack, player.whoAmI, 0, 0, 0, null);
                NewProjectile(source, npc.Center, Vector2.new(0, -2), eggType, projectile.damage, projectile.knockBack, player.whoAmI, 0, 0, 0, null);
            }
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

    static HealPlayer(player, amount) {
        const location = Rectangle.new(
            Math.floor(player.position.X),
            Math.floor(player.position.Y),
            player.width,
            player.height
        );
        Terraria.CombatText['int NewText(Rectangle location, Color color, int amount, bool dramatic, bool dot)'](
            location, Color.Aqua, amount, false, false
        );
        player.statLife += amount;
    }

    static SaveDefaultTextures() {
        ThoriumPlayer.Default_Heart = Terraria.GameContent.TextureAssets.Heart;
        ThoriumPlayer.Default_Heart2 = Terraria.GameContent.TextureAssets.Heart2;
        ThoriumPlayer.Default_HeartFancy = Terraria.GameContent.TextureAssets.FancyHeart;
        ThoriumPlayer.Default_HeartFancy2 = Terraria.GameContent.TextureAssets.FancyHeart2;
        ThoriumPlayer.Default_BarHeart = Terraria.GameContent.TextureAssets.BarHeart;
        ThoriumPlayer.Default_BarHeart2 = Terraria.GameContent.TextureAssets.BarHeart2;
    }

    static LoadTextures() {
        ThoriumPlayer.Heart_Shield_Texture = new ModTexture('Textures/UI/Health/Health_Shield').asset.asset;
        ThoriumPlayer.Heart2_Shield_Texture = new ModTexture('Textures/UI/Health/Health2_Shield').asset.asset;
        ThoriumPlayer.BarHeart_Shield_Texture = new ModTexture('Textures/UI/Health/BarHeart_Shield').asset.asset;
        ThoriumPlayer.BarHeart2_Shield_Texture = new ModTexture('Textures/UI/Health/BarHeart2_Shield').asset.asset;
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
}