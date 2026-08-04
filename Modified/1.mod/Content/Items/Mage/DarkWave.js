import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const FORWARD = 25; // a onda comeca um pouco a frente do jogador

let _proType = -1;

export class DarkWave extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(20, 5, 0);
        this.Item.magic = true;
        this.Item.mana = 8;
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 27, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
        this.Item.shootSpeed = 9;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('DarkWavePro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    // Empurra o ponto de saida pra frente, mas so se nao tiver parede no meio
    ModifyShootStats(item, player, stats) {
        const pos = stats.position;
        const vel = stats.velocity;

        const len = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
        if (len === 0) return stats;

        const ahead = Vector2.new(
            pos.X + vel.X / len * FORWARD,
            pos.Y + vel.Y / len * FORWARD
        );

        if (CanHit(pos, 0, 0, ahead, 0, 0)) stats.position = ahead;

        return stats;
    }

    /**
     * O projetil e invocado aqui de proposito. Se o Shoot devolvesse true, o TL
     * repassaria pro codigo da vanilla, que recalcula a posicao do zero e
     * jogaria fora o deslocamento feito no ModifyShootStats.
     */
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_proType < 0) return true;

        NewProjectile(
            player.GetProjectileSource_Item(item),
            position, velocity,
            _proType, damage, knockBack, player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.DemoniteBar, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
