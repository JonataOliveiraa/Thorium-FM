import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Vector2 } from '../../../TL/Modules/Vector2.js';
import { LifeShieldPlayer } from '../../Global/LifeShieldPlayer.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class BloomingShield extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Blooming/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.accessory = true;
        this.Item.defense = 2;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        if(ThoriumPlayer.InCombat) return;
        player.lifeRegen += 3 
    }

     AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Petal'), 10)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}