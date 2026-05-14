import { MathHelper } from '../../../TL/Modules/MathHelper.js';
import { Vector2 } from '../../../TL/Modules/Vector2.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)']

export class BubbleConch extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Depth/' + this.constructor.name;

        this.lockedAngle = 0
        this.lockedDir = 0
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.magic = true;
        this.Item.noMelee = true;
        this.Item.mana = 20;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 4;
        this.Item.useAnimation = 12;
        this.Item.reuseDelay = 30;
        this.Item.useStyle = 5;
        this.Item.useTurn = true;

        this.SetWeaponValues(20, 0, 4)
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item56;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('BubbleConchPro');
        this.Item.shootSpeed = 8;
    }

    ModifyShootStats(item, player, stats) {
        const velocity = stats.velocity;
        const forward = Vector2.Multiply(Vector2.Normalize(velocity), 25);
        if (Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'](
            stats.position, 0, 0, Vector2.Add(stats.position, forward), 0, 0)) {
            stats.position = Vector2.Add(stats.position, forward);
        }

        stats.velocity = Terraria.Utils.RotatedByRandom(velocity, MathHelper.ToRadians(20));
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const angle = (Math.random() - 0.5) * 0.4;
        const dir = Vector2.RotatedBy(velocity, angle);
        NewProjectile(
            player.GetProjectileSource_Item(item),
            position.X, position.Y,
            dir.X, dir.Y,
            type, damage, knockBack,
            player.whoAmI,
            0, 0, 0, null
        );
        return false;
    }

    HoldItem(item, player) {
        if (player.itemAnimation <= 0) return;

        const mouseX = Terraria.Main.mouseX + Terraria.Main.screenPosition.X;
        const mouseY = Terraria.Main.mouseY + Terraria.Main.screenPosition.Y;

        player['void ChangeDir(int dir)'](mouseX > player.Center.X ? 1 : -1);

        if (player.ItemAnimationJustStarted || player.direction !== this.lockedDir) {
            this.lockedDir = player.direction;
            const c = player.RotatedRelativePoint(player.MountedCenter, true, true);
            const dx = mouseX - c.X;
            const dy = mouseY - c.Y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                this.lockedAngle = Math.atan2(dy / len, dx / len);
            }
        }

        const dir = player.direction;
        player.itemRotation = Math.atan2(
            Math.sin(this.lockedAngle) * dir,
            Math.cos(this.lockedAngle) * dir
        ) - player.fullRotation;
    }
}