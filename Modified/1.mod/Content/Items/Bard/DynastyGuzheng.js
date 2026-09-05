import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

export class DynastyGuzheng extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentType = 'String';
        this.inspirationCost = 1;
    }

    SetDefaults() {
        super.SetDefaults();
        this.Item.damage = 14;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 36;
        this.Item.useAnimation = 36;
        this.Item.autoReuse = true;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 4.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 0);
        this.Item.rare = 1;
        this.Item.shoot = ModProjectile.getTypeByName('DynastyGuzhengPro');
        this.Item.shootSpeed = 10.0;
    }

    HoldoutOffset(item) {
        return { X: -6, Y: 0 };
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('guzhengSound');
            Empowerments.Apply(player, 'InvincibilityFrames', 1);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.direction = velocity.X > 0 ? 1 : -1;
        const source = player.GetProjectileSource_Item(item);
        const offset = Vector2.Multiply(Vector2.Normalize(velocity), 25);
        let shootPos = position;
        if (CanHit(position, 0, 0, Vector2.Add(position, offset), 0, 0)) {
            shootPos = Vector2.Add(position, offset);
        }
        const num = 4;
        const radians = 0.2617993950843811;
        for (let index = 0; index < num; index++) {
            const t = index / (num - 1);
            const angle = radians * (2 * t - 1);
            const dir = Vector2.Multiply(Vector2.RotatedBy(velocity, angle, Vector2.Zero), 0.2);
            NewProjectile(source, shootPos, dir, type, damage, knockBack, player.whoAmI, 0.0, 0.0, 0.0, null);
        }
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(2260, 20)
        .AddIngredient(75, 3)
        .AddTile(16)
        .Register();
    }
}
