import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class LootRang extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Melee/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.damage = 0;
        this.Item.knockBack = 0;
        this.Item.useTime = 10;
        this.Item.useAnimation = 10;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.maxStack = 1;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('LootRangPro');
        this.Item.shootSpeed = 12;
    }

    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] < 1;
    }
}
