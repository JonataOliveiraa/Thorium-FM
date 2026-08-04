import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2, Effects } = Modules;
const { Main } = Terraria;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const FEATHERS = 5;

let _barrierType = -1;
let _feartherProType = -1;

function isAltPressed(player) {
    return player.altFunctionUse === 2
        || player.controlUseTile
        || player.controlInteraction
        || player.controlSmart;
}

export class FeatherBarrierRod extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
        this._altShot = false;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(16, 6, 6);
        this.Item.mana = 15;
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.shootSpeed = 12;

        if (_feartherProType === -1) _feartherProType = ModProjectile.getTypeByName('FeatherBarrierPro') ?? -2;
        if (_feartherProType >= 0) this.Item.shoot = _feartherProType;
    }

    // Botao direito (ou toque secundario) monta a barreira em volta de voce
    AltFunctionUse(item, player) {
        return true;
    }

    /**
     * Roda antes do Shoot. E aqui que da pra ler os controles com seguranca,
     * entao guardamos o modo pra usar la embaixo.
     */
    ModifyShootStats(item, player, stats) {
        this._altShot = isAltPressed(player);
        return stats;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const alt = this._altShot || isAltPressed(player);
        this._altShot = false;

        if (!alt) return true;

        if (_barrierType === -1) _barrierType = ModProjectile.getTypeByName('FeatherBarrier') ?? -2;
        if (_barrierType < 0) return true;

        // Refaz a barreira do zero: derruba as penas antigas primeiro
        for (let i = 0; i < Main.maxProjectiles; i++) {
            const old = Main.projectile[i];
            if (old && old.active && old.owner === player.whoAmI && old.type === _barrierType) {
                old.Kill();
            }
        }

        const source = player.GetProjectileSource_Item(item);
        const center = player.Center;

        for (let i = 0; i < FEATHERS; i++) {
            NewProjectile(
                source, center, Vector2.Zero,
                _barrierType, damage, knockBack, player.whoAmI,
                i, 0, 0, null
            );
        }

        // Sem o botao direito no mobile o retorno visual/sonoro e o que deixa
        // claro que a barreira subiu
        Effects.PlaySound(Terraria.ID.SoundID.Item25, center.X, center.Y);

        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Feather, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
