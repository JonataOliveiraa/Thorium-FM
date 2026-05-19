import { Terraria, Modules } from "../../../TL/ModImports.js";
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Color } from "../../../TL/Modules/Color.js";
import { Rand } from "../../../TL/Modules/Rand.js";

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const SPAWN_OFFSET_RATIOS = [0.1, 0.5, 0.9];
const SLASH_COLORS = [
    Color.new(255, 183, 220),
    Color.new(105, 255, 164),
    Color.new(111, 251, 255),
];

export class CoralSlasher extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Coral/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.melee = true;
        this.SetWeaponValues(11, 5, 0);
        this.SetDefaultWeaponStyle(22, true);
        this.Item.value = Terraria.Item.sellPrice(0, 0, 22, 0);
        this.Item.useTurn = true
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    OnHitNPC(item, player, npc, damageDone, knockBack) {
        if (ThoriumPlayer.CoralSlasherCharge >= 3) return;
        ThoriumPlayer.CoralSlasherCharge++;

        const count = ThoriumPlayer.CoralSlasherCharge >= 3 ? 15 : 6;
        for (let i = 0; i < count; i++) {
            const dustIdx = Terraria.Dust.NewDust(
                player.position, player.width, player.height,
                2,
                0, 0, 0,
                SLASH_COLORS[Math.floor(Math.random() * SLASH_COLORS.length)],
                0.8
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (!dust) continue;
            dust.noGravity = true;
            const ox = Rand.Next(-45, 46);
            const oy = Rand.Next(-45, 46);
            const pos = dust.position;
            pos.X += ox;
            pos.Y += oy;
            dust.position = pos;
            dust.velocity = Vector2.new(-ox * 0.075, -oy * 0.075);
        }
    }

    UseStyle(item, player) {
        if (Terraria.Main.myPlayer !== player.whoAmI) return;
        if (!ThoriumPlayer.CoralSlasherReady) return;

        const itemAnim = player.itemAnimation;
        const itemAnimMax = player.itemAnimationMax;
        let spawnIdx = -1;
        for (let i = 0; i < SPAWN_OFFSET_RATIOS.length; i++) {
            if (itemAnim === Math.floor(itemAnimMax * SPAWN_OFFSET_RATIOS[i])) {
                spawnIdx = i;
                break;
            }
        }
        if (spawnIdx === -1) return;

        const angle = -SPAWN_OFFSET_RATIOS[spawnIdx] * (Math.PI / 2);
        const unit = Vector2.RotatedBy(Vector2.new(1, 0), angle);
        const dir = Vector2.new(unit.X * player.direction, unit.Y * player.gravDir);
        const spawnPos = Vector2.Add(player.Center, Vector2.Multiply(dir, 20));
        const vel = Vector2.Multiply(dir, 4);
        const damage = Math.floor(player.GetWeaponDamage(item) * 0.637);

        const proType = ModProjectile.getTypeByName('CoralSlasherPro');
        const source = player.GetProjectileSource_Item(item);
        NewProjectile(source, spawnPos, vel, proType, damage, 0, player.whoAmI, 0, 0, 0, null);

        if (spawnIdx === 0) {
            ThoriumPlayer.CoralSlasherCharge = 0;
            ThoriumPlayer.CoralSlasherReady = false;
        }
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Coral, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}