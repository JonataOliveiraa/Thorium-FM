import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class BloomingCrown extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Blooming/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 4;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 16, 50);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }

    static ReduceDamage10Perc(player) {
        player.meleeDamage -= player.meleeDamage * 0.1
        player.magicDamage -= player.magicDamage * 0.1
        player.minionDamage -= player.minionDamage * 0.1
        player.rangedDamage -= player.rangedDamage * 0.1
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('BloomingTabard'),
            ModItem.getTypeByName('BloomingLeggings'),
            ModLocalization.getTranslationArmorSetBonus('Blooming')
        );
    }

    UpdateArmorSet(item, player) {
        player.manaRegen += 2
        ThoriumPlayer.BloomingSetBonus = true
    }

    
    UpdateEquip(item, player) {
        BloomingCrown.ReduceDamage10Perc(player)
        ThoriumPlayer.class.Healer.healPowerExtraValue += 1
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
            .AddIngredient(ModItem.getTypeByName('Petal'), 8)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 4)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}