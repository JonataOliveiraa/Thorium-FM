import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const Item139 = Terraria.ID.SoundID.Item139;

export class Alphorn extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.useTimer = true;
        this.timerStyle = 'Brass';
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('WoodenWhistlePro');
        this.Item.shootSpeed = 30;

        this.SetWeaponValues(7, 4, 4);
        this.SetDefaultWeaponStyle(50, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 20);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Item139, player.Center.X, player.Center.Y, 1, 0.92, 1.09);
            Empowerments.Apply(player, "ResourceMaximum", 1);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const norm = Vector2.Normalize(velocity);
        const spawnPos = Vector2.new(
            position.X + norm.X * 50,
            position.Y + norm.Y * 50
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
            .AddRecipeGroup('Wood')
            .AddIngredient(Terraria.ID.ItemID.Wood, 8)
    }
}
