import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const STAGE_PROJECTILES = ['FieryTotemPlaced', 'GroundedTotemPlaced', 'WindyTotemPlaced', 'MistyTotemPlaced'];
const STAGE_COUNT = STAGE_PROJECTILES.length;

const DROP_SPEED = 15;
const CYCLE_TIME_SCALE = 0.2;
const FADE_FULL = 1.8;

const _stageTypes = new Int32Array(STAGE_COUNT).fill(-1);

function isAltPressed(player) {
    return player.altFunctionUse === 2
        || player.controlUseTile
        || player.controlInteraction
        || player.controlSmart;
}

export class TotemCaller extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
        this._altShot = false;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.damage = 30;
        this.Item.mana = 20;
        this.Item.width = 60;
        this.Item.height = 60;
        this.Item.useTime = 40;
        this.Item.useAnimation = 40;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.knockBack = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;

        if (_stageTypes[0] === -1) _stageTypes[0] = ModProjectile.getTypeByName(STAGE_PROJECTILES[0]) ?? -2;
        if (_stageTypes[0] >= 0) this.Item.shoot = _stageTypes[0];
    }

    AltFunctionUse(item, player) {
        return true;
    }

    UseSpeedMultiplier(item, player) {
        return isAltPressed(player) ? CYCLE_TIME_SCALE : 1;
    }

    UseAnimation(item, player) {
        if (isAltPressed(player)) {
            item.useStyle = Terraria.ID.ItemUseStyleID.HoldUp;
            item.UseSound = Terraria.ID.SoundID.Item9;
            return;
        }
        item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        item.UseSound = Terraria.ID.SoundID.Item44;
    }

    ModifyManaCost(item, player, mana) {
        return isAltPressed(player) ? 0 : mana;
    }

    ModifyShootStats(item, player, stats) {
        this._altShot = isAltPressed(player);
        return stats;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const alt = this._altShot || isAltPressed(player);
        this._altShot = false;

        if (alt) {
            ThoriumPlayer.totemCallerStage = (ThoriumPlayer.totemCallerStage + 1) % STAGE_COUNT;
            ThoriumPlayer.totemCallerFade = FADE_FULL;
            return false;
        }

        const stage = ThoriumPlayer.totemCallerStage;
        if (_stageTypes[stage] === -1) {
            _stageTypes[stage] = ModProjectile.getTypeByName(STAGE_PROJECTILES[stage]) ?? -2;
        }
        if (_stageTypes[stage] < 0) return false;

        const spawn = Vector2.new(Main.MouseWorld.X, Main.MouseWorld.Y);
        const index = NewProjectile(
            null, spawn, Vector2.new(0, DROP_SPEED),
            _stageTypes[stage], damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        const sentry = Main.projectile[index];
        if (sentry) sentry.originalDamage = item.damage;

        player.UpdateMaxTurrets();
        return false;
    }

    HoldItem(item, player) {
        ThoriumPlayer.totemCallerDisplay = true;
    }
}
