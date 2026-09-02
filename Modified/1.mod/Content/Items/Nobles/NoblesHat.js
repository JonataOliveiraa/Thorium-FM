import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const NOTE_DROP_BONUS = 0.04;
const REGEN_BONUS = 0.05;

export class NoblesHat extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Nobles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 18;
        this.Item.height = 18;
        this.Item.defense = 5;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 60, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('NoblesJerkin'),
            ModItem.getTypeByName('NoblesLeggings'),
            ModLocalization.getTranslationArmorSetBonus('Nobles')
        );
    }

    UpdateEquip(item, player) {
        ThoriumPlayer.bardResourceDropBoost += NOTE_DROP_BONUS;
        ThoriumPlayer.class.Bard.inspirationRegenBonus += REGEN_BONUS;
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.setNoble = true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Cloth'), 8)
            .AddIngredient(Terraria.ID.ItemID.HellstoneBar, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
