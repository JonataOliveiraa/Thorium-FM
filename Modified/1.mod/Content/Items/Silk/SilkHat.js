import { ModPlayer } from '../../../TL/ModPlayer.js';
import { Color } from '../../../TL/Modules/Color.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class SilkHat extends ModItem {
    color = Color.Yellow;

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
        if (player.statMana > player.statManaMax2 * 0.75) {
            player.magicDamage += 0.25;

            if(Math.random() < 0.05) NewDust(player.Center, 0, 0, Terraria.ID.DustID.YellowStarDust, 0, 0, 150, this.color, 1);
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