import { BardItemSound } from '../../../Common/Enum/BardItemSound.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';

const { Vector2 } = Modules;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _proType = -1;

export class ObsidianRackett extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Wind';
        this.inspirationCost = 1;
    }

    SetDefaults() {
        this.SetWeaponValues(18, 4, 0);
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.scale = 0.9;
        this.Item.useTime = 16;
        this.Item.useAnimation = 16;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 26, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item26;
        this.Item.shootSpeed = 8;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('MagmaRackettPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('panfluteSound')
            Empowerments.Apply(player, 'ResourceMaximum', 2);
        }

        return true;
    }

    // Sai da boca do instrumento: 10px pra frente e 6px pro lado
    ModifyShootStats(item, player, stats) {
        const pos = stats.position;
        const vel = stats.velocity;

        const len = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
        if (len === 0) return stats;

        const nx = vel.X / len;
        const ny = vel.Y / len;
        const side = player.direction;

        const ahead = Vector2.new(
            pos.X + nx * 10 + (-ny * side) * 6,
            pos.Y + ny * 10 + (nx * side) * 6
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
        return { X: 2, Y: 2 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Obsidian, 24)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
