import { Terraria, Modules } from '../../../TL/ModImports.js';
import { AmmoHelper } from './../../../Common/AmmoHelper.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const PELLETS = 3;
const SPREAD = 8 * Math.PI / 180; // leque total de 8 graus
const RECOIL = 3.75;              // empurrao pra tras ao disparar

let _cloudType = -1;

export class Slugger extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(18, 5, 0);
        this.Item.ranged = true;
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.useTime = 32;
        this.Item.useAnimation = 32;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item14;
        this.Item.shoot = Terraria.ID.ProjectileID.Bullet;
        this.Item.shootSpeed = 5;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
    }

    // Escopeta: 3 balas em leque, coice pra tras e fumaca no cano
    CanUseItem(item, player) {
        return AmmoHelper.Has(player, item.useAmmo);
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const projType = AmmoHelper.Consume(player, item.useAmmo);
        if (projType <= 0) return false;

        const source = null;
        const speed = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        const base = Math.atan2(velocity.X, velocity.Y);

        for (let i = 0; i < PELLETS; i++) {
            const angle = base + (Math.random() - 0.5) * SPREAD;
            NewProjectile(
                source, position.X, position.Y,
                speed * Math.sin(angle), speed * Math.cos(angle),
                projType, damage, knockBack, player.whoAmI,
                0, 0, 0, null
            );
        }

        const vel = player.velocity;
        player.velocity = Vector2.new(vel.X + player.direction * -RECOIL, vel.Y);

        if (_cloudType === -1) _cloudType = ModProjectile.getTypeByName('SluggerCloud') ?? -2;
        if (_cloudType >= 0) {
            const center = player.Center;
            NewProjectile(
                source, center.X, center.Y + player.direction * 4,
                player.direction, 0,
                _cloudType, 0, knockBack, Terraria.Main.myPlayer,
                0, 0, 0, null
            );
        }

        return false;
    }

    HoldoutOffset(item, player) {
        return { X: 0, Y: 0 };
    }

    // O C# usa o grupo IronBar (ferro ou chumbo), mas o AddRecipeGroup do TL
    // nao aceita quantidade, entao vai barra de ferro direto. 154 e o item
    // cru do decompilado, mantido como estava.
    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.IronBar, 14)
            .AddIngredient(154, 20)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
