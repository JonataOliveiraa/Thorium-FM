import { ModHealerItem } from './../../../Common/ModHealerItem.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

export const ION_SHIELD_BASE = 4;
export const ION_SHIELD_CAP = 50;

export class GraniteIonStaff extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Granite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.mana = 15;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.reuseDelay = 10;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.channel = true;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.shoot = ModProjectile.getTypeByName('GraniteIonStaffPro');
        this.Item.shootSpeed = 0;
    }

    HoldoutOffset(item, player) {
        return { X: -6, Y: 0 };
    }

    static ShieldValue() {
        const bonus = Math.floor(ThoriumPlayer.class.Healer.getHealValue());
        return ION_SHIELD_BASE + (bonus > 0 ? bonus : 0);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
