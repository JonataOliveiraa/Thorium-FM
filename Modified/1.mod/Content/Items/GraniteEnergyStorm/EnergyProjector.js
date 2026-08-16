import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const BARRIER_COUNT = 12;
// Original: 15. Reduzido junto com o rastro dos orbes.
const CAST_DUST = 6;

let barrierType = -1;

export class EnergyProjector extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/GraniteEnergyStorm/' + this.constructor.name;
        this._holdout = null;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.magic = true;
        this.SetWeaponValues(12, 5, 4);
        this.Item.mana = 15;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item72;
        this.Item.shoot = ModProjectile.getTypeByName('GraniteBarrier');
        this.Item.shootSpeed = 0;
    }

    // Chamado a cada desenho enquanto a arma esta na mao: nao vale realocar.
    HoldoutOffset(item, player) {
        if (!this._holdout) this._holdout = Vector2.new(-2, -6);
        return this._holdout;
    }

    _clearExistingBarriers(player) {
        for (let index = 0; index < Main.maxProjectiles; index++) {
            const proj = Main.projectile[index];
            if (!proj || !proj.active) continue;
            if (proj.owner !== player.whoAmI || proj.type !== barrierType) continue;

            proj.Kill();
        }
    }

    _createCastDust(player) {
        const position = player.position;
        const width = player.width;
        const height = player.height;
        const white = Color.White;

        for (let index = 0; index < CAST_DUST; index++) {
            const dustIndex = Effects.NewDust(position, width, height, 15, Rand.NextFloat(-3, 3), Rand.NextFloat(-3, 3), 200, white, 1.15);
            Main.dust[dustIndex].noGravity = true;
        }
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (barrierType < 0) barrierType = ModProjectile.getTypeByName('GraniteBarrier') ?? -1;
        if (barrierType < 0) return true;

        // Recastar recomeca a barreira do zero em vez de acumular orbes.
        this._clearExistingBarriers(player);
        this._createCastDust(player);

        const center = player.Center;
        const zero = Vector2.Zero;

        for (let index = 0; index < BARRIER_COUNT; index++) {
            NEW_PROJECTILE(null, center, zero, barrierType, damage, knockBack, player.whoAmI, index, 0, 0, null);
        }

        // O original devolve true, entao o disparo padrao ainda nasce e vira um 13o
        // orbe sobreposto ao indice 0. Como o tipo usa immunity estatica por ID, ele
        // nao adiciona dano - so' ocupa um slot. Mantido por fidelidade.
        return true;
    }
}
