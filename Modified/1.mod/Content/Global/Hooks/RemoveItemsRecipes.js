import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModRecipe } from "../../../TL/ModRecipe.js";

const { Main, Recipe } = Terraria;
const { ItemID } = Terraria.ID;

export class RemoveItemsRecipes extends GlobalHooks {
    static ItemsToRemove = [
        ItemID.CopperShortsword,
        ItemID.EasterBathtub,
        ItemID.EasterBed,
        ItemID.EasterBlockWall, 
        Terraria.ID.ItemID.EasterCandle,
        Terraria.ID.ItemID.EasterCandelabra,
        Terraria.ID.ItemID.EasterBookcase,
        Terraria.ID.ItemID.EasterChandelier,
        Terraria.ID.ItemID.EasterChest,
        ItemID.EasterClock,
        ItemID.EasterDoor,
        ItemID.EasterDresser,
        ItemID.EasterLamp,
        ItemID.EasterLantern,
        ItemID.EasterPiano,
        ItemID.EasterPlatform,
        ItemID.EasterSink,
        ItemID.EasterSofa,
        ItemID.EasterTable,
        ItemID.EasterToilet,
        ItemID.EasterWorkbench,
        ItemID.ChlorophyteExtractinator
    ]

    static ApplyRecipeRemoval() {
        const itemsToRemove = new Set(RemoveItemsRecipes.ItemsToRemove);
        const recipeArr = Main.recipe;

        for (let i = 0; i < recipeArr.length; i++) {
            const recipe = recipeArr[i];
            if (recipe && itemsToRemove.has(recipe.createItem.type)) {
                for (let j = 0; j < recipe.requiredItem.length; j++) {
                    const ing = recipe.requiredItem[j];
                    if (ing && ing.type !== 0) {
                        ing['void SetDefaults(int Type, ItemVariant variant)'](5013, null);
                        ing.stack = 1;
                    }
                }
                recipe.needMechdusa = true;
                recipe.notDecraftable = true;
            }
        }
    }
}