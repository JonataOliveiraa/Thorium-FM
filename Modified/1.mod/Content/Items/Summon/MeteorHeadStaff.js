import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class MeteorHeadStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Summon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
        Terraria.ID.ItemID.Sets.StaffMinionSlotsRequired[this.Type] = 1;
    }

    SetDefaults() {
        this.SetWeaponValues(15, 4, 0);
        this.Item.summon = true;
        this.Item.mana = 10;
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 36;
        this.Item.useAnimation = 36;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;

        this.Item.buffType = ModBuff.getTypeByName('MeteorHeadStaffBuff');
        this.Item.shoot = ModProjectile.getTypeByName('MeteorHeadStaffPro');
    }

    // O lacaio nasce onde voce clicou, nao na mao
    ModifyShootStats(item, player, stats) {
        stats.position = Terraria.Main.MouseWorld;
        return stats;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(this.Item.buffType, 3600, false);

        const index = NewProjectile(
            null,
            position, velocity,
            type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );

        const proj = Terraria.Main.projectile[index];
        if (proj) proj.originalDamage = item.damage;

        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.MeteoriteBar, 20)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
