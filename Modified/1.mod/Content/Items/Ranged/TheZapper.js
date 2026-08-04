import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _proType = -1;

export class TheZapper extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(23, 4, 0);
        this.Item.ranged = true;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 28;
        this.Item.useAnimation = 28;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item75;
        this.Item.shootSpeed = 8;

        // Nao gasta municao: e uma arma de raio
        if (_proType === -1) _proType = ModProjectile.getTypeByName('TheZapperPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }
}
