import { Terraria } from '../../TL/ModImports.js';
import { ModSystem } from '../../TL/ModSystem.js';
import { ModRecipe } from '../../TL/ModRecipe.js';
import { ModItem } from '../../TL/ModItem.js';

const { ItemID, TileID } = Terraria.ID;

export class gRecipes extends ModSystem {
    static Recipes = [
        () => new ModRecipe()
            .SetResult(ItemID.RodofDiscord, 1)
            .AddIngredient(ItemID.ChaosFish, 10)
            .AddIngredient(ItemID.HallowedBar, 20)
            .AddIngredient(ItemID.SoulofFright, 5)
            .AddTile(TileID.MythrilAnvil)
            .Register(),

        () => new ModRecipe()
            .SetResult(ItemID.SpikyBall, 50)
            .AddIngredient(ItemID.IronBar, 1)
            .AddRecipeGroup('IronBar')
            .AddTile(TileID.Anvils)
            .SetProperty('needSnowBiome', true)
            .Register(),

        () => new ModRecipe()
            .SetResult(ModItem.getTypeByName('ExampleMeleeWeapon'))
            .AddIngredient(ModItem.getTypeByName('ExampleItem'), 50)
            .AddRecipeGroup(gRecipes.CustomGroups.get('ExampleGroup'))
            .Register()
    ];

    static CustomGroupsMap = [
        {
            name: 'ExampleGroup',
            displayName: 'Example Item',
            items: () => [
                ModItem.getTypeByName('ExampleItem'),
                ModItem.getTypeByName('ExampleSoul')
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
            const group = ModRecipe.CreateRecipeGroup(groupData.displayName, groupData.items());
            gRecipes.CustomGroups.set(groupData.name, group);
        }
    }
}