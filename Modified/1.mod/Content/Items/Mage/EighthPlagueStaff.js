import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;

let _proType = -1;

export class EighthPlagueStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(10, 3, 0);
        this.Item.magic = true;
        this.Item.mana = 10;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 2;       // rajada curta...
        this.Item.useAnimation = 8;
        this.Item.reuseDelay = 24;   // ...seguida de uma pausa
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 27, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.shootSpeed = 10;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('EighthPlagueStaffPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    // Enxame: cada gafanhoto sai torto e com velocidade um pouco diferente
    ModifyShootStats(item, player, stats) {
        const vel = stats.velocity;
        const speed = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
        if (speed === 0) return stats;

        const angle = Math.atan2(vel.X, vel.Y) + (Math.random() - 0.5) * 0.2;
        const scale = Math.random() * 0.2 + 0.95;

        stats.velocity = Vector2.new(
            speed * scale * Math.sin(angle),
            speed * scale * Math.cos(angle)
        );

        return stats;
    }
}
