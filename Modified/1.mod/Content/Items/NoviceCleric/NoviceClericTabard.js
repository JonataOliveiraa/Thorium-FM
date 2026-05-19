import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { NoviceClericCowl } from './NoviceClericCowl.js';

export class NoviceClericTabard extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NoviceCleric/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 18, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateEquip(item, player) {
        NoviceClericCowl.ReduceDamage10Perc(player)
        ThoriumPlayer.class.Healer.multiplier += 0.04
        ThoriumPlayer.LifeRecoveryExtraValue += 2
        player.statManaMax2 += 10
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Silk, 3)
            .AddIngredient(ModItem.getTypeByName("UnholyShards"), 12)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}