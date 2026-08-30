import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class TheStalker extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.damage = 15;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.channel = true;
        this.Item.knockBack = 5.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 15, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.DD2_MonkStaffSwing;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('TheStalkerPro');
        this.Item.shootSpeed = 110.0;
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.direction = velocity.X > 0 ? 1 : -1;
        const num = 23.625 * player.direction;
        NewProjectile(player.GetProjectileSource_Item(item), position, velocity, type, damage, knockBack, player.whoAmI, 0.0, num, 0.0, null);
        return false;
    }
}