import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { ToolTipsReplace } from '../../Global/Hooks/ToolTipsReplace.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class TheDigester extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(30, 5, 4);
        this.SetDefaultWeaponStyle(38, true);
        this.Item.magic = true;
        this.Item.shoot = ModProjectile.getTypeByName('TheDigesterPro');
        this.Item.shootSpeed = 12;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item108;
    }
    HoldoutOffset(item, player) {
        return { X: -4, Y: 0 };
    }
}
