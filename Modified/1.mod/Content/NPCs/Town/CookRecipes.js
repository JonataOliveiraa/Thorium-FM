import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { WorldDB } from './../../../TL/WorldDB.js';

const { ItemID } = Terraria.ID;
const STORAGE_KEY = 'Thorium:CookDonations';

export const COOK_RECIPES = [
    { result: 'BlueberryTart',      ingredient: { mod: 'BlueBerries' },              required: 3,  samples: 5 },
    { result: 'ChiTea',             ingredient: { mod: 'LivingLeaf' },               required: 10, samples: 5 },
    { result: 'HotChocolate',       ingredient: { vanilla: ItemID.Marshmallow },     required: 10, samples: 5 },
    { result: 'GrilledShroom',      ingredient: { mod: 'TealMushroom' },             required: 3,  samples: 5 },
    { result: 'PricklyJam',         ingredient: { mod: 'PinkPricklyPear' },          required: 3,  samples: 5 },
    { result: 'QuestionableStew',   ingredient: { vanilla: ItemID.RottenChunk },     required: 8,  samples: 5 },
    { result: 'ObjectionableStock', ingredient: { vanilla: ItemID.Vertebrae },        required: 8,  samples: 5 },
    { result: 'MeanNGreenStew',     ingredient: { mod: 'GreenMushroom' },            required: 3,  samples: 5 },
    { result: 'GunkanMaki',         ingredient: { mod: 'LimeKelp' },                 required: 3,  samples: 5 },
    { result: 'MarigoldMintTea',    ingredient: { mod: 'YellowMarigold' },           required: 3,  samples: 5 },
    { result: 'SkyBloomCocktail',   ingredient: { mod: 'SkyBlueFlower' },            required: 3,  samples: 5 },
    { result: 'BloodyKimchi',       ingredient: { mod: 'OrangeBloodroot' },          required: 3,  samples: 5 },
    { result: 'BlueCheese',         ingredient: { vanilla: ItemID.GlowingMushroom }, required: 10, samples: 5 },
    { result: 'EtherianGrog',       ingredient: { mod: 'BrewBlueprint' },            required: 1,  samples: 5 },
    { result: 'ManaDelight',        ingredient: { mod: 'ManaBerry' },                required: 10, samples: 5 },
    // O Bacon e' o unico que vem em unidade unica, como no original.
    { result: 'Bacon',              ingredient: { mod: 'TheAlmightyRecipe' },        required: 1,  samples: 1 },
];

export class CookRecipes {
    static _donations = null;

    static _load() {
        if (CookRecipes._donations) return CookRecipes._donations;

        CookRecipes._donations = {};
        const raw = WorldDB.get(STORAGE_KEY);
        if (typeof raw === 'string' && raw.length > 0) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') CookRecipes._donations = parsed;
            } catch (_) { }
        }
        return CookRecipes._donations;
    }

    static _save() {
        try { WorldDB.set(STORAGE_KEY, JSON.stringify(CookRecipes._load())); } catch (_) { }
    }

    // Descarta o cache ao trocar de mundo.
    static Reset() {
        CookRecipes._donations = null;
    }

    static ResultType(recipe) {
        return Number(ModItem.getTypeByName(recipe.result) ?? 0);
    }

    static IngredientType(recipe) {
        if (recipe.ingredient.vanilla !== undefined) return Number(recipe.ingredient.vanilla ?? 0);
        return Number(ModItem.getTypeByName(recipe.ingredient.mod) ?? 0);
    }

    // Uma receita so' entra em jogo quando os dois lados existem de fato.
    static IsAvailable(recipe) {
        return CookRecipes.ResultType(recipe) > 0 && CookRecipes.IngredientType(recipe) > 0;
    }

    static Donated(recipe) {
        return Number(CookRecipes._load()[recipe.result] ?? 0);
    }

    static IsUnlocked(recipe) {
        return CookRecipes.Donated(recipe) >= recipe.required;
    }

    static AddDonation(recipe, amount = 1) {
        const donations = CookRecipes._load();
        donations[recipe.result] = CookRecipes.Donated(recipe) + amount;
        CookRecipes._save();
        return donations[recipe.result];
    }

    static UnlockedResults() {
        const results = [];
        for (const recipe of COOK_RECIPES) {
            if (!CookRecipes.IsAvailable(recipe)) continue;
            if (!CookRecipes.IsUnlocked(recipe)) continue;
            results.push(CookRecipes.ResultType(recipe));
        }
        return results;
    }
}
