import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { AmmoHelper } from './../../../Common/AmmoHelper.js';

const { Vector2, Effects } = Modules;
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

// O projetil proprio anda a 1 de velocidade, mas com 18 extraUpdates. Herdar a
// velocidade cheia do cano faria ele sair rapido demais para o homing corrigir.
const VELOCITY_SCALE = 0.1;
const SHOT_PITCH = 0.75;

let boltType = -1;

export class EnergyStormBolter extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/GraniteEnergyStorm/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.ranged = true;
        this.SetWeaponValues(18, 3, 4);
        this.Item.useTime = 10;
        this.Item.useAnimation = 10;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.shoot = ModProjectile.getTypeByName('EnergyStormBolterPro');
        this.Item.shootSpeed = 10;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
    }

    // O original usa Item114 com pitch +0.75; como UseSound aqui nao carrega
    // modificador, o tiro e' tocado na mao para preservar o tom agudo.
    UseItem(item, player) {
        Effects.PlaySound(Terraria.ID.SoundID.Item114, player.Center.X, player.Center.Y, 1, SHOT_PITCH);
    }

    CanUseItem(item, player) {
        return AmmoHelper.Has(player, item.useAmmo);
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        // Municoes especiais (Crystal Bullet, Meteor Shot...) seguem o comportamento
        // delas; so' a bala comum vira o projetil teleguiado.
        const ammo = AmmoHelper.Pick(player, item.useAmmo);
        if (!ammo) return false;
        if (ammo.shoot !== Terraria.ID.ProjectileID.Bullet) return true;

        if (boltType < 0) boltType = ModProjectile.getTypeByName('EnergyStormBolterPro') ?? -1;
        if (boltType < 0) return true;

        if (AmmoHelper.Consume(player, item.useAmmo) <= 0) return false;

        NEW_PROJECTILE(
            null,
            position, Vector2.Multiply(velocity, VELOCITY_SCALE),
            boltType, damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        return false;
    }
}
