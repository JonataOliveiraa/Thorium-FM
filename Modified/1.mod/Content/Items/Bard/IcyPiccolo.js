import { BardItemSound } from "../../../Common/Enum/BardItemSound.js";
import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const Item66 = BardItemSound.Melodica;

export class IcyPiccolo extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('IcyPiccoloPro');
        this.Item.shootSpeed = 8;

        this.SetWeaponValues(12, 4, 4);
        this.SetDefaultWeaponStyle(16, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.useTime = 16;
        this.Item.useAnimation = 16;
        this.Item.scale = 0.9;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Item66, player.Center.X, player.Center.Y, 1, 0, 1);
            Empowerments.Apply(player, "ResourceMaximum", 1);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const norm = Vector2.Normalize(velocity);
        const spawnPos = Vector2.new(
            position.X + norm.X * 30,
            position.Y + norm.Y * 30
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
            .AddIngredient(ModItem.getTypeByName("IcyShard"), 8)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}