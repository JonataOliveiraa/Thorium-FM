import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from "../../../TL/ModItem.js";
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { TileData } from "../../../TL/Modules/TileData.js";
import { WorldDB } from "../../../TL/WorldDB.js";

const { Main, NPC } = Terraria
const { TileObjectData } = Terraria.ObjectData

const NewNPC = NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const AnyNPCs = NPC['bool AnyNPCs(int Type)'];

const SHARD_COST = 5;
const SPAWN_DISTANCE = 700;

export class BloodAltar extends GlobalTile {
    Type = Terraria.ID.TileID.HoneyDispenser;

    SetStaticDefaults() {
        Main.tileDungeon[this.Type] = true

        const GetTileData = TileObjectData['TileObjectData GetTileData(int type, int style, int alternate)'];
        let data = GetTileData(this.Type, 0, 0);
        TileObjectData.readOnlyData = false;
        data.LavaDeath = false;
        TileObjectData.readOnlyData = true;
    }

    /**
     * Clicar no altar troca 5 Fragmentos Profanos pela invocacao do Visconde.
     * Ele nasce longe pra ter que se aproximar em vez de aparecer em cima.
     */
    RightClick(player, i, j, type) {
        if (this.Type !== type) return null;

        const viscountType = ModNPC.getTypeByName('Viscount');
        if (!(viscountType > 0)) return false;

        if (AnyNPCs(viscountType)) return false;

        const shardType = ModItem.getTypeByName('UnholyShards');
        if (!(shardType > 0)) return false;

        if (this._countShards(player, shardType) < SHARD_COST) {
            Main.NewText(ModLocalization.Translate('SinalizationChatMessage.BloodAltarMissingShards'), 200, 40, 40);
            return false;
        }

        this._takeShards(player, shardType, SHARD_COST);

        const side = Math.random() < 0.5 ? -1 : 1;
        const spawnX = (player.Center.X + side * SPAWN_DISTANCE) | 0;
        const spawnY = (player.Center.Y - 240) | 0;

        NewNPC(null, spawnX, spawnY, viscountType, 0, 0, 0, 0, 0, player.whoAmI);

        Effects.PlaySound(Terraria.ID.SoundID.Roar, player.Center.X, player.Center.Y, 0, 0, 1);

        return false;
    }

    _countShards(player, shardType) {
        const inv = player.inventory;
        let total = 0;

        for (let s = 0; s < 58; s++) {
            const slot = inv[s];
            if (slot && slot.type === shardType) total += slot.stack;
        }

        return total;
    }

    _takeShards(player, shardType, amount) {
        const inv = player.inventory;
        let left = amount;

        for (let s = 0; s < 58 && left > 0; s++) {
            const slot = inv[s];
            if (!slot || slot.type !== shardType) continue;

            const taken = Math.min(left, slot.stack);
            slot.stack -= taken;
            left -= taken;

            if (slot.stack <= 0) slot['void TurnToAir(bool fullReset)'](true);
        }
    }

    CanKillTile(i, j, type, blockDamaged) {
        const targetType = Terraria.ID.TileID.HoneyDispenser;

        for (let scanX = i - 1; scanX <= i + 1; scanX++) {
            for (let scanY = j - 3; scanY <= j; scanY++) {

                const tile = new TileData(scanX, scanY);

                if (tile.type !== targetType) continue;

                let left = scanX - Math.floor(tile.frameX / 18);
                let top = scanY - Math.floor(tile.frameY / 18);

                const bottom1 = new TileData(left, top + 3);
                const bottom2 = new TileData(left + 1, top + 3);
                const bottom3 = new TileData(left + 2, top + 3);

                const supportBroken = !bottom1.isSolid || !bottom2.isSolid || !bottom3.isSolid;

                const breakingSupport = (j === top + 3) && (i >= left && i <= left + 2);

                const breakingAltar = (j >= top && j <= top + 2) && (i >= left && i <= left + 2);

                if (supportBroken || breakingSupport || breakingAltar) {
                    // Mesma chave que o Viscount.OnKill grava
                    if (WorldDB.get('Thorium:HasBeenDefeated_Viscount') !== true) {
                        return false;
                    }
                }
            }
        }

        return null;
    }

    static InjectTexture() {
        const HoneyDispenserTile = Terraria.ID.TileID.HoneyDispenser;
        const HoneyDispenserItem = Terraria.ID.ItemID.HoneyDispenser;

        const bloodAltarItemTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Item.png");
        const bloodAltarTileTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Tile.png");
        const bloodAltarOutlineTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Highlight.png")

        if (bloodAltarTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[HoneyDispenserTile].Value = bloodAltarTileTexture;
        }

        if (HoneyDispenserItem != null) {
            Terraria.GameContent.TextureAssets.Item[HoneyDispenserItem].Value = bloodAltarItemTexture;
        }

        if (bloodAltarOutlineTexture != null) {
            Terraria.GameContent.TextureAssets.HighlightMask[HoneyDispenserTile].Value = bloodAltarOutlineTexture
        }
    }
}

//HoneyDispenser