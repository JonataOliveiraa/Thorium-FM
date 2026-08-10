import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

// Cadencia: cada tiro acelera a arma, parar de atirar esfria de volta.
// O useTime e reescrito na mao porque os multiplicadores do TL mexem so na
// animacao (e no som), nao no intervalo real entre os tiros.
const BASE_USE_TIME = 38;
const SPEED_STEP = 0.1;
const SPEED_MAX = 2.5;
const COOLDOWN_TICKS = 60;
const REACH = 25;
const SHOT_PENETRATE = 3;

export class GuanoGunner extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
        this.speedMult = 1;
        this.cooldown = 0;
    }

    SetDefaults() {
        this.Item.damage = 18;
        this.Item.ranged = true;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = BASE_USE_TIME;
        this.Item.useAnimation = BASE_USE_TIME;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item40;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('SnotShot');
        this.Item.shootSpeed = 7;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
    }

    HoldoutOffset(item, player) {
        return Vector2.new(-4, 0);
    }

    _applySpeed(item) {
        const time = Math.max(6, Math.round(BASE_USE_TIME / this.speedMult));
        item.useTime = time;
        item.useAnimation = time;
    }

    // Esfria enquanto esta na mao sem atirar
    HoldItem(item, player) {
        if (this.speedMult > 1 && ++this.cooldown > COOLDOWN_TICKS) {
            this.cooldown = 0;
            this.speedMult = Math.max(1, this.speedMult - SPEED_STEP);
        }
        this._applySpeed(item);
    }

    // Guardou a arma: volta pra cadencia base
    UpdateInventory(item, player) {
        if (player.HeldItem !== item && this.speedMult !== 1) {
            this.speedMult = 1;
            this.cooldown = 0;
            this._applySpeed(item);
        }
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        this.ConsumeAmmo(player);

        if (this.speedMult < SPEED_MAX) this.speedMult = Math.min(SPEED_MAX, this.speedMult + SPEED_STEP);
        this.cooldown = 0;
        this._applySpeed(item);

        const len = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y) || 1;
        let spawn = position;
        const ahead = Vector2.new(
            position.X + velocity.X / len * REACH,
            position.Y + velocity.Y / len * REACH
        );
        if (CanHit(position, 0, 0, ahead, 0, 0)) spawn = ahead;

        const index = NewProjectile(
            null,
            spawn, velocity, type, damage, knockBack, player.whoAmI,
            0, 0, 0, null
        );

        const proj = Main.projectile[index];
        if (proj) proj.penetrate = SHOT_PENETRATE;

        return false;
    }

    ConsumeAmmo(player) {
        const ammoType = Terraria.ID.AmmoID.Bullet;
        for (let i = 0; i < 54; i++) {
            const invItem = player.inventory[i];
            if (invItem && invItem.ammo === ammoType && invItem.stack > 0) {
                invItem.stack--;
                if (invItem.stack <= 0) {
                    invItem.active = false;
                    invItem.type = 0;
                }
                break;
            }
        }
    }
}
