import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { Effects } from '../../../TL/Modules/Effects.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewDustPerfect = Terraria.Dust.NewDustPerfect;
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const SWING_DUSTS = [15, 57, 58];
const SWING_DUST_CHANCE = 5;
const SWING_DUST_ALPHA = 150;
const SWING_DUST_DRAG = 0.2;
const SWING_BOX = 32;
const SWING_REACH = 24;

const LIGHT_R = 0.25;
const LIGHT_G = 0.3;
const LIGHT_B = 0.45;

const MINE_DUST_COUNT = 10;
const MINE_DUST_SCALE = 1.3;
const TILE_CENTER = 6;

const READY_DUST = 45;
const READY_DUST_COUNT = 5;
const READY_DUST_ALPHA = 255;
const READY_DUST_DRAG = 0.5;
const READY_SCALE_MIN = 20;
const READY_SCALE_MAX = 26;

const COOLDOWN_FACTOR = 4;

export class EnchantedPickaxe extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Misc/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.pick = 64;
        this.Item.tileBoost = 1;
        this.Item.melee = true;
        this.SetWeaponValues(9, 3, 4);
        this.Item.useTime = 14;
        this.Item.useAnimation = 18;
        this.Item.useStyle = 1;
        this.Item.autoReuse = true;
        this.Item.useTurn = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    UseStyle(item, player, mountOffset, heldItemFrame) {
        if (Rand.Next(SWING_DUST_CHANCE) !== 0) return;

        const origin = Vector2.new(
            player.Center.X + player.direction * SWING_REACH - SWING_BOX / 2,
            player.Center.Y - SWING_BOX / 2
        );

        const dust = NewDustDirect(
            origin, SWING_BOX, SWING_BOX,
            SWING_DUSTS[Rand.Next(SWING_DUSTS.length)],
            player.direction * 2, 0, SWING_DUST_ALPHA, Color.White, 1
        );
        if (dust) dust.velocity = Vector2.Multiply(dust.velocity, SWING_DUST_DRAG);
    }

    HoldItem(item, player) {
        Effects.AddLight(player.Center, LIGHT_R, LIGHT_G, LIGHT_B);

        if (Main.myPlayer !== player.whoAmI) return;

        if (ThoriumPlayer.enchantedPickaxeMineDelay <= 0) {
            this.TryDoubleMine(player);
            return;
        }

        this.RunEffects(player);
    }

    TryDoubleMine(player) {
        if (!player.ItemAnimationJustStarted) return;

        const tileX = Terraria.Player.tileTargetX;
        const tileY = Terraria.Player.tileTargetY;
        const tile = Main.tile.get_Item(tileX, tileY);

        if (tile && tile['bool active()']() && (Main.tileHammer[tile.type] || Main.tileAxe[tile.type])) return;

        ThoriumPlayer.enchantedPickaxeMineDelay = player.itemTime * COOLDOWN_FACTOR;
        ThoriumPlayer.enchantedPickaxeDustDelay = player.itemTime;
        ThoriumPlayer.enchantedPickaxeTileX = tileX;
        ThoriumPlayer.enchantedPickaxeTileY = tileY;

        player.itemTime = 0;
    }

    RunEffects(player) {
        if (ThoriumPlayer.enchantedPickaxeDustDelay > 0 && player.ItemAnimationJustStarted) {
            this.MinedDust();
            ThoriumPlayer.enchantedPickaxeDustDelay = 0;
        } else {
            ThoriumPlayer.enchantedPickaxeTileX = Terraria.Player.tileTargetX;
            ThoriumPlayer.enchantedPickaxeTileY = Terraria.Player.tileTargetY;
        }

        if (ThoriumPlayer.enchantedPickaxeMineDelay > 1) return;

        this.ReadyDust(player);
        PlaySound(Terraria.ID.SoundID.MaxMana, player.Center, 0, 1);
    }

    MinedDust() {
        const position = Vector2.new(
            ThoriumPlayer.enchantedPickaxeTileX * 16 + TILE_CENTER,
            ThoriumPlayer.enchantedPickaxeTileY * 16 + TILE_CENTER
        );

        for (let i = 0; i < MINE_DUST_COUNT; i++) {
            const dust = NewDustPerfect(
                position, SWING_DUSTS[Rand.Next(SWING_DUSTS.length)],
                null, 0, null, MINE_DUST_SCALE
            );
            if (dust) dust.velocity = Vector2.Multiply(dust.velocity, SWING_DUST_DRAG);
        }
    }

    ReadyDust(player) {
        for (let i = 0; i < READY_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                player.position, player.width, player.height, READY_DUST,
                0, 0, READY_DUST_ALPHA, Color.White,
                Rand.Next(READY_SCALE_MIN, READY_SCALE_MAX) * 0.1
            );
            if (!dust) continue;
            dust.noLight = true;
            dust.noGravity = true;
            dust.velocity = Vector2.Multiply(dust.velocity, READY_DUST_DRAG);
        }
    }
}
