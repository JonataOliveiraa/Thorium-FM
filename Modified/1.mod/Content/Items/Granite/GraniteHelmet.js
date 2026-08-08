import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

const BUFF_ON_FIRE = 24;
const MOVE_SPEED_PENALTY = 0.25;

export class GraniteHelmet extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Granite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 18;
        this.Item.height = 18;
        this.Item.defense = 9;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('GraniteChestGuard'),
            ModItem.getTypeByName('GraniteGreaves'),
            ModLocalization.getTranslationArmorSetBonus('Granite')
        );
    }

    UpdateArmorSet(item, player) {
        player.fireWalk = true;
        player.lavaImmune = true;
        player.noKnockback = true;
        player.buffImmune[BUFF_ON_FIRE] = true;

        const singed = ModBuff.getTypeByName('SingedBuff');
        if (singed >= 0) player.buffImmune[singed] = true;

        player.moveSpeed -= MOVE_SPEED_PENALTY;
        player.accRunSpeed = player.maxRunSpeed;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 12)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
