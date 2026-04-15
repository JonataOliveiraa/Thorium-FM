import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBiome } from './../../TL/ModBiome.js';
import { SceneEffectPriority } from './../../TL/SceneEffectPriority.js';

const { Color } = Modules;

export class AquaticDepths extends ModBiome {
    constructor() {
        super();
    }

    SetStaticDefaults() {
        this.Priority = SceneEffectPriority.BiomeLow;
        this.BiomeColor = Color.new(100, 100, 150);
    }

    IsBiomeActive(player, tileCounts) {
        return false;
    }

    Generate() {
        const { Main, ID } = Terraria;
        const { TileID } = ID
        const dungeonOnRight = Main.dungeonX > Main.maxTilesX / 2;
        let startX, endX;
        if (dungeonOnRight) {
            startX = 40;
            endX = startX + 200;
        } else {
            endX = Main.maxTilesX - 40;
            startX = endX - 200;
        }
        startX = Math.max(20, startX);
        endX = Math.min(Main.maxTilesX - 20, endX);
        const centerX = Math.floor((startX + endX) / 2);

        const oceanFloor = this.GetOceanFloor(centerX);
        if (oceanFloor <= 0) return;

        const ballRadius = 70;
        const ballCenterY = oceanFloor + 85;
        const ballTop = ballCenterY - ballRadius;
        const ballBottom = ballCenterY + ballRadius;
        const ballLeft = centerX - ballRadius - 10;
        const ballRight = centerX + ballRadius + 10;

        const shaftWidth = 6;
        const shaftLeft = centerX - Math.floor(shaftWidth / 2);
        const shaftRight = centerX + Math.floor(shaftWidth / 2);

        for (let y = oceanFloor; y < ballTop; y++) {
            for (let x = shaftLeft; x <= shaftRight; x++) {
                const tile = Main.tile.get_Item(x, y);
                tile['void active(bool active)'](false);
                tile.liquid = 0;
            }
            const leftTile = Main.tile.get_Item(shaftLeft - 1, y);
            const rightTile = Main.tile.get_Item(shaftRight + 1, y);
            if (!leftTile['bool active()']()) {
                leftTile['void active(bool active)'](true);
                leftTile.type = TileID.Sand;
            }
            if (!rightTile['bool active()']()) {
                rightTile['void active(bool active)'](true);
                rightTile.type = TileID.Sand;
            }
        }

        for (let x = ballLeft; x <= ballRight; x++) {
            for (let y = ballTop - 10; y <= ballBottom + 10; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                const dx = x - centerX;
                const dy = y - ballCenterY;
                let dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                const noise = Math.sin(angle * 5) * 0.1 + Math.sin(angle * 13) * 0.05;
                const adjustedRadius = ballRadius * (1 + noise * 0.2);
                if (dist <= adjustedRadius) {
                    const tile = Main.tile.get_Item(x, y);
                    tile['void active(bool active)'](true);
                    tile.type = TileID.Stone;
                    tile.liquid = 0;
                }
            }
        }

        const chamberRadius = 14;
        for (let x = centerX - chamberRadius; x <= centerX + chamberRadius; x++) {
            for (let y = ballCenterY - chamberRadius; y <= ballCenterY + chamberRadius; y++) {
                const dx = x - centerX;
                const dy = y - ballCenterY;
                if (Math.sqrt(dx * dx + dy * dy) <= chamberRadius) {
                    const tile = Main.tile.get_Item(x, y);
                    tile['void active(bool active)'](false);
                    tile.liquid = 0;
                }
            }
        }

        for (let y = ballTop; y < ballCenterY - chamberRadius + 3; y++) {
            for (let x = shaftLeft; x <= shaftRight; x++) {
                const tile = Main.tile.get_Item(x, y);
                tile['void active(bool active)'](false);
                tile.liquid = 0;
            }
        }

        for (let y = oceanFloor; y < oceanFloor + 10; y++) {
            for (let x = shaftLeft; x <= shaftRight; x++) {
                const tile = Main.tile.get_Item(x, y);
                if (!tile['bool active()']() && tile.liquid === 0) {
                    tile.liquid = 255;
                    tile['void liquidType(int liquidType)'](0);
                }
            }
        }
    }

    GetOceanFloor(x) {
        const { Main } = Terraria;
        for (let y = 80; y < Main.worldSurface + 100; y++) {
            const tile = Main.tile.get_Item(x, y);
            if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                const above = Main.tile.get_Item(x, y - 1);
                if (above.liquid > 0) return y;
            }
        }
        return Main.worldSurface - 20;
    }
}