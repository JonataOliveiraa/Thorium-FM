import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Color, Rand } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];
const CombatText = Terraria.CombatText['int NewText(Rectangle location, Color color, string text, bool dramatic, bool dot)'];

const ORGANS_PER_KILL = 2;
const ORGANS_MAX = 10;
const ORGAN_FRAMES = 3;
const THROW_DAMAGE = 1.5;

const TEXT_R = 255;
const TEXT_G = 100;
const TEXT_B = 50;

const IRON_COST = 8;
const BLOOD_COST = 2;

let _organType = -1;

function isAltPressed(player) {
    return player.altFunctionUse === 2
        || player.controlUseTile
        || player.controlInteraction
        || player.controlSmart;
}

export class Bonesaw extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
        this._altShot = false;
    }

    SetDefaults() {
        this.SetWeaponValues(14, 6.5, 4);
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 24;
        this.Item.useAnimation = 24;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 50);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('BonesawPro');
        this.Item.shootSpeed = 15;
    }

    AltFunctionUse(item, player) {
        return ThoriumPlayer.bonesawOrgans > 0;
    }

    UseAnimation(item, player) {
        if (isAltPressed(player) && ThoriumPlayer.bonesawOrgans > 0) {
            item.UseSound = Terraria.ID.SoundID.Item19;
            item.noUseGraphic = true;
            item.noMelee = true;
            return;
        }

        item.UseSound = Terraria.ID.SoundID.Item1;
        item.noUseGraphic = false;
        item.noMelee = false;
    }

    ModifyShootStats(item, player, stats) {
        this._altShot = isAltPressed(player);
        return stats;
    }

    OnHitNPC(item, player, npc, damageDone, knockBack, crit) {
        if (npc.active) return;
        if (ThoriumPlayer.bonesawOrgans >= ORGANS_MAX) return;

        const gained = Math.min(ORGANS_PER_KILL, ORGANS_MAX - ThoriumPlayer.bonesawOrgans);
        ThoriumPlayer.bonesawOrgans += gained;

        PlaySound(Terraria.ID.SoundID.NPCHit11, player.position, 0, 1);
        CombatText(player.Hitbox, Color.new(TEXT_R, TEXT_G, TEXT_B), '+' + gained, false, true);
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const alt = this._altShot || isAltPressed(player);
        this._altShot = false;

        if (!alt) return false;
        if (ThoriumPlayer.bonesawOrgans <= 0) return false;

        if (_organType === -1) _organType = ModProjectile.getTypeByName('BonesawPro') ?? -2;
        if (_organType < 0) return false;

        NewProjectile(
            null, player.Center, velocity, _organType,
            Math.floor(damage * THROW_DAMAGE), knockBack, player.whoAmI,
            Rand.Next(ORGAN_FRAMES), 0, 0, null
        );

        ThoriumPlayer.bonesawOrgans--;
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Blood'), BLOOD_COST)
            .AddRecipeGroup('IronBar', IRON_COST)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
