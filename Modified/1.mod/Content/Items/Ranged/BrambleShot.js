import { Vector2 } from '../../../TL/Modules/Vector2.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BrambleShot extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(24, 2, 4);
        this.SetDefaultWeaponStyle(26, true);
        this.Item.ranged = true;
        this.Item.noMelee = true
        this.Item.shoot = 1
        this.Item.shootSpeed = 8;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item108;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (type === Terraria.ID.ProjectileID.WoodenArrowFriendly) {
            velocity = Vector2.Multiply(velocity, 1.2)
            const projType = ModProjectile.getTypeByName('JungleArrow');

            const source = player.GetProjectileSource_Item(item);

            NewProjectile(
                source,
                position.X,
                position.Y,
                velocity.X,
                velocity.Y,
                projType,
                damage,
                knockBack,
                player.whoAmI,
                0, 0, 0,
                null
            );

            return false;
        }

        return true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 1)
            .AddIngredient(Terraria.ID.ItemID.FallenStar, 1)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register()
    }

    HoldoutOffset(item, player) {
        return { X: -4, Y: 0 };
    }
}
