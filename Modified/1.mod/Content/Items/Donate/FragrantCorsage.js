import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';

const JUNGLE_ROSE = 210;

export class FragrantCorsage extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        const bonus = ThoriumPlayer.class.Healer.healPowerExtraValue;
        if (bonus <= 0) return;

        player.lifeRegenTime += Math.floor(bonus * 0.5);
        player.lifeRegen += Math.floor(bonus / 2);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(JUNGLE_ROSE, 2)
            .AddIngredient(ModItem.getTypeByName('Petal'), 10)
            .AddTile(ArcaneArmorFabricator.Type)
            .Register();
    }
}
