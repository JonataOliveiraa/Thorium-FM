import { Terraria } from '../../TL/ModImports.js';
import { ModSystem } from '../../TL/ModSystem.js';
import { ModRecipe } from '../../TL/ModRecipe.js';
import { ModItem } from '../../TL/ModItem.js';

const { ItemID, TileID } = Terraria.ID;

export class gRecipes extends ModSystem {
    static Recipes = [
        () => new ModRecipe()
            .SetResult(ItemID.LifeCrystal, 1)
            .AddIngredient(ModItem.getTypeByName('LifeQuartzOre'), 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register(),
        () => new ModRecipe()
            .SetResult(ItemID.BloodMoonStarter)
            .AddIngredient(ModItem.getTypeByName('Blood'))
            .AddIngredient(ItemID.FallenStar)
            .AddTile(TileID.DemonAltar)
            .Register(),
        () => new ModRecipe()
            .SetResult(ItemID.Dynamite, 3)
            .AddIngredient(ModItem.getTypeByName('SmoothCoal'), 5)
            .AddRecipeGroup(gRecipes.CustomGroups.get('SilverBar'))
            .AddIngredient(ItemID.SilverBar, 2)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register(),
        () => new ModRecipe()
            .SetResult(ItemID.Bomb, 5)
            .AddIngredient(ModItem.getTypeByName('SmoothCoal'), 2)
            .AddRecipeGroup('IronBar')
            .AddIngredient(ItemID.IronBar , 1)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register()
    ];

    static CustomGroupsMap = [
        {
            name: 'Anvils',
            items: () => [
                ItemID.IronAnvil,
                ItemID.LeadAnvil
            ]
        },
        {
            name: 'SilverBar',
            items: () => [
                ItemID.SilverBar,
                ItemID.TungstenBar
            ]
        }
    ];

    static CustomGroups = new Map();

    AddRecipes() {
        for (const createRecipe of gRecipes.Recipes) {
            createRecipe();
        }
    }

    AddRecipeGroups() {
        for (const groupData of gRecipes.CustomGroupsMap) {
            const group = ModRecipe.CreateRecipeGroup(groupData.name, groupData.items());
            gRecipes.CustomGroups.set(groupData.name, group);
        }
    }
}