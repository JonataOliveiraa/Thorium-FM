import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModHealerItem } from '../../../Common/ModHealerItem.js';

const { Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class LightsLament extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.mana = 25;
        this.Item.damage = 34;
        this.Item.width = this.Item.height = 30;
        this.Item.useTime = 40;
        this.Item.useAnimation = 40;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 8.0;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item8;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('LightsLamentPro');
        this.Item.shootSpeed = 5.0;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const source = player.GetProjectileSource_Item(item);
        player.direction = velocity.X > 0 ? 1 : -1;
        const offset = Vector2.Multiply(Vector2.Normalize(velocity), 25);
        let shootPos = position;
        if (CanHit(position, 0, 0, Vector2.Add(position, offset), 0, 0)) {
            shootPos = Vector2.Add(position, offset);
        }
        NewProjectile(source, shootPos.X, shootPos.Y, velocity.X, velocity.Y, type, damage, knockBack, player.whoAmI, Terraria.Main.MouseWorld.X, Terraria.Main.MouseWorld.Y, 0.0, null);
        return false;
    }
}