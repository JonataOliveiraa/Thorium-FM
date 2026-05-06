import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class MagickStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 10;
        Terraria.Item.staff[this.Type] = true;
        this.Item.shoot = ModProjectile.getTypeByName('MagickStaffPro');
        this.Item.shootSpeed = 10;

        // (damage, knockback, crit);
        this.SetWeaponValues(10, 3, 10);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(24, true);

        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 50);
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Charm'), 1)
            .AddIngredient(ModItem.getTypeByName('Dissolve'), 1)
            .AddIngredient(ModItem.getTypeByName('Freeze'), 1)
            .AddIngredient(ModItem.getTypeByName('Ignite'), 1)
            .AddIngredient(ModItem.getTypeByName('Poison'), 1)
            .AddIngredient(ModItem.getTypeByName('Siphon'), 1)
            .AddIngredient(ModItem.getTypeByName('Stun'), 1)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}