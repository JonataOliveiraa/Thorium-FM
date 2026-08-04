import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';

const { Vector2 } = Modules;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const REACH = 28;
const SPEED_BOOST = 1.35;

export class SonarCannon extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
        this.instrumentStyle = 'Electronic';
        this.inspirationCost = 2;
    }

    SetDefaults() {
        this.Item.shoot = ModProjectile.getTypeByName('EchoWave');
        this.Item.shootSpeed = 15;

        this.SetWeaponValues(22, 5, 0);
        this.SetDefaultWeaponStyle(30, true);

        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useStyle = 5;
        this.Item.holdStyle = 3;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item92;
    }

    HoldoutOffset(item, player) {
        return Vector2.new(-22, 0);
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'EmpowermentProlongation', 1);
        }
        return true;
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

        stats.velocity = Vector2.new(vel.X * SPEED_BOOST, vel.Y * SPEED_BOOST);
    }
}
