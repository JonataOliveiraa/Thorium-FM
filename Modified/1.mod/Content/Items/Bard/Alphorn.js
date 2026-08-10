import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Vector2, Rand, Effects } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _proType = -1;

export class Alphorn extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Brass';
        // this.timerStyle = 'Brass';
        // this.useTimer = true;
        this.inspirationCost = 1;
    }

    SetDefaults() {
        this.SetWeaponValues(7, 2, 0);
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 25;
        this.Item.useAnimation = 25;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item139;
        this.Item.shootSpeed = 0;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('AlphornPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'FlatDamage', 1);

            // Anel de sopro que se abre em volta de voce a cada toque
            const center = player.Center;
            FxHelper.ring(center.X, center.Y, 40, 15, 15, 16, 6, 1.5, 0, 75);
        }

        return true;
    }

    // A nota sobe pro alto e so depois procura alvo
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_proType < 0) return true;

        const center = player.Center;

        NewProjectile(
            null,
            Vector2.new(center.X + player.direction * 24, center.Y + 6),
            Vector2.new(Rand.NextFloat() * 8 - 4, Rand.NextFloat() * -3 - 12),
            _proType, damage, knockBack, player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }

    HoldoutOffset(item, player) {
        return { X: -2, Y: 1 };
    }

    // 75 e o item cru do decompilado, mantido como estava
    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(75, 8)
            .AddIngredient(Terraria.ID.ItemID.Cloud, 25)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
