import { BardItemSound } from "../../../Common/Enum/BardItemSound.js";
import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const Item66 = BardItemSound.Horn;

export class PlatinumBugleHorn extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('PlatinumBugleHornPro');
        this.Item.shootSpeed = 2.5;

        this.SetWeaponValues(11, 4, 4);
        this.SetDefaultWeaponStyle(36, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 18, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.noMelee = true;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Item66, player.Center.X, player.Center.Y, 1, 0.92, 1.09);
            Empowerments.Apply(player, "CriticalStrikeChance", 1);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const norm = Vector2.Normalize(velocity);
        const spawnPos = Vector2.new(
            position.X + norm.X * 25,
            position.Y + norm.Y * 25
        );

        NewProjectile(
            player.GetProjectileSource_Item(item),
            spawnPos, velocity, type, damage, knockBack,
            player.whoAmI, 0, 1, 0, null
        );
        NewProjectile(
            player.GetProjectileSource_Item(item),
            spawnPos, velocity, type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );

        return false; 
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.PlatinumBar, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}