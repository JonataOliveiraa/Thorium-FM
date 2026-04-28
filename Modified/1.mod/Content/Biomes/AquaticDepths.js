import { Rand } from '../../TL/Modules/Rand.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBiome } from './../../TL/ModBiome.js';
import { SceneEffectPriority } from './../../TL/SceneEffectPriority.js';
import { ModSurfaceBackground, ModUndergroundBackground } from '../../TL/ModBackgrounds.js';
import { ModItem } from '../../TL/ModItem.js';

const { Color, MathHelper } = Modules;

const Item = new NativeClass('Terraria', 'Item');
const InventoryStorage = new NativeClass('Terraria', 'InventoryStorage');

export class AquaticDepths extends ModBiome {
    Music = 43;
    
    constructor() {
        super();
    }

    SetStaticDefaults() {
        this.Priority = SceneEffectPriority.BiomeHigh;
        this.BiomeColor = Color.new(29, 17, 87);

        this.SurfaceBackground = ModSurfaceBackground.getByName('AquaticDepthsSurface_BG');
        this.UndergroundBackground = ModUndergroundBackground.getByName('AquaticDepthsUG_BG');

        this.SpawnRateMultiplier = 1.5; 
    }

    IsBiomeActive(player, tileCounts) {
        if (tileCounts[Terraria.ID.TileID.EasterBlock] >= 150) {
            return true;
        }
        return false;
    }

    OnInBiome(player) {
        Terraria.NPC.spawnRate *= this.SpawnRateMultiplier;
        Terraria.NPC.maxSpawns *= this.SpawnRateMultiplier;
    }

    ModifySpawnPool(spawnInfo, pool) {
        if (spawnInfo.CommonEnemy) {
            pool[0] = 0;
        }
    }

    Generate() {
        const { Main, ID, WorldGen } = Terraria;
        const { TileID, WallID, ItemID } = ID;

        const scale = Main.maxTilesX / 4200;

        const dungeonOnRight = Main.dungeonX > Main.maxTilesX / 2;
        const edgeStart = dungeonOnRight ? 40 : Main.maxTilesX - 40;
        const stepX = dungeonOnRight ? 8 : -8;
        const checks = 15;

        let validPoints = [];

        for (let i = 0; i < checks; i++) {
            let x = edgeStart + (i * stepX);
            for (let y = 60; y < Main.worldSurface; y++) {
                const tile = Main.tile.get_Item(x, y);
                if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                    const above = Main.tile.get_Item(x, y - 1);
                    if (above.liquid > 0) {
                        validPoints.push({ x: x, y: y });
                    }
                    break;
                }
            }
        }

        if (validPoints.length === 0) {
            validPoints.push({ x: edgeStart + (8 * stepX), y: Math.floor(Main.worldSurface - 20) });
        }

        let bestPoint = validPoints[validPoints.length - 1];
        for (let i = validPoints.length - 1; i >= 1; i--) {
            if (Math.abs(validPoints[i].y - validPoints[i-1].y) <= 4) {
                bestPoint = validPoints[i];
                break;
            }
        }

        const fendaX = bestPoint.x;
        const oceanFloor = bestPoint.y;

        const radiusX = Math.floor(200 * scale);
        const radiusY = Math.floor(180 * scale);

        const minSafeX = radiusX + 60;
        const maxSafeX = Main.maxTilesX - radiusX - 60;
        const centerX = Math.max(minSafeX, Math.min(maxSafeX, fendaX));

        const ballCenterY = Math.min(oceanFloor + radiusY + Math.floor(15 * scale), Main.maxTilesY - radiusY - 40);
        const ballTop = ballCenterY - radiusY;
        const ballBottom = ballCenterY + radiusY;
        const ballLeft = centerX - radiusX;
        const ballRight = centerX + radiusX;

        const biomeWall = WallID.CorruptSandstone;

        const fillChest = (chestIndex) => {
            const storage = InventoryStorage.new();
            storage['void .ctor(int chest)'](chestIndex);
            
            const targetItems = Rand.Next(7, 10); 
            let currentSlot = 0;

            const addItem = (id, stack) => {
                const item = Item.new();
                item['void .ctor()']();
                item['void SetDefaults(int Type, ItemVariant variant)'](id, null);
                item.stack = stack;
                storage.item[currentSlot] = item;
                currentSlot++;
            };

            const rareItems = [ModItem.getTypeByName('BubbleConch'), ModItem.getTypeByName('SeaTurtlesBulwark'), ModItem.getTypeByName('RainStone')]; 
            addItem(rareItems[Rand.Next(rareItems.length)], 1);

            let commonPool = [
                { id: ModItem.getTypeByName('MarineKelp'), min: 1, max: 3 }, 
                { id: Rand.NextChance(0.5) ? ItemID.IronBar : ItemID.LeadBar, min: 5, max: 13 },
                { id: Rand.NextChance(0.5) ? ItemID.SilverBar : ItemID.TungstenBar, min: 5, max: 13 },
                { id: ItemID.Rope, min: 15, max: 34 },
                { id: ItemID.Glowstick, min: 15, max: 34 },
                { id: ItemID.NightOwlPotion, min: 1, max: 2 },
                { id: ItemID.ShinePotion, min: 1, max: 2 },
                { id: ItemID.HunterPotion, min: 1, max: 2 },
                { id: ItemID.SpelunkerPotion, min: 1, max: 2 },
                { id: ItemID.BottledWater, min: 2, max: 5 },
                { id: ItemID.HealingPotion, min: 2, max: 5 },
                { id: ItemID.ManaPotion, min: 2, max: 5 },
                { id: ItemID.RecallPotion, min: 1, max: 2 },
                { id: ItemID.BombFish, min: 3, max: 9 },
                { id: ItemID.EndurancePotion, min: 1, max: 2 },
                { id: ItemID.FishingPotion, min: 1, max: 2 },
                { id: ItemID.CratePotion, min: 1, max: 2 },
                { id: ItemID.FlipperPotion, min: 1, max: 2 },
                { id: ItemID.GillsPotion, min: 1, max: 2 },
                { id: ItemID.WaterWalkingPotion, min: 1, max: 2 },
                { id: ItemID.SonarPotion, min: 1, max: 2 }
            ];

            commonPool = commonPool.sort(() => Rand.NextFloat(0, 1) - 0.5);

            const commonSlotsNeeded = targetItems - 2; 
            for (let i = 0; i < commonSlotsNeeded; i++) {
                addItem(commonPool[i].id, Rand.Next(commonPool[i].min, commonPool[i].max + 1));
            }

            addItem(ItemID.SilverCoin, Rand.Next(50, 91));
            storage.SyncToChest();
        };

        // Main biome ellipse (smoother, rounder)
        for (let x = ballLeft - 20; x <= ballRight + 20; x++) {
            for (let y = ballTop - 20; y <= ballBottom + 20; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                const dx = x - centerX;
                const dy = y - ballCenterY;
                const noise = Math.sin(Math.atan2(dy, dx) * 5) * 0.08;
                const dist = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);
                if (dist <= 1 + noise) {
                    const tile = Main.tile.get_Item(x, y);
                    tile['void active(bool active)'](true);
                    tile.type = TileID.EasterBlock;
                    tile.wall = biomeWall;
                    tile['void halfBrick(bool halfBrick)'](false);
                    tile['void slope(byte slope)'](0);
                }
            }
        }

        // Edge blend: convert natural blocks near the biome border with a gradient
        for (let x = ballLeft - 35; x <= ballRight + 35; x++) {
            for (let y = Math.max(ballTop - 35, oceanFloor); y <= ballBottom + 35; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                const tile = Main.tile.get_Item(x, y);
                if (!tile['bool active()']()) continue;
                if (tile.type !== TileID.Dirt && tile.type !== TileID.Sand && tile.type !== TileID.Stone &&
                    tile.type !== TileID.HardenedSand && tile.type !== TileID.Ebonstone && tile.type !== TileID.Crimstone) continue;
                
                const dx = x - centerX;
                const dy = y - ballCenterY;
                const dist = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);
                if (dist <= 1.0) continue;
                
                const blendStart = 1.0;
                const blendEnd = 1.25;
                if (dist > blendEnd) continue;
                
                const t = (dist - blendStart) / (blendEnd - blendStart);
                const chance = MathHelper.Lerp(0.4, 0.0, t);
                if (Rand.NextFloat() < chance) {
                    tile.type = TileID.EasterBlock;
                    tile.wall = biomeWall;
                }
            }
        }

        const amountOfHoles = Math.floor(55 * scale);
        let platformChestsTarget = Rand.Next(8, 11);
        let platChestsPlaced = 0;

        for (let i = 0; i < amountOfHoles; i++) {
            let hx, hy;
            do {
                hx = Rand.Next(ballLeft, ballRight);
                hy = Rand.Next(ballTop, ballBottom);
            } while (Math.pow((hx - centerX) / radiusX, 2) + Math.pow((hy - ballCenterY) / radiusY, 2) > 0.6);

            const holeRadiusX = Rand.Next(15, 30) * Math.sqrt(scale);
            const holeRadiusY = Rand.Next(10, 22) * Math.sqrt(scale);
            
            const freq1 = Rand.Next(4, 9);
            const freq2 = Rand.Next(8, 16);
            const amp1 = Rand.NextFloat(0.1, 0.3);
            const amp2 = Rand.NextFloat(0.05, 0.15);

            for (let x = Math.floor(hx - holeRadiusX - 15); x <= Math.floor(hx + holeRadiusX + 15); x++) {
                for (let y = Math.floor(hy - holeRadiusY - 15); y <= Math.floor(hy + holeRadiusY + 15); y++) {
                    if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                    
                    const dx = x - hx;
                    const dy = y - hy;
                    const angle = Math.atan2(dy, dx);
                    
                    const holeNoise = Math.sin(angle * freq1) * amp1 + Math.cos(angle * freq2) * amp2;
                    const dist = Math.pow(dx / holeRadiusX, 2) + Math.pow(dy / holeRadiusY, 2);
                    const distFromBiomeCenter = Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - ballCenterY) / radiusY, 2);
                    
                    if (dist <= 1 + holeNoise && distFromBiomeCenter < 0.90) {
                        const tile = Main.tile.get_Item(x, y);
                        tile['void active(bool active)'](false);
                        tile.wall = biomeWall;
                    }
                }
            }

            const forceChest = (amountOfHoles - i) <= (platformChestsTarget - platChestsPlaced);

            if (platChestsPlaced < platformChestsTarget && (forceChest || Rand.NextChance(0.30))) {
                const chestX = Math.floor(hx);
                const chestY = Math.floor(hy);

                for (let px = chestX - 1; px <= chestX + 2; px++) {
                    const tile = Main.tile.get_Item(px, chestY);
                    tile['void active(bool active)'](true);
                    tile.type = TileID.EasterBlock;
                    tile.wall = biomeWall;
                    tile['void halfBrick(bool halfBrick)'](false);
                    tile['void slope(byte slope)'](0);
                    
                    const tileBelow = Main.tile.get_Item(px, chestY + 1);
                    tileBelow['void active(bool active)'](true);
                    tileBelow.type = TileID.EasterBlock;
                    tileBelow.wall = biomeWall;
                    tileBelow['void slope(byte slope)'](0);
                }

                for (let cx = chestX; cx <= chestX + 1; cx++) {
                    for (let cy = chestY - 2; cy <= chestY - 1; cy++) {
                        const clearTile = Main.tile.get_Item(cx, cy);
                        clearTile['void active(bool active)'](false);
                        clearTile.liquid = 0;
                    }
                }

                let chestIndex = WorldGen['int PlaceChest(int x, int y, ushort type, bool notNearOtherChests, int style)'](chestX, chestY - 1, TileID.Containers2, false, 3);
                if (chestIndex !== -1) {
                    platChestsPlaced++;
                    fillChest(chestIndex);
                }
            }
        }

        // --- ENTRANCE SHAFT AND MAIN CAVITY ---
        // Find a proper entry point deep inside the biome
        let entryY = -1;
        for (let y = ballTop; y < ballBottom; y++) {
            const tile = Main.tile.get_Item(fendaX, y);
            const dx = fendaX - centerX;
            const dy = y - ballCenterY;
            const dist = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);
            if (tile['bool active()']() && tile.type == TileID.EasterBlock && dist < 0.9) {
                entryY = y;
                break;
            }
        }
        if (entryY == -1) entryY = ballCenterY;

        let cavityCenterY = entryY + 20;
        if (cavityCenterY > Main.maxTilesY - 40) cavityCenterY = Main.maxTilesY - 40;

        const cavityRadX = Math.floor(30 * scale);
        const cavityRadY = Math.floor(34 * scale);
        const borderThickness = 8;

        // Generate the cavity: thick solid border + irregular hollow interior
        for (let x = fendaX - cavityRadX - borderThickness - 5; x <= fendaX + cavityRadX + borderThickness + 5; x++) {
            for (let y = cavityCenterY - cavityRadY - borderThickness - 5; y <= cavityCenterY + cavityRadY + borderThickness + 5; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                const dx = x - fendaX;
                const dy = y - cavityCenterY;
                const angle = Math.atan2(dy, dx);
                const edgeNoise = Math.sin(angle * 4) * 0.2 + Math.cos(angle * 7) * 0.15 + Math.sin(angle * 13) * 0.1;
                let dist = Math.pow(dx / cavityRadX, 2) + Math.pow(dy / cavityRadY, 2);
                const radialNoise = 0.1 * Math.sin(angle * 8) + 0.06 * Math.cos(angle * 18);
                dist += radialNoise;
                if (dist <= 1 + edgeNoise) {
                    const tile = Main.tile.get_Item(x, y);
                    const isBorder = (dist > (1 - borderThickness / Math.max(cavityRadX, cavityRadY)));
                    if (isBorder) {
                        tile['void active(bool active)'](true);
                        tile.type = TileID.EasterBlock;
                        tile.wall = biomeWall;
                        tile['void halfBrick(bool halfBrick)'](false);
                        tile['void slope(byte slope)'](0);
                    } else {
                        // Hollow interior with randomness: keep some blocks for imperfection
                        if (Rand.NextFloat() < 0.15) {
                            tile['void active(bool active)'](true);
                            tile.type = TileID.EasterBlock;
                            tile.wall = biomeWall;
                            tile['void slope(byte slope)'](0);
                        } else {
                            tile['void active(bool active)'](false);
                            tile.wall = biomeWall;
                        }
                    }
                }
            }
        }

        // Dig the shaft from slightly above ocean floor down to the cavity
        const shaftStartY = oceanFloor - 3;
        const tunnelEndY = cavityCenterY;
        const totalShaftHeight = tunnelEndY - shaftStartY;
        const maxWidth = 12 * scale;
        const minWidth = 6 * scale;
        const shellThickness = 5;

        for (let y = shaftStartY; y <= tunnelEndY; y++) {
            if (y < 0 || y >= Main.maxTilesY) continue;
            const progress = Math.min(1, (y - shaftStartY) / totalShaftHeight);
            const currentWidth = Math.floor(maxWidth - (maxWidth - minWidth) * progress);
            const microNoise = Math.sin(y * 0.3) * 0.8 + Math.cos(y * 0.7) * 0.5;
            const shaftLeft = Math.floor(fendaX - currentWidth / 2 + microNoise);
            const shaftRight = Math.floor(fendaX + currentWidth / 2 + microNoise);

            const distToBiomeCenter = Math.pow((fendaX - centerX) / radiusX, 2) + Math.pow((y - ballCenterY) / radiusY, 2);
            const isInsideBiome = (distToBiomeCenter < 1.0);
            let easterRatio = 0;
            if (isInsideBiome) {
                easterRatio = 0.85;
            } else if (y >= cavityCenterY - 15) {
                const nearProgress = (y - (cavityCenterY - 15)) / 15;
                easterRatio = Math.min(0.85, nearProgress * 0.85);
            }

            for (let x = shaftLeft - shellThickness; x <= shaftRight + shellThickness; x++) {
                if (x < 0 || x >= Main.maxTilesX) continue;
                const tile = Main.tile.get_Item(x, y);
                if (!tile['bool active()']() || !Main.tileSolid[tile.type] || tile.type == TileID.Sand) {
                    tile['void active(bool active)'](true);
                    tile.type = (easterRatio > 0 && Rand.NextFloat() < easterRatio) ? TileID.EasterBlock : TileID.HardenedSand;
                }
                tile['void halfBrick(bool halfBrick)'](false);
                tile['void slope(byte slope)'](0);
                if (y > shaftStartY + 10) tile.wall = biomeWall;
            }

            for (let x = shaftLeft; x <= shaftRight; x++) {
                if (x < 0 || x >= Main.maxTilesX) continue;
                const tile = Main.tile.get_Item(x, y);
                tile['void active(bool active)'](false);
                if (y > shaftStartY + 10) tile.wall = biomeWall;
            }
        }

        // Force clear connection area between shaft and cavity
        for (let x = fendaX - 6; x <= fendaX + 6; x++) {
            for (let y = cavityCenterY - 8; y <= cavityCenterY + 8; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                const dx = x - fendaX;
                const dy = y - cavityCenterY;
                const distToCavity = Math.pow(dx / cavityRadX, 2) + Math.pow(dy / cavityRadY, 2);
                if (distToCavity > 0.9) continue;
                const tile = Main.tile.get_Item(x, y);
                if (tile['bool active()']()) {
                    tile['void active(bool active)'](false);
                    tile.wall = biomeWall;
                }
            }
        }

        // Place a chest in the middle of the cavity
        let chestX = fendaX;
        let chestY = cavityCenterY;
        for (let cx = chestX; cx <= chestX + 1; cx++) {
            for (let cy = chestY - 1; cy <= chestY; cy++) {
                const tile = Main.tile.get_Item(cx, cy);
                tile['void active(bool active)'](false);
                tile.liquid = 0;
            }
        }
        // Ensure solid blocks below chest
        for (let cx = chestX - 1; cx <= chestX + 2; cx++) {
            const tileBelow = Main.tile.get_Item(cx, chestY + 1);
            if (!tileBelow['bool active()']()) {
                tileBelow['void active(bool active)'](true);
                tileBelow.type = TileID.EasterBlock;
                tileBelow.wall = biomeWall;
            }
        }

        let chestIndex = WorldGen['int PlaceChest(int x, int y, ushort type, bool notNearOtherChests, int style)'](chestX, chestY, TileID.Containers2, false, 3);
        if (chestIndex !== -1) {
            fillChest(chestIndex);
        } else {
            for (let attempt = 0; attempt < 10; attempt++) {
                const altX = fendaX + Rand.Next(-8, 9);
                const altY = cavityCenterY + Rand.Next(-5, 6);
                for (let cx = altX; cx <= altX + 1; cx++) {
                    for (let cy = altY - 1; cy <= altY; cy++) {
                        const tile = Main.tile.get_Item(cx, cy);
                        tile['void active(bool active)'](false);
                        tile.liquid = 0;
                    }
                }
                chestIndex = WorldGen['int PlaceChest(int x, int y, ushort type, bool notNearOtherChests, int style)'](altX, altY, TileID.Containers2, false, 3);
                if (chestIndex !== -1) {
                    fillChest(chestIndex);
                    break;
                }
            }
        }

        // Ores – equal amounts of both types
        const goldOre = WorldGen.SavedOreTiers.Gold;
        const mossyGoldOre = goldOre === 8 ? TileID.AncientPinkBrick : TileID.ForbiddenBlock;
        const ancientBlueBrick = TileID.AncientBlueBrick;
        const oreVeinCount = Math.floor(60 * scale * scale);

        for (let i = 0; i < oreVeinCount; i++) {
            const x = Rand.Next(ballLeft, ballRight);
            const y = Rand.Next(ballTop, ballBottom);
            if (Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - ballCenterY) / radiusY, 2) <= 1) {
                WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, Rand.NextFloat(6, 12), Rand.Next(8, 15), mossyGoldOre, false, 0, 0, false, true, -1
                );
            }
        }

        for (let i = 0; i < oreVeinCount; i++) {
            const x = Rand.Next(ballLeft, ballRight);
            const y = Rand.Next(ballTop, ballBottom);
            if (Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - ballCenterY) / radiusY, 2) <= 0.9) {
                WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, Rand.NextFloat(4, 8), Rand.Next(5, 10), ancientBlueBrick, false, 0, 0, false, true, -1
                );
            }
        }

        // Stalactites, boulders
        const boulderStyles = [20, 27, 30];
        for (let x = ballLeft - 50; x <= ballRight + 50; x++) {
            for (let y = ballTop - 50; y <= ballBottom + 50; y++) {
                if (x < 1 || x >= Main.maxTilesX - 3 || y < 1 || y >= Main.maxTilesY - 3) continue;
                const tile = Main.tile.get_Item(x, y);
                if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                    const tUpTile = Main.tile.get_Item(x, y - 1);
                    const tDownTile = Main.tile.get_Item(x, y + 1);
                    const tLeftTile = Main.tile.get_Item(x - 1, y);
                    const tRightTile = Main.tile.get_Item(x + 1, y);
                    const tUp = tUpTile['bool active()']() && Main.tileSolid[tUpTile.type];
                    const tDown = tDownTile['bool active()']() && Main.tileSolid[tDownTile.type];
                    const tLeft = tLeftTile['bool active()']() && Main.tileSolid[tLeftTile.type];
                    const tRight = tRightTile['bool active()']() && Main.tileSolid[tRightTile.type];
                    if (tUp && tLeft && !tRight && !tDown) tile['void slope(byte slope)'](3);
                    else if (tUp && tRight && !tLeft && !tDown) tile['void slope(byte slope)'](4);
                    else if (tDown && tLeft && !tRight && !tUp) tile['void slope(byte slope)'](1);
                    else if (tDown && tRight && !tLeft && !tUp) tile['void slope(byte slope)'](2);
                    const tileBelow1 = Main.tile.get_Item(x, y + 1);
                    const tileBelow2 = Main.tile.get_Item(x, y + 2);
                    if (!tileBelow1['bool active()']() && !tileBelow2['bool active()']()) {
                        if (Rand.NextChance(0.12)) {
                            const style = Rand.NextChance(0.5) ? 33 : 34;
                            tileBelow1['void active(bool active)'](true);
                            tileBelow1.type = TileID.Stalactite1x2Echo;
                            tileBelow1.frameX = style * 18;
                            tileBelow1.frameY = 0;
                            tileBelow2['void active(bool active)'](true);
                            tileBelow2.type = TileID.Stalactite1x2Echo;
                            tileBelow2.frameX = style * 18;
                            tileBelow2.frameY = 18;
                        }
                    }
                    if (Rand.NextChance(0.03)) {
                        let canPlaceBoulder = true;
                        for (let bx = 0; bx < 3; bx++) {
                            const floorTile = Main.tile.get_Item(x + bx, y);
                            const air1 = Main.tile.get_Item(x + bx, y - 1);
                            const air2 = Main.tile.get_Item(x + bx, y - 2);
                            if (!floorTile['bool active()']() || !Main.tileSolid[floorTile.type]) canPlaceBoulder = false;
                            if (air1['bool active()']() || air2['bool active()']()) canPlaceBoulder = false;
                        }
                        if (canPlaceBoulder) {
                            const bStyle = boulderStyles[Rand.Next(boulderStyles.length)];
                            const startX = bStyle * 54;
                            for (let bx = 0; bx < 3; bx++) {
                                const topT = Main.tile.get_Item(x + bx, y - 2);
                                topT['void active(bool active)'](true);
                                topT.type = TileID.Tables2;
                                topT.frameX = startX + (bx * 18);
                                topT.frameY = 0;
                                const botT = Main.tile.get_Item(x + bx, y - 1);
                                botT['void active(bool active)'](true);
                                botT.type = TileID.Tables2;
                                botT.frameX = startX + (bx * 18);
                                botT.frameY = 18;
                            }
                        }
                    }
                }
            }
        }

        // Fill water inside the biome and shaft area
        for (let x = ballLeft - 50; x <= ballRight + 50; x++) {
            for (let y = oceanFloor; y <= ballBottom + 20; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                const dx = x - centerX;
                const dy = y - ballCenterY;
                const dist = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);
                if (dist <= 1.1 || (y <= ballTop && Math.abs(x - fendaX) < 100)) {
                    const tile = Main.tile.get_Item(x, y);
                    if (!tile['bool active()']() || tile.type === TileID.Stalactite1x2Echo || tile.type === TileID.Tables2) {
                        tile.liquid = 255;
                        tile['void liquidType(int liquidType)'](0);
                    }
                }
            }
        }
    }

    GetOceanFloor(x) {
        const { Main } = Terraria;
        const safeStartY = Math.floor(Main.worldSurface - 80);
        for (let y = safeStartY; y < Main.worldSurface + 150; y++) {
            const tile = Main.tile.get_Item(x, y);
            if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                const above = Main.tile.get_Item(x, y - 1);
                if (above.liquid > 0) return y;
            }
        }
        for (let y = safeStartY; y < Main.worldSurface + 150; y++) {
            const tile = Main.tile.get_Item(x, y);
            if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                return y;
            }
        }
        return Main.worldSurface - 20;
    }
}