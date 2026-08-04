import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

// No PC a bengala custa 2 slots de minion, mas o jogador comeca com 1 e o item
// simplesmente nao funcionaria sem equipamento de invocador.
const MINION_SLOTS = 1;

export class ViscountCane extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
        Terraria.ID.ItemID.Sets.StaffMinionSlotsRequired[this.Type] = MINION_SLOTS;
    }

    SetDefaults() {
        this.Item.damage = 18;
        this.Item.knockBack = 4;
        this.Item.mana = 20;
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.useTime = 36;
        this.Item.useAnimation = 36;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;

        this.Item.noMelee = true;
        this.Item.summon = true;
        this.Item.buffType = ModBuff.getTypeByName('ViscountCaneBuff');
        this.Item.shoot = ModProjectile.getTypeByName('ViscountCanePro');
    }

    ModifyShootStats(item, player, stats) {
        stats.position = Terraria.Main.MouseWorld;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(this.Item.buffType, 2, false);

        const projIndex = NewProjectile(
            player.GetProjectileSource_Item(item),
            position, velocity,
            type, damage, knockBack,
            player.whoAmI, 0, 10, -1, null
        );
        const proj = Terraria.Main.projectile[projIndex];
        if (proj) proj.originalDamage = item.damage;

        return false;
    }
}
