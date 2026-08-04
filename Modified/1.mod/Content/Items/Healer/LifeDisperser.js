import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const MUZZLE_OFFSET = 25;

export class LifeDisperser extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(20, 4, 4);
        this.Item.mana = 10;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 16;
        this.Item.useAnimation = 16;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 75, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.shoot = ModProjectile.getTypeByName('LifeDisperserPro');
        this.Item.shootSpeed = 8;
    }

    ModifyShootStats(item, player, stats) {
        const dir = Vector2.SafeNormalize(stats.velocity, Vector2.UnitX);
        const muzzle = Vector2.Add(stats.position, Vector2.Multiply(dir, MUZZLE_OFFSET));

        if (CanHit(stats.position, 0, 0, muzzle, 0, 0)) stats.position = muzzle;
    }
}
