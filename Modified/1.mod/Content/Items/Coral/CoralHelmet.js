import { ModPlayer } from '../../../TL/ModPlayer.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class CoralHelmet extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Coral/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 16, 50);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('CoralChestguard'),
            ModItem.getTypeByName('CoralGreaves'),
            ModLocalization.getTranslationArmorSetBonus('Coral')
        );
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.CoralSetBuff = true
        ThoriumPlayer.CoralSetResetCount = ThoriumPlayer.CoralSetCount
        ThoriumPlayer.class.Healer.radiantDamage += 1
    }

    UpdateEquip(item, player) {
        CoralHelmet.ReduceDamage10Perc(player)
        if (Math.random() < 0.1) {
            player.breathCD--;
        }
    }

    static ReduceDamage10Perc(player) {
        player.meleeDamage -= player.meleeDamage * 0.1
        player.magicDamage -= player.magicDamage * 0.1
        player.minionDamage -= player.minionDamage * 0.1
        player.rangedDamage -= player.rangedDamage * 0.1
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Coral, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
}