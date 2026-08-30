import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

export class ElephantGun extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 25;
        this.Item.knockBack = 5;
        this.Item.ranged = true;
        this.Item.width = 72;
        this.Item.height = 26;
        this.Item.useTime = 32;
        this.Item.useAnimation = 32;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 50, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item14;
        this.Item.shoot = 98;
        this.Item.shootSpeed = 14;
        this.Item.useAmmo = Terraria.ID.AmmoID.Dart;
    }

    HoldoutOffset(item, player) {
        return { X: -6, Y: 2 };
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        let spawn = position;
        const length = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        if (length > 0) {
            const ahead = Vector2.new(
                position.X + velocity.X / length * 25,
                position.Y + velocity.Y / length * 25
            );
            if (CanHit(position, 0, 0, ahead, 0, 0)) spawn = ahead;
        }

        for (let i = 0; i < 10; i++) {
            const dust = Main.dust[NewDust(
                spawn, 4, 4, 170,
                velocity.X * 0.75 + Rand.NextFloat() * 0.25,
                velocity.Y * 0.75 + Rand.NextFloat() * 0.25,
                125, Color.White, 1.5
            )];
            if (dust) dust.noGravity = true;
        }

        const proj = Main.projectile[NewProjectile(
            null, spawn, velocity, type, damage, knockBack, player.whoAmI, 0, 0, 0, null
        )];
        if (proj && proj.penetrate > 0) {
            proj.penetrate++;
            proj.usesIDStaticNPCImmunity = false;
            proj.usesLocalNPCImmunity = true;
            proj.localNPCHitCooldown = 20;
        }

        return false;
    }
}
