import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const DROP_SPEED = 15;

export class NanoClamCane extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Depth/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.damage = 12;
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.mana = 15;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 6;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 75, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item34;
        this.Item.shoot = ModProjectile.getTypeByName('NanoClamCanePro');
    }

    HoldoutOffset(item, player) {
        return { X: -8, Y: 0 };
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const spawn = Vector2.new(Main.MouseWorld.X, Main.MouseWorld.Y);

        const index = NewProjectile(
            null,
            spawn, Vector2.new(0, DROP_SPEED),
            type, damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        const sentry = Main.projectile[index];
        if (sentry) sentry.originalDamage = item.damage;

        player.UpdateMaxTurrets();
        return false;
    }
}
