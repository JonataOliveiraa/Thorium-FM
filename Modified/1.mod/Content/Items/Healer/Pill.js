import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { gRecipes } from '../../Global/gRecipes.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Rand } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const PILL_COLORS = 3;
const CORRUPT_PILL_COLORS = 4;

const COPPER_COST = 2;
const BLOOD_COST = 1;
const CRAFT_AMOUNT = 100;

let _supportType = -1;

function isAltPressed(player) {
    return player.altFunctionUse === 2
        || player.controlUseTile
        || player.controlInteraction
        || player.controlSmart;
}

export class Pill extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
        this._altShot = false;
    }

    SetStaticDefaults() {
        this.ResearchUnlockCount = 99;
    }

    SetDefaults() {
        this.SetWeaponValues(10, 2, 4);
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.maxStack = 9999;
        this.Item.consumable = true;
        this.Item.autoReuse = true;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 5);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item19;
        this.Item.shoot = ModProjectile.getTypeByName('ThePillPro');
        this.Item.shootSpeed = 8;
        this.Item.ammo = this.Type;
    }

    AltFunctionUse(item, player) {
        return true;
    }

    ModifyShootStats(item, player, stats) {
        this._altShot = isAltPressed(player);
        return stats;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const alt = this._altShot || isAltPressed(player);
        this._altShot = false;

        if (alt) {
            if (_supportType === -1) _supportType = ModProjectile.getTypeByName('ThePillPro2') ?? -2;
            if (_supportType < 0) return false;

            NewProjectile(null, position, velocity, _supportType, 0, 0, player.whoAmI, 0, 0, 0, null);
            return false;
        }

        const colors = ThoriumPlayer.RadiantCorruptionActive ? CORRUPT_PILL_COLORS : PILL_COLORS;
        NewProjectile(null, position, velocity, type, damage, knockBack, player.whoAmI, 0, Rand.Next(colors), 0, null);
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(CRAFT_AMOUNT)
            .AddIngredient(ModItem.getTypeByName('Blood'), BLOOD_COST)
            .AddRecipeGroup(gRecipes.CustomGroups.get('CopperBar'), COPPER_COST)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}
