import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class NoviceClericCowl extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NoviceCleric/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 18, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('NoviceClericTabard'),
            ModItem.getTypeByName('NoviceClericPants'),
            ModLocalization.getTranslationArmorSetBonus('NoviceCleric')
        );
    }

    UpdateEquip(item, player) {
        NoviceClericCowl.ReduceDamage10Perc(player)
        ThoriumPlayer.class.Healer.multiplier += 0.03
        ThoriumPlayer.LifeRecoveryExtraValue += 1
        player.statManaMax2 += 5
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.NoviceClericSetBonus = true
    }

    static ReduceDamage10Perc(player) {
        player.meleeDamage -= player.meleeDamage * 0.1
        player.magicDamage -= player.magicDamage * 0.1
        player.minionDamage -= player.minionDamage * 0.1
        player.rangedDamage -= player.rangedDamage * 0.1
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Silk, 5)
            .AddIngredient(ModItem.getTypeByName("UnholyShards"), 12)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}