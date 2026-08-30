import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class RottenCod extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 38;
        this.Item.height = 36;

        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.channel = true;

        this.SetWeaponValues(13, 7, 4);
        this.SetDefaultWeaponStyle(28, false);
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;

        this.Item.value = Terraria.Item.sellPrice(0, 13, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;

        this.Item.shoot = ModProjectile.getTypeByName('RottenCodPro');
        this.Item.shootSpeed = 10;
    }

    // Maca de arremesso: so uma na tela por vez, como todo mangual.
    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] < 1;
    }
}
