import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class ManaBauble extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.material = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 10);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if(vanity) return;
        player.statManaMax2 += 10
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.FallenStar, 3)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}