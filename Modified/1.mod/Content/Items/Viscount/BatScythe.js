import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const THROW_SPEED = 14;
const THROW_DAMAGE = 0.75;

let _thrownType = -1;

/**
 * No celular nao existe botao direito, entao player.altFunctionUse nunca vira
 * 2. O toque secundario chega por um desses controles.
 */
function isAltPressed(player) {
    return player.altFunctionUse === 2
        || player.controlUseTile
        || player.controlInteraction
        || player.controlSmart;
}

export class BatScythe extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
        this._altShot = false;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.Item.damage = 16;
        this.Item.width = 52;
        this.Item.height = 44;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('BatScythePro');
    }

    // Toque secundario arremessa a foice
    AltFunctionUse(item, player) {
        return true;
    }

    // Roda antes do Shoot: e aqui que da pra ler os controles com seguranca
    ModifyShootStats(item, player, stats) {
        this._altShot = isAltPressed(player);
        return stats;
    }

    // So deixa girar/arremessar de novo depois que a foice voltou
    CanUseItem(item, player) {
        if (_thrownType === -1) _thrownType = ModProjectile.getTypeByName('BatScythePro2');
        return _thrownType < 0 || player.ownedProjectileCounts[_thrownType] <= 0;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const alt = this._altShot || isAltPressed(player);
        this._altShot = false;

        if (!alt) return true;
        if (_thrownType < 0) return true;

        const len = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y) || 1;
        NewProjectile(
            player.GetProjectileSource_Item(item),
            position,
            Vector2.new(velocity.X / len * THROW_SPEED, velocity.Y / len * THROW_SPEED),
            _thrownType, Math.floor(damage * THROW_DAMAGE), 3, player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }
}
