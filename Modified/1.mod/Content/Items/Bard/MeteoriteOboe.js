import { BardItemSound } from '../../../Common/Enum/BardItemSound.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Effects } from '../../../TL/Modules/Effects.js';
import { Empowerments } from '../../Global/Empowerments.js';

const { Vector2 } = Modules;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _proType = -1;
const Item66 = BardItemSound.Melodica;

export class MeteoriteOboe extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Wind';
        this.inspirationCost = 3;
    }

    SetDefaults() {
        this.SetWeaponValues(19, 3, 0);
        this.Item.width = 26;
        this.Item.height = 26;
        this.Item.scale = 0.9;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.shootSpeed = 12;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('MeteoriteOboePro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Item66, player.Center.X, player.Center.Y, 1, 0, 1);
            Empowerments.Apply(player, 'ResourceGrabRange', 1);
        }

        return true;
    }

    // Sai bem a frente, na ponta do instrumento
    ModifyShootStats(item, player, stats) {
        const pos = stats.position;
        const vel = stats.velocity;

        const len = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
        if (len === 0) return stats;

        const nx = vel.X / len;
        const ny = vel.Y / len;
        const side = player.direction;

        const ahead = Vector2.new(
            pos.X + nx * 45 - (-ny * side) * 2,
            pos.Y + ny * 45 - (nx * side) * 2
        );

        if (CanHit(pos, 0, 0, ahead, 0, 0)) stats.position = ahead;

        return stats;
    }

    // Invocado aqui pra nao perder o deslocamento do ModifyShootStats
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_proType < 0) return true;

        NewProjectile(
            player.GetProjectileSource_Item(item),
            position, velocity,
            _proType, damage, knockBack, player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }

    HoldoutOffset(item, player) {
        return { X: 2, Y: -2 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.MeteoriteBar, 20)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
