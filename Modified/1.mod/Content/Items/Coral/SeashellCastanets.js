import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class SeashellCastanets extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('SeashellCastanetsHoldPro');
        this.Item.shootSpeed = 8;
        this.SetWeaponValues(18, 2, 4);
        this.SetDefaultWeaponStyle(30, true); // useTime 30, autoReuse
        this.Item.reuseDelay = 10;
        this.Item.channel = true;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 22, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item43, player.Center.X, player.Center.Y);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        NewProjectile(
            player.GetProjectileSource_Item(item),
            position, velocity, type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Coral, 6)
            .AddIngredient(Terraria.ID.ItemID.Seashell, 2)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}