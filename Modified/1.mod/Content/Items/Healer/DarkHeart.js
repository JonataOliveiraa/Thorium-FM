import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const HEALING_THRESHOLD = 40;
const BOLT_DAMAGE = 40;
const BOLT_KNOCKBACK = 5;
const SPAWN_HEIGHT = 50;

let _boltType = -1;

export class DarkHeart extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        if (ThoriumPlayer.totalHealingDarkHeart <= HEALING_THRESHOLD) return;

        if (_boltType === -1) _boltType = ModProjectile.getTypeByName('DarkHeartPro') ?? -2;
        if (_boltType < 0) return;

        const center = player.Center;
        NewProjectile(
            null, Vector2.new(center.X, center.Y - SPAWN_HEIGHT), Vector2.Zero,
            _boltType, BOLT_DAMAGE, BOLT_KNOCKBACK, player.whoAmI, 0, 0, 0, null
        );

        ThoriumPlayer.totalHealingDarkHeart = 0;
    }
}
