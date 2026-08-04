import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _proType = -1;

export class BentZombieArm extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Melee/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(12, 6, 0);
        this.Item.melee = true;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 18;
        this.Item.useAnimation = 18;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 3, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shootSpeed = 7.5;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('BentZombieArmPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    // So um braco no ar por vez
    CanUseItem(item, player) {
        return (player.ownedProjectileCounts[this.Item.shoot] ?? 0) < 1;
    }
}
