import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

const SUMMON_DAMAGE_FLAT = 2;

let _spiderType = -1;

export class PrehistoricArachnid extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Summon/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 28;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.accPrehistoricArachnid = true;

        if (_spiderType === -1) _spiderType = ModProjectile.getTypeByName('PrehistoricArachnidPro') ?? -2;
        if (_spiderType < 0) return;
        if ((player.ownedProjectileCounts[_spiderType] ?? 0) <= 0) return;

        const heldItem = player.inventory[player.selectedItem];
        if (!heldItem || heldItem.damage <= 0) return;

        player.minionDamage += SUMMON_DAMAGE_FLAT / heldItem.damage;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('LivingWoodSap'), 1)
            .AddIngredient(ModItem.getTypeByName('IncubatedEgg'), 1)
            .AddTile(Terraria.ID.TileID.Bookcases)
            .Register();
    }
}
