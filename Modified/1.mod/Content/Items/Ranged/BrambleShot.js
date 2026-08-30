import { Vector2 } from '../../../TL/Modules/Vector2.js';
import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { AmmoHelper } from './../../../Common/AmmoHelper.js';

const { Rand } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BrambleShot extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(24, 2, 4);
        this.SetDefaultWeaponStyle(26, true);
        this.Item.ranged = true;
        this.Item.shoot = 1;
        this.Item.shootSpeed = 8;
        this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item108;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player['void ChangeDir(int dir)'](velocity.X >= 0 ? 1 : -1);

        const projType = AmmoHelper.Consume(player, item.useAmmo);
        if (projType <= 0) return false;

        const finalType = projType === 1
            ? ModProjectile.getTypeByName('JungleArrow')
            : projType;

        NewProjectile(
            null,
            position,
            Vector2.Multiply(velocity, 1.2),
            finalType,
            damage, knockBack,
            player.whoAmI,
            0, 0, 0, null
        );
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 7)
            .AddIngredient(Terraria.ID.ItemID.FallenStar, 1)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }

    HoldoutOffset(item, player) {
        return { X: -4, Y: 0 };
    }
}