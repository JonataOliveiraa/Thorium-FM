import { ModPlayer } from '../../../TL/ModPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class SilkHat extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Silk/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.defense = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;    
    }
    
    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('SilkTabard'),
            ModItem.getTypeByName('SilkLeggings'),
            ModLocalization.getTranslationArmorSetBonus('Silk')
        );
    }
    
    UpdateArmorSet(item, player) {
        ModPlayer.getByName('gPlayer').SilkBuff = true;

        if (player.statLife > player.statLifeMax2 * 0.75) {
            player.magicDamage += 0.25;
        }
    }

    UpdateEquip(item, player) {
        player.statManaMax2 += 20;
        player.manaRegenBonus += 0.05;
    }

    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(Terraria.ID.ItemID.FallenStar, 3)
        .AddIngredient(Terraria.ID.ItemID.Silk, 3)
        .AddTile(Terraria.ID.TileID.WorkBenches)
        .Register();
    }
}