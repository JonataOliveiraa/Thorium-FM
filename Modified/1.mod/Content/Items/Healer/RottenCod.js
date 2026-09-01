import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class RottenCod extends ModHealerItem {
    static REACH = 23.625;

    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.damage = 11;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.channel = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 5;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 13, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.DD2_MonkStaffSwing
        this.Item.shoot = ModProjectile.getTypeByName('RottenCodPro');
        this.Item.shootSpeed = 100;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        NewProjectile(
            null, position.X, position.Y, velocity.X, velocity.Y,
            type, damage, knockBack, player.whoAmI,
            0, RottenCod.REACH * player.direction, 0, null
        );
        return false;
    }
}
