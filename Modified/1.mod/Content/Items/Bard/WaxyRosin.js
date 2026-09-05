import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const BEE_WAX = 2431;
const HONEY_BLOCK = 1125;

// No original este acessorio soma 0.15 ao bardStringPierceDamage, que comeca em
// 0.75: la o projetil de bardo perde 25% do dano ao perfurar, e o Breu alivia
// essa perda. Aqui a perda nunca foi implementada, todo projetil ja perfura com
// 100%. Criar a perda so para o acessorio alivia-la nerfaria todas as armas de
// bardo do mod, entao ele vira um bonus direto de dano sinfonico, menor que os
// 15% do original porque vale em todo acerto, nao so nos perfurados.
const DAMAGE_BONUS = 0.08;

export class WaxyRosin extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 28;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.class.Bard.multiplier += DAMAGE_BONUS;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(BEE_WAX, 10)
            .AddIngredient(HONEY_BLOCK, 5)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
