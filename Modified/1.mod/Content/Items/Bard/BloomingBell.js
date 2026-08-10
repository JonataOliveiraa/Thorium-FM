import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _proType = -1;

export class BloomingBell extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Percussion';
        // this.timerStyle = 'Percussion';
        // this.useTimer = true;
        this.inspirationCost = 2;
    }

    SetDefaults() {
        this.SetWeaponValues(18, 0, 0);
        this.Item.width = 28;
        this.Item.height = 28;
        this.Item.useTime = 40;
        this.Item.useAnimation = 40;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item35;
        this.Item.shootSpeed = 8;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('BloomingBellPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'MovementSpeed', 2);
        }

        return true;
    }

    // Chacoalha 5 sementes num leque de 30 graus, cada uma um pouco mais lenta
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_proType < 0) return true;

        const source = null;
        const spread = 30 * Math.PI / 180;

        for (let i = 0; i < 5; i++) {
            const angle = (Math.random() * 2 - 1) * spread;
            const ca = Math.cos(angle);
            const sa = Math.sin(angle);
            const slow = 1 - Math.random() * 0.3;

            NewProjectile(
                source, position,
                Vector2.new(
                    (velocity.X * ca - velocity.Y * sa) * slow,
                    (velocity.X * sa + velocity.Y * ca) * slow
                ),
                _proType, damage, knockBack, player.whoAmI,
                0, 0, 0, null
            );
        }

        return false;
    }

    HoldoutOffset(item, player) {
        return { X: -4, Y: 4 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Petal'), 8)
            .AddTile(ArcaneArmorFabricator.Type)
            .Register();
    }
}
