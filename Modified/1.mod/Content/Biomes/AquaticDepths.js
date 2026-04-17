import { Rand } from '../../TL/Modules/Rand.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBiome } from './../../TL/ModBiome.js';
import { SceneEffectPriority } from './../../TL/SceneEffectPriority.js';
import { ModSurfaceBackground, ModUndergroundBackground } from '../../TL/ModBackgrounds.js';
import { ModItem } from '../../TL/ModItem.js';

const { Color } = Modules;

// 1. Classes Nativas declaradas de forma global e segura
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

        const radiusX = Math.floor(250 * scale);
        const radiusY = Math.floor(160 * scale);

        const minSafeX = radiusX + 60;
        const maxSafeX = Main.maxTilesX - radiusX - 60;
        const centerX = Math.max(minSafeX, Math.min(maxSafeX, fendaX));

        const ballCenterY = oceanFloor + radiusY + Math.floor(60 * scale);
        const ballTop = ballCenterY - radiusY;
        const ballBottom = ballCenterY + radiusY;
        const ballLeft = centerX - radiusX;
        const ballRight = centerX + radiusX;

        const biomeWall = WallID.PoopWall;

        const fillChest = (chestIndex) => {
            const storage = InventoryStorage.new();
            storage['void .ctor(int chest)'](chestIndex);
            
            const targetItems = Rand.Next(9, 12); 
            let currentSlot = 0;

            const addItem = (id, stack) => {
                const item = Item.new();
                item['void .ctor()']();
                item['void SetDefaults(int Type, ItemVariant variant)'](id, null);
                item.stack = stack;
                storage.item[currentSlot] = item;
                currentSlot++;
            };

            const rareItems = [ItemID.Acorn, ItemID.Acorn, ItemID.Acorn, ItemID.Acorn, ItemID.Acorn]; 
            addItem(rareItems[Rand.Next(rareItems.length)], 1);

            let commonPool = [
                { id: ModItem.getTypeByName('MarineKelp'), min: 1, max: 3 }, 
                { id: ItemID.StoneBlock, min: 1, max: 1 }, 
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

        for (let x = ballLeft - 20; x <= ballRight + 20; x++) {
            for (let y = ballTop - 20; y <= ballBottom + 20; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;

                const dx = x - centerX;
                const dy = y - ballCenterY;
                const angle = Math.atan2(dy, dx);
                const noise = Math.sin(angle * 6) * 0.12 + Math.sin(angle * 15) * 0.05;

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

        const amountOfHoles = Math.floor(55 * scale); 
        let groundChestsTarget = Rand.Next(1, 3);
        let platformChestsTarget = Rand.Next(5, 8) - groundChestsTarget; 
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
                const platExtra = Rand.Next(1, 4);

                for (let px = chestX - 1 - platExtra; px <= chestX + 2 + platExtra; px++) {
                    const tile = Main.tile.get_Item(px, chestY);
                    tile['void active(bool active)'](true);
                    tile.type = TileID.EasterBlock;
                    tile.wall = biomeWall;
                    tile['void halfBrick(bool halfBrick)'](false);
                    tile['void slope(byte slope)'](0);
                    
                    if (Math.abs(px - chestX) < platExtra) {
                        const tileBelow = Main.tile.get_Item(px, chestY + 1);
                        tileBelow['void active(bool active)'](true);
                        tileBelow.type = TileID.EasterBlock;
                        tileBelow.wall = biomeWall;
                        tileBelow['void slope(byte slope)'](0);
                    }
                }

                let chestIndex = WorldGen['int PlaceChest(int x, int y, ushort type, bool notNearOtherChests, int style)'](chestX, chestY - 1, TileID.Containers2, false, 3);
                if (chestIndex !== -1) {
                    platChestsPlaced++;
                    fillChest(chestIndex);
                }
            }
        }

        let groundChestsPlaced = 0;
        let attempts = 0;
        while (groundChestsPlaced < groundChestsTarget && attempts < 1000) {
            attempts++;
            let gx = Rand.Next(ballLeft + 50, ballRight - 50);
            let gy = ballBottom - 10;
            
            while (gy > ballCenterY && Main.tile.get_Item(gx, gy)['bool active()']()) {
                gy--;
            }
            
            if (Main.tileSolid[Main.tile.get_Item(gx, gy + 1).type] && Main.tileSolid[Main.tile.get_Item(gx + 1, gy + 1).type]) {
                let chestIndex = WorldGen['int PlaceChest(int x, int y, ushort type, bool notNearOtherChests, int style)'](gx, gy, TileID.Containers2, false, 3);
                if (chestIndex !== -1) {
                    groundChestsPlaced++;
                    fillChest(chestIndex);
                }
            }
        }

        let currentX = fendaX;
        const shaftWidth = Math.floor(10 * scale);
        const shaftEnd = ballCenterY - Math.floor(radiusY / 2); 

        for (let y = oceanFloor; y <= shaftEnd; y++) {
            let depthFactor = Math.min(1, (y - oceanFloor) / 80);
            currentX += (Math.sin(y * 0.04) * 2.0 + Math.cos(y * 0.02) * 1.5) * depthFactor;
            
            const shaftLeft = Math.floor(currentX - shaftWidth / 2);
            const shaftRight = Math.floor(currentX + shaftWidth / 2);

            for (let x = shaftLeft - 6; x <= shaftRight + 6; x++) {
                if (x < 0 || x >= Main.maxTilesX) continue;
                const tile = Main.tile.get_Item(x, y);
                
                if (tile['bool active()']()) {
                    tile.type = TileID.EasterBlock;
                    tile['void halfBrick(bool halfBrick)'](false);
                    tile['void slope(byte slope)'](0);
                }
                if (y > oceanFloor + 15) {
                    tile.wall = biomeWall;
                }
            }
            for (let x = shaftLeft; x <= shaftRight; x++) {
                if (x < 0 || x >= Main.maxTilesX) continue;
                const tile = Main.tile.get_Item(x, y);
                tile['void active(bool active)'](false);
            }
        }

        const goldOre = WorldGen.SavedOreTiers.Gold;
        const mossyGoldOre = goldOre === 8 ? TileID.AncientPinkBrick : TileID.ForbiddenBlock;

        const amountOfVeins = Math.floor(50 * scale * scale);
        for (let i = 0; i < amountOfVeins; i++) {
            const x = Rand.Next(ballLeft, ballRight);
            const y = Rand.Next(ballTop, ballBottom);
            if (Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - ballCenterY) / radiusY, 2) <= 1) {
                WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, Rand.NextFloat(6, 12), Rand.Next(8, 15), mossyGoldOre, false, 0, 0, false, true, -1
                );
            }
        }

        const ancientBlueBrick = TileID.AncientBlueBrick;
        const amountOfAstraVeins = Math.floor(60 * scale * scale); 
        for (let i = 0; i < amountOfAstraVeins; i++) {
            const x = Rand.Next(ballLeft, ballRight);
            const y = Rand.Next(ballTop, ballBottom);
            if (Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - ballCenterY) / radiusY, 2) <= 0.9) {
                WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, Rand.NextFloat(4, 8), Rand.Next(5, 10), ancientBlueBrick, false, 0, 0, false, true, -1
                );
            }
        }

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

        for (let x = ballLeft - 50; x <= ballRight + 50; x++) {
            for (let y = oceanFloor; y <= ballBottom + 20; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;

                const dx = x - centerX;
                const dy = y - ballCenterY;
                const dist = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);

                if (dist <= 1.1 || (y <= ballTop && Math.abs(x - currentX) < 100)) {
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
        
        // --- CORREÇÃO DO EIXO Y (Ignora Nuvens/Ilhas Flutuantes) ---
        // Desce um pouco abaixo da altura máxima onde as ilhas flutuantes costumam aparecer
        const safeStartY = Math.floor(Main.worldSurface - 80);

        // Primeiro tenta achar água (o oceano real)
        for (let y = safeStartY; y < Main.worldSurface + 150; y++) {
            const tile = Main.tile.get_Item(x, y);
            if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                const above = Main.tile.get_Item(x, y - 1);
                if (above.liquid > 0) return y;
            }
        }

        // Se o oceano secou ou o Sonar não pegou água na ponta da praia, pega o chão sólido
        for (let y = safeStartY; y < Main.worldSurface + 150; y++) {
            const tile = Main.tile.get_Item(x, y);
            if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                return y;
            }
        }

        return Main.worldSurface - 20;
    }
}