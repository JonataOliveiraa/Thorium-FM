import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { ThoriumAnvil } from '../../Global/Tiles/ThoriumAnvil.js';

export class BandofReplenishment extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 8);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if(vanity) return;
        player.lifeRegen += 1
        player.manaRegen += 2

        ThoriumPlayer.BandofReplenishmentEquipped = true
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('ThoriumBar'), 5)
            .AddIngredient(Terraria.ID.ItemID.LifeCrysta, 1)
            .AddIngredient(Terraria.ID.ItemID.ManaCrystal, 1)
            .AddTile(ThoriumAnvil.Type)
            .Register();
    }
}