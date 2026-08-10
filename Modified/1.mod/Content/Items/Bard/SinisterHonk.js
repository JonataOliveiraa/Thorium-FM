import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Effects } from '../../../TL/Modules/Effects.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';

const { Vector2 } = Modules;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _proType = -1;

export class SinisterHonk extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Percussion';
        this.timerStyle = 'Percussion';
        this.inspirationCost = 1;
    }

    SetDefaults() {
        this.SetWeaponValues(20, 8, 0);
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 24;
        this.Item.useAnimation = 24;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 28, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Pink;
        this.Item.shootSpeed = 10;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('SinisterHonkPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.NPCHit24, player.Center.X, player.Center.Y, 1, 1);
            Empowerments.Apply(player, 'MovementSpeed', 1);
            Empowerments.Apply(player, 'JumpHeight', 2);
        }

        return true;
    }

    ModifyShootStats(item, player, stats) {
        const pos = stats.position;
        const vel = stats.velocity;

        const len = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
        if (len === 0) return stats;

        const nx = vel.X / len;
        const ny = vel.Y / len;
        const side = player.direction; // gira 90 graus pro lado do jogador

        const ahead = Vector2.new(
            pos.X + nx * 30 - (-ny * side) * 6,
            pos.Y + ny * 30 - (nx * side) * 6
        );

        if (CanHit(pos, 0, 0, ahead, 0, 0)) stats.position = ahead;

        return stats;
    }

    // Invocado aqui pra nao perder o deslocamento feito no ModifyShootStats
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_proType < 0) return true;

        NewProjectile(
            null,
            position, velocity,
            _proType, damage, knockBack, player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }

    HoldoutOffset(item, player) {
        return { X: -8, Y: -2 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Feather, 7)
            .AddTile(ArcaneArmorFabricator.Type)
            .Register();
    }
}
