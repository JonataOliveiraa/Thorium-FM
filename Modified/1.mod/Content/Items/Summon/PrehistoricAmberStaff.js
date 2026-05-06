import { Terraria } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { Rand } from '../../../TL/Modules/Rand.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const { TileID, ItemID } = Terraria.ID
export class PrehistoricAmberStaff extends ModItem {
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
        this.Item.damage = 18;
        this.Item.knockBack = 8;
        this.Item.mana = 20;
        this.Item.width = 32;
        this.Item.height = 32;
        this.Item.useTime = 36;
        this.Item.useAnimation = 36;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 25, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;

        this.Item.noMelee = true;
        this.Item.summon = true;
        this.Item.buffType = ModBuff.getTypeByName('PrehistoricAmberStaffBuff');
        this.Item.shoot = ModProjectile.getTypeByName('PrehistoricAmberStaffTRexPro');
    }

    ModifyShootStats(item, player, stats) {
        stats.position = Terraria.Main.MouseWorld;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(this.Item.buffType, 2, false);

        const trexType = ModProjectile.getTypeByName('PrehistoricAmberStaffTRexPro');
        const pterodactylType = ModProjectile.getTypeByName('PrehistoricAmberStaffPterosPro');

        type = Rand.NextBool() ? trexType : pterodactylType;

        const projIndex = NewProjectile(
            player.GetProjectileSource_Item(item),
            position, velocity,
            type, damage, knockBack,
            player.whoAmI, 0, 10, -1, null
        );
        const proj = Terraria.Main.projectile[projIndex];
        proj.originalDamage = item.damage;

        return false;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            this.TooltipLines[i] = this.TooltipLines[i];
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ItemID.FossilOre, 12)
            .AddIngredient(ItemID.Amber, 2)
            .AddTile(TileID.Anvils)
            .Register();
    }
}