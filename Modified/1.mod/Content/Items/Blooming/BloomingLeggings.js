import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { BloomingCrown } from './BloomingCrown.js';
export class BloomingLeggings extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Blooming/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 4;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 13, 50);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }

    UpdateEquip(item, player) {
        BloomingCrown.ReduceDamage10Perc(player)
        ThoriumPlayer.class.Healer.multiplier += 0.05
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

     AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Petal'), 10)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 5)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}