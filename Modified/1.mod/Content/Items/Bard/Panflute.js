import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Empowerments } from "../../Global/Empowerments.js";
import { ThoriumSoundPlayer } from "../../../Common/ThoriumSoundPlayer.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class Panflute extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Wind';
        this.inspirationCost = 1;
        this.useWheel = true;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('PanflutePro');
        this.Item.shootSpeed = 2;
        this.SetWeaponValues(21, 4, 4);
        this.SetDefaultWeaponStyle(10, true);
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.scale = 0.8;
        this.Item.useStyle = 5;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('panfluteSound')
            Empowerments.Apply(player, "ResourceConsumptionChance", 2);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const dir = Vector2.Normalize(velocity);
        const forward = Vector2.Multiply(dir, 30);
        const perpendicular = Vector2.Multiply(
            Vector2.RotatedBy(dir, -0.78539818525314331 * player.direction),
            Rand.Next(-3, 4) * 3.75
        );
        const spawnPos = Vector2.Add(Vector2.Add(position, forward), perpendicular);
        NewProjectile(
            player.GetProjectileSource_Item(item),
            spawnPos, velocity, type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(620, 15)
            .AddIngredient(Terraria.ID.ItemID.RichMahogany, 15)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 8)
            .AddIngredient(Terraria.ID.ItemID.Stinger, 4)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}