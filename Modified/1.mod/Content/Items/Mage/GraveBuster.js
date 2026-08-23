import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const SPAWN_OFFSET = 30; // a onda comeca 30px a frente dos seus pes
const WALK_SPEED = 6;

let _proType = -1;

export class GraveBuster extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(12, 4, 0);
        this.Item.magic = true;
        this.Item.mana = 6;
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
        this.Item.shootSpeed = 0;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('GraveBusterPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    // Ignora a mira: a onda sai rente ao chao, pro lado que voce esta virado
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (_proType < 0) return true;
        
        player.direction = Terraria.Main.MouseWorld.X < player.Center.X ? -1 : 1;
        const dir = player.direction > 0 ? 1 : -1;

        NewProjectile(
            null,
            player.Center.X + dir * SPAWN_OFFSET,
            player.Bottom.Y - 10,
            dir * WALK_SPEED, 0,
            _proType, damage, knockBack, player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }
}
