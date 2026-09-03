import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const MUZZLE_FORWARD = 25;
const NOTE_COST = 1;
const SIGIL_COST = 5;
const EMPOWERMENT_LEVEL = 2;

let sigilType = -1;

function resolveSigilType() {
    if (sigilType === -1) sigilType = ModProjectile.getTypeByName('ForestOcarinaPro') ?? -2;
    return sigilType;
}

function isAltPressed(player) {
    return player.altFunctionUse === 2
        || player.controlUseTile
        || player.controlInteraction
        || player.controlSmart;
}

export class ForestOcarina extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Wind';
        this.inspirationCost = NOTE_COST;
        this._altShot = false;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('ForestOcarinaPro2');
        this.Item.shootSpeed = 12;

        this.SetWeaponValues(17, 4, 4);
        this.SetDefaultWeaponStyle(16, true);

        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.scale = 0.9;
        this.Item.noMelee = true;
        this.Item.holdStyle = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 75, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item42;
    }

    AltFunctionUse(item, player) {
        return true;
    }

    CanUseItem(item, player) {
        this.inspirationCost = isAltPressed(player) ? SIGIL_COST : NOTE_COST;
        return super.CanUseItem(item, player);
    }

    UseAnimation(item, player) {
        item.UseSound = isAltPressed(player) ? Terraria.ID.SoundID.Item117 : Terraria.ID.SoundID.Item42;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'ResourceMaximum', EMPOWERMENT_LEVEL);
        }

        return true;
    }

    ModifyShootStats(item, player, stats) {
        this._altShot = isAltPressed(player);
        return stats;
    }

    _clearSigils(player, type) {
        for (let index = 0; index < Main.maxProjectiles; index++) {
            const proj = Main.projectile[index];
            if (!proj || !proj.active) continue;
            if (proj.owner !== player.whoAmI || proj.type !== type) continue;

            proj.Kill();
        }
    }

    _echoFromSigils(player, sigil, type, damage, knockBack) {
        const mouse = Main.MouseWorld;

        for (let index = 0; index < Main.maxProjectiles; index++) {
            const proj = Main.projectile[index];
            if (!proj || !proj.active) continue;
            if (proj.owner !== player.whoAmI || proj.type !== sigil) continue;

            const center = proj.Center;
            const toMouse = Vector2.SafeNormalize(
                Vector2.new(mouse.X - center.X, mouse.Y - center.Y),
                Vector2.new(0, -1)
            );

            NewProjectile(
                null, center,
                Vector2.Multiply(toMouse, this.Item.shootSpeed),
                type, damage, knockBack, player.whoAmI, 0, 0, 0, null
            );
        }
    }

    _muzzle(position, velocity) {
        const forward = Vector2.Multiply(Vector2.Normalize(velocity), MUZZLE_FORWARD);
        const muzzle = Vector2.new(position.X + forward.X, position.Y + forward.Y);

        return MiscHelper.CanHitLineWorld(position, muzzle) ? muzzle : position;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const alt = this._altShot || isAltPressed(player);
        this._altShot = false;

        const sigil = resolveSigilType();
        if (sigil < 0) return true;

        if (alt) {
            this._clearSigils(player, sigil);
            NewProjectile(
                null, Main.MouseWorld, Vector2.Zero,
                sigil, 0, 0, player.whoAmI, 0, 0, 0, null
            );
            return false;
        }

        NewProjectile(
            null, this._muzzle(position, velocity), velocity,
            type, damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        this._echoFromSigils(player, sigil, type, damage, knockBack);
        return false;
    }
}
