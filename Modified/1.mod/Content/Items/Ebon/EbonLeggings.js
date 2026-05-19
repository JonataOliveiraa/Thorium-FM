import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class EbonLeggings extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ebon/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 18, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateEquip(item, player) {
        EbonLeggings.ReduceDamage10Perc(player)
        ThoriumPlayer.class.Healer.radiantDamage += 1
        player.statManaMax2 += 5
    }

    static ReduceDamage10Perc(player) {
        player.meleeDamage -= player.meleeDamage * 0.1
        player.magicDamage -= player.magicDamage * 0.1
        player.minionDamage -= player.minionDamage * 0.1
        player.rangedDamage -= player.rangedDamage * 0.1
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Silk, 4)
            .AddIngredient(ModItem.getTypeByName("UnholyShards"), 8)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}