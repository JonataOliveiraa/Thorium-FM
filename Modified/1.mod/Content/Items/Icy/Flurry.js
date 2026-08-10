import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const FORWARD = 25; // o sopro comeca um pouco a frente do jogador

let _proType = -1;

export class Flurry extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Icy/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(9, 1, 0);
        this.Item.magic = true;
        this.Item.mana = 3;
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.useTime = 12;
        this.Item.useAnimation = 12;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 3, 50);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.shootSpeed = 6;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('FlurryPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    /**
     * Empurra o ponto de saida 25px pra frente, mas so se nao tiver parede no
     * caminho. Sem essa checagem daria pra atirar atraves de blocos finos.
     */
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
            null,
            position, velocity,
            _proType, damage, knockBack, player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('IcyShard'), 8)
            .AddIngredient(Terraria.ID.ItemID.Book, 1)
            .AddTile(Terraria.ID.TileID.Bookcases)
            .Register();
    }
}
