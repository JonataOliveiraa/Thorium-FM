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

    RemoveRecipes(items = []) {
        if (items.length === 0) return;

        const _items = new Set(items);
        const recipeArr = Main.recipe; 
        
        let validRecipeCount = 0;
        let removedCount = 0;

        for (let i = 0; i < Recipe.numRecipes; i++) {
            const recipe = recipeArr[i];
            
            if (_items.has(recipe.createItem.type)) {
                removedCount++;
                continue;
            }
            
            recipeArr[validRecipeCount] = recipe;
            validRecipeCount++;
        }

        Recipe.numRecipes = validRecipeCount;
        ModRecipe.MAX_VANILLA_RECIPES -= removedCount;
    }

    Initialize() {
        Recipe.SetupRecipes.hook(original => {
            original();
            this.RemoveRecipes(RemoveItemsRecipes.ItemsToRemove);
        });
    }
}