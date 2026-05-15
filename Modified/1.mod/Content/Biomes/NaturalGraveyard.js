import { Rand } from '../../TL/Modules/Rand.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBiome } from './../../TL/ModBiome.js';
import { SceneEffectPriority } from './../../TL/SceneEffectPriority.js';

const { Color } = Modules;

export class NaturalGraveyard extends ModBiome {
    constructor() {
        super();
    }

    SetStaticDefaults() {
        this.Priority = SceneEffectPriority.BiomeLow;
        this.BiomeColor = Color.new(60, 55, 45);
    }

    IsBiomeActive(player, tileCounts) {
        return tileCounts[Terraria.ID.TileID.AncientCopperBrick] >= 50;
    }

    Generate() {
        const { Main, ID, WorldGen } = Terraria;
        const { TileID, WallID } = ID;

        const scale = Main.maxTilesX / 4200;
        const dungeonX = Main.dungeonX;
        const spawnX = Main.spawnTileX;
        const dungeonOnRight = dungeonX > spawnX;
        const scanStep = dungeonOnRight ? 1 : -1;

        // Scan starts below floating island altitude, same principle as Thorium's worldSurfaceLow
        const surfaceScanStartY = Math.floor(Main.worldSurface * 0.7);

        const scanStart = spawnX + scanStep * 30;
        const scanEnd = dungeonX - scanStep * 80;

        // ---- Scan ALL forest columns between spawn and dungeon ----
        const allRuns = [];
        let currentRun = [];

        let sx = scanStart;
        while (dungeonOnRight ? sx < scanEnd : sx > scanEnd) {
            if (sx < 60 || sx >= Main.maxTilesX - 60) { sx += scanStep; continue; }

            let surfY = -1;
            for (let y = surfaceScanStartY; y < Main.worldSurface + 30; y++) {
                if (y >= Main.maxTilesY) break;
                const tile = Main.tile.get_Item(sx, y);
                if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                    surfY = y;
                    break;
                }
            }

            let isForest = false;
            if (surfY !== -1 && surfY < Main.worldSurface) {
                const surfTile = Main.tile.get_Item(sx, surfY);
                isForest = surfTile.type === TileID.Grass;
                if (!isForest) {
                    for (let ty = Math.max(0, surfY - 35); ty < surfY; ty++) {
                        const t = Main.tile.get_Item(sx, ty);
                        if (t['bool active()']() && t.type === TileID.Trees) {
                            isForest = true;
                            break;
                        }
                    }
                }
            }

            if (isForest) {
                currentRun.push({ x: sx, surfY });
            } else {
                if (currentRun.length >= 20) {
                    allRuns.push([...currentRun]);
                }
                currentRun = [];
            }

            sx += scanStep;
        }
        if (currentRun.length >= 20) allRuns.push([...currentRun]);

        // ---- Score all runs: prefer longer + closer to dungeon ----
        const totalScanLen = Math.abs(scanEnd - scanStart);

        let bestRun = [];
        let bestScore = -1;

        for (const run of allRuns) {
            const runMidX = run[Math.floor(run.length / 2)].x;
            const distFromDungeon = Math.abs(runMidX - dungeonX);
            const proximityScore = 1 - (distFromDungeon / totalScanLen);
            const lengthScore = Math.min(1, run.length / 120);
            const score = lengthScore * 0.6 + proximityScore * 0.4;

            if (score > bestScore) {
                bestScore = score;
                bestRun = run;
            }
        }

        // ---- Determine biome bounds ----
        const minBiomeWidth = Math.floor(70 * scale);
        const maxBiomeWidth = Math.floor(130 * scale);
        const transitionWidth = Math.floor(12 * scale);

        let startX, endX;
        if (bestRun.length >= minBiomeWidth) {
            const xs = bestRun.map(c => c.x);
            startX = Math.min(...xs);
            endX = Math.max(...xs);
            if (endX - startX > maxBiomeWidth) {
                const mid = Math.floor((startX + endX) / 2);
                startX = mid - Math.floor(maxBiomeWidth / 2);
                endX = mid + Math.floor(maxBiomeWidth / 2);
            }
        } else {
            const mid = Math.floor((spawnX + dungeonX) / 2);
            startX = mid - Math.floor(minBiomeWidth / 2);
            endX = mid + Math.floor(minBiomeWidth / 2);
        }

        startX = Math.max(70, startX);
        endX = Math.min(Main.maxTilesX - 70, endX);

        const centerX = Math.floor((startX + endX) / 2);
        const biomeHalfWidth = Math.max(1, (endX - startX) / 2);
        const maxDepth = Math.floor(14 * Math.sqrt(scale));

        // ---- Surface scan (starts below floating islands) ----
        const surfaces = {};
        for (let cx = startX - transitionWidth - 2; cx <= endX + transitionWidth + 2; cx++) {
            if (cx < 0 || cx >= Main.maxTilesX) continue;
            for (let cy = surfaceScanStartY; cy < Main.worldSurface + 60; cy++) {
                if (cy >= Main.maxTilesY) break;
                const tile = Main.tile.get_Item(cx, cy);
                if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                    surfaces[cx] = cy;
                    break;
                }
            }
        }

        // ---- 1) Remove vegetation and liquids ----
        const vegTypes = new Set([
            TileID.Trees, TileID.PalmTree, TileID.Plants, TileID.Plants2,
            TileID.Vines, TileID.Saplings, TileID.Sunflower, TileID.CorruptPlants,
            TileID.JunglePlants, TileID.JunglePlants2, TileID.VineFlowers, TileID.LongMoss,
            TileID.DyePlants, TileID.AshPlants, TileID.Cactus, TileID.Pots,
            TileID.SmallPiles, TileID.LargePiles, TileID.LargePiles2,
            TileID.Stalactite, TileID.Cattail, TileID.Seaweed, TileID.Coral,
            TileID.BeachPiles, TileID.OasisPlants,
            TileID.DesertFossil, TileID.FossilOre
        ]);

        for (let cx = startX - transitionWidth; cx <= endX + transitionWidth; cx++) {
            const surfY = surfaces[cx];
            if (!surfY) continue;
            for (let cy = Math.max(0, surfY - 60); cy < surfY + maxDepth + 2; cy++) {
                if (cy >= Main.maxTilesY) break;
                const tile = Main.tile.get_Item(cx, cy);
                tile.liquid = 0;
                if (tile['bool active()']() && vegTypes.has(tile.type)) {
                    tile['void active(bool active)'](false);
                }
            }
        }

        // ---- 2) Convert blocks + gradient transition ----
        for (let cx = startX - transitionWidth; cx <= endX + transitionWidth; cx++) {
            const surfY = surfaces[cx];
            if (!surfY) continue;

            let distFromEdge = 0;
            if (cx < startX) distFromEdge = startX - cx;
            else if (cx > endX) distFromEdge = cx - endX;

            const tNorm = distFromEdge / transitionWidth;
            const coreChance = tNorm === 0 ? 1.0 : Math.max(0, 1 - tNorm * tNorm);
            if (coreChance <= 0) continue;

            const distNorm = Math.abs(cx - centerX) / biomeHalfWidth;
            const edgeFade = Math.max(0, 1 - distNorm * distNorm);
            const noise = Math.sin(cx * 0.22) * 2.2 + Math.cos(cx * 0.57) * 1.8 + Math.sin(cx * 0.91) * 0.9;
            const depth = Math.max(2, Math.floor(maxDepth * Math.max(0.2, edgeFade) + noise));

            for (let cy = surfY; cy < surfY + depth; cy++) {
                if (cy >= Main.maxTilesY) break;
                const tile = Main.tile.get_Item(cx, cy);
                if (!tile['bool active()']() || !Main.tileSolid[tile.type]) continue;
                if (Rand.NextFloat() < coreChance) {
                    tile.type = TileID.AncientCopperBrick;
                    tile['void halfBrick(bool halfBrick)'](false);
                    tile['void slope(byte slope)'](0);
                }
            }

            const topTile = Main.tile.get_Item(cx, surfY);
            if (topTile['bool active()']() && Rand.NextFloat() < coreChance) {
                const tt = topTile.type;
                if (tt === TileID.Grass || tt === TileID.CorruptGrass ||
                    tt === TileID.HallowedGrass || tt === TileID.CrimsonGrass ||
                    tt === TileID.Dirt || tt === TileID.Stone ||
                    tt === TileID.Sand || tt === TileID.HardenedSand) {
                    topTile.type = TileID.AncientCopperBrick;
                    topTile['void halfBrick(bool halfBrick)'](false);
                    topTile['void slope(byte slope)'](0);
                }
            }

            if (distFromEdge === 0 && Rand.NextChance(0.8)) {
                Main.tile.get_Item(cx, surfY).wall = WallID.WroughtIronFence;
            }
        }

        // ---- 3) Altar: 5x5 rounded-corner platform embedded in terrain ----
        let altarX = -1;
        let altarSurfY = -1;
        const altarHalfW = 2;
        const altarDepth = 5;
        const altarExclusion = 14;

        const cornerSlopes = new Map([
            ['-2,0', 2],
            ['2,0',  1],
            ['-2,4', 4],
            ['2,4',  3],
        ]);

        for (let attempt = 0; attempt < 120; attempt++) {
            const spread = Math.floor(biomeHalfWidth * 0.25);
            const ax = centerX + Rand.Next(-spread, spread + 1);
            const sy = surfaces[ax];
            if (!sy) continue;
            if (ax - altarHalfW < startX + 10 || ax + altarHalfW > endX - 10) continue;

            let flat = true;
            for (let dx = -altarHalfW; dx <= altarHalfW; dx++) {
                const s = surfaces[ax + dx];
                if (!s || Math.abs(s - sy) > 3) { flat = false; break; }
                const gt = Main.tile.get_Item(ax + dx, sy);
                if (!gt['bool active()']() || !Main.tileSolid[gt.type]) { flat = false; break; }
            }
            if (!flat) continue;

            altarX = ax;
            altarSurfY = sy;
            break;
        }

        if (altarX !== -1) {
            for (let dx = -altarHalfW; dx <= altarHalfW; dx++) {
                for (let dy = 0; dy < altarDepth; dy++) {
                    const tx = altarX + dx;
                    const ty = altarSurfY + dy;
                    if (tx < 0 || tx >= Main.maxTilesX || ty >= Main.maxTilesY) continue;

                    const isCorner = (Math.abs(dx) === altarHalfW && (dy === 0 || dy === altarDepth - 1));
                    if (isCorner) {
                        const tile = Main.tile.get_Item(tx, ty);
                        tile['void active(bool active)'](false);
                        tile.wall = WallID.WroughtIronFence;
                        continue;
                    }

                    const tile = Main.tile.get_Item(tx, ty);
                    tile['void active(bool active)'](true);
                    tile.type = TileID.AccentSlab;
                    tile['void halfBrick(bool halfBrick)'](false);
                    tile.wall = WallID.WroughtIronFence;

                    const slope = cornerSlopes.get(`${dx},${dy}`) ?? 0;
                    tile['void slope(byte slope)'](slope);
                }
            }

            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -4; dy < 0; dy++) {
                    const tx = altarX + dx;
                    const ty = altarSurfY + dy;
                    if (tx < 0 || tx >= Main.maxTilesX || ty < 0) continue;
                    const tile = Main.tile.get_Item(tx, ty);
                    tile['void active(bool active)'](false);
                    tile.liquid = 0;
                }
            }

            for (let dx = -1; dx <= 1; dx++) {
                const gt = Main.tile.get_Item(altarX + dx, altarSurfY);
                gt['void active(bool active)'](true);
                gt.type = TileID.AccentSlab;
                gt['void halfBrick(bool halfBrick)'](false);
                gt['void slope(byte slope)'](0);
            }

            WorldGen['void Place3x3(int x, int y, ushort type, int style)'](
                altarX, altarSurfY - 1, TileID.BoneWelder, 0
            );
        }

        // ---- 4) LihzahrdFurnace far from altar ----
        const minFurnaceDist = Math.floor(biomeHalfWidth * 0.5);
        for (let attempt = 0; attempt < 80; attempt++) {
            const fx = Rand.Next(startX + 6, endX - 6);
            if (altarX !== -1 && Math.abs(fx - altarX) < Math.max(altarExclusion, minFurnaceDist)) continue;

            const sy = surfaces[fx];
            if (!sy) continue;

            let flat = true;
            for (let dx = -1; dx <= 1; dx++) {
                const s = surfaces[fx + dx];
                if (!s || Math.abs(s - sy) > 0) { flat = false; break; }
                const gt = Main.tile.get_Item(fx + dx, sy);
                if (!gt['bool active()']() || !Main.tileSolid[gt.type]) { flat = false; break; }
            }
            if (!flat) continue;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -2; dy < 0; dy++) {
                    const ty = sy + dy;
                    if (ty < 0) continue;
                    Main.tile.get_Item(fx + dx, ty)['void active(bool active)'](false);
                }
            }

            WorldGen['void Place3x2(int x, int y, ushort type, int style)'](
                fx, sy - 1, TileID.LihzahrdFurnace, 0
            );
            break;
        }

        // ---- 5) Tombstones (minimum 8) ----
        const tombstoneTarget = Math.max(8, Math.floor((endX - startX) / 5));
        const placedTombstones = [];

        const tryPlaceTombstone = (relaxed) => {
            for (let attempt = 0; attempt < 100; attempt++) {
                const tx = Rand.Next(startX + 4, endX - 5);
                if (tx + 1 >= Main.maxTilesX) continue;
                if (altarX !== -1 && Math.abs(tx - altarX) < altarExclusion) continue;

                const minDist = relaxed ? 3 : 6;
                let tooClose = false;
                for (const px of placedTombstones) {
                    if (Math.abs(px - tx) < minDist) { tooClose = true; break; }
                }
                if (tooClose) continue;

                const sy0 = surfaces[tx];
                const sy1 = surfaces[tx + 1];
                if (!sy0 || !sy1) continue;
                if (Math.abs(sy0 - sy1) > (relaxed ? 1 : 0)) continue;

                const groundY = Math.max(sy0, sy1);
                if (groundY < 3 || groundY >= Main.maxTilesY) continue;

                let groundOK = true;
                for (let cx = tx; cx <= tx + 1; cx++) {
                    const gt = Main.tile.get_Item(cx, groundY);
                    if (!gt['bool active()']() || !Main.tileSolid[gt.type]) { groundOK = false; break; }
                }
                if (!groundOK) continue;

                let areaFree = true;
                for (let cx = tx; cx <= tx + 1; cx++) {
                    for (let cy = groundY - 2; cy <= groundY - 1; cy++) {
                        if (cy < 0 || Main.tile.get_Item(cx, cy)['bool active()']()) {
                            areaFree = false; break;
                        }
                    }
                    if (!areaFree) break;
                }
                if (!areaFree) continue;

                for (let cx = tx; cx <= tx + 1; cx++) {
                    const gt = Main.tile.get_Item(cx, groundY);
                    gt.type = TileID.AncientCopperBrick;
                    gt['void halfBrick(bool halfBrick)'](false);
                    gt['void slope(byte slope)'](0);
                }

                const style = Rand.Next(0, 6);
                const bfx = style * 36;
                for (let col = 0; col < 2; col++) {
                    for (let row = 0; row < 2; row++) {
                        const t = Main.tile.get_Item(tx + col, groundY - 2 + row);
                        t['void active(bool active)'](true);
                        t.type = TileID.Tombstones;
                        t.frameX = bfx + col * 18;
                        t.frameY = row * 18;
                        t['void halfBrick(bool halfBrick)'](false);
                        t['void slope(byte slope)'](0);
                    }
                }

                placedTombstones.push(tx);
                return true;
            }
            return false;
        };

        for (let i = 0; i < tombstoneTarget; i++) tryPlaceTombstone(false);
        while (placedTombstones.length < 8) {
            if (!tryPlaceTombstone(true)) break;
        }
    }
}