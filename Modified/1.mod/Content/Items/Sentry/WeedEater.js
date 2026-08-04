import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class WeedEater extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Sentry/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(20, 3, 0);
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.mana = 15;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = ModItem.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item34;
        this.Item.shoot = ModProjectile.getTypeByName('WeedEaterPro');
    }

    HoldoutOffset(item, player) {
        return { X: -8, Y: 0 };
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const spawn = Vector2.new(player.Center.X, player.position.Y + player.height);

        const index = NewProjectile(
            player.GetProjectileSource_Item(item),
            spawn, Vector2.Zero,
            type, damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        const proj = Main.projectile[index];
        if (proj) proj.originalDamage = item.damage;

        player.UpdateMaxTurrets();
        return false;
    }
}
