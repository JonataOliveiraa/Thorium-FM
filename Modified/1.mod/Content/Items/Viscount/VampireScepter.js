import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const REACH = 25; // o tiro nasce a frente do jogador quando ha espaco livre

export class VampireScepter extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.damage = 26;
        this.Item.magic = true;
        this.Item.mana = 10;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 28;
        this.Item.useAnimation = 28;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('VampireScepterPro');
        this.Item.shootSpeed = 8;
    }

    ModifyShootStats(item, player, stats) {
        const vel = stats.velocity;
        const len = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
        if (len <= 0) return;

        const ahead = Vector2.new(
            stats.position.X + vel.X / len * REACH,
            stats.position.Y + vel.Y / len * REACH
        );

        if (CanHit(stats.position, 0, 0, ahead, 0, 0)) stats.position = ahead;
    }
}
