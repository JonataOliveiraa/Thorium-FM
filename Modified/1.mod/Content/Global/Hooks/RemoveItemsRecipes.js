import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";

const { Main, Recipe } = Terraria
const { ItemID } = Terraria.ID

export class RemoveItemsRecipes extends GlobalHooks {
    static ItemsToRemove = [
        ItemID.EasterBlock,
    ]

    RemoveRecipes(items = []) {
        if (items.length === 0) return;

        const _items = new Set(items);
        const recipeArr = Main.recipe;
        const newRecipeArr = []

        for (let i = 0; i < recipeArr.length; i++) {
            const recipe = recipeArr[i];
            if (_items.has(recipe.createItem.type)) continue;
            newRecipeArr.push(recipe);
        }

        const newLength = newRecipeArr.length;
        Main.recipe = newRecipeArr.makeGeneric(Recipe);
        Main.availableRecipe = Main.availableRecipe.cloneResized(newLength);
        Main.availableRecipeY = Main.availableRecipeY.cloneResized(newLength);
        Recipe.numRecipes = newLength;
    }

    Initialize() {
        Recipe.SetupRecipes.hook(original => {
            original();
            this.RemoveRecipes(RemoveItemsRecipes.ItemsToRemove);
        });
    }
}