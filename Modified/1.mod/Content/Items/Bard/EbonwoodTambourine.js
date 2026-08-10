import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const SPECIAL_COOLDOWN = 60;

let _proType = -1;
let _burstType = -1;

/**
 * No celular nao existe botao direito: o toque secundario chega por um desses
 * controles, entao checamos todos.
 */
function isAltPressed(player) {
    return player.altFunctionUse === 2
        || player.controlUseTile
        || player.controlInteraction
        || player.controlSmart;
}

export class EbonwoodTambourine extends ModBardItem {
    constructor() {
        super();
        // As texturas usam W maiusculo, por isso o caminho vai escrito na mao
        this.Texture = 'Items/Bard/EbonWoodTambourine';
        this.instrumentStyle = 'Percussion';
        this.useWheel = false;
        this.inspirationCost = 1;

        this._altShot = false;
        this._nextSpecial = 0; // tick de jogo em que o especial libera de novo
    }

    SetDefaults() {
        this.SetWeaponValues(16, 2, 0);
        this.Item.width = 32;
        this.Item.height = 32;
        this.Item.useTime = 10;
        this.Item.useAnimation = 10;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.autoReuse = true;
        this.Item.maxStack = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 27, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shootSpeed = 10;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('EbonwoodTambourinePro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    AltFunctionUse(item, player) {
        return true;
    }

    /**
     * Jogada normal: so arremessa se nao tiver nenhum pandeiro no ar.
     * Toque secundario: o contrario, so vale com o pandeiro voando, e ainda
     * precisa esperar a recarga.
     */
    CanUseItem(item, player) {
        const owned = player.ownedProjectileCounts[this.Item.shoot] ?? 0;

        if (!isAltPressed(player)) return owned < 1;
        return owned >= 1 && Main.GameUpdateCount >= this._nextSpecial;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'MovementSpeed', 1);
            Empowerments.Apply(player, 'JumpHeight', 1);
        }

        return true;
    }

    // Roda antes do Shoot: e aqui que da pra ler os controles com seguranca
    ModifyShootStats(item, player, stats) {
        this._altShot = isAltPressed(player);
        return stats;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const alt = this._altShot || isAltPressed(player);
        this._altShot = false;

        if (!alt) return true;
        if (Main.GameUpdateCount < this._nextSpecial) return false;

        if (_burstType === -1) _burstType = ModProjectile.getTypeByName('EbonwoodTambourinePro2') ?? -2;
        if (_burstType < 0) return false;

        // Estoura uma onda em cima de cada pandeiro que estiver no ar
        const source = null;
        let fired = false;

        for (let i = 0; i < Main.maxProjectiles; i++) {
            const proj = Main.projectile[i];
            if (!proj || !proj.active || proj.owner !== player.whoAmI || proj.type !== this.Item.shoot) continue;

            NewProjectile(
                source, proj.Center, Vector2.Zero,
                _burstType, damage, 0, player.whoAmI,
                0, 0, 0, null
            );
            fired = true;
        }

        if (fired) this._nextSpecial = Main.GameUpdateCount + SPECIAL_COOLDOWN;

        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Tambourine'), 1)
            .AddIngredient(Terraria.ID.ItemID.DemoniteBar, 8)
            .AddIngredient(Terraria.ID.ItemID.Ebonwood, 10)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}
