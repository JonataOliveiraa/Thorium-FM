import { Terraria } from '../../TL/ModImports.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { WorldDB } from '../../TL/WorldDB.js';

const { Main, WorldGen } = Terraria;
const { TileID, WallID } = Terraria.ID;

let dbX;
let dbY;
export class BloodChamberStructure {
    static PendingPosition = null;

    Generate() {
        const width = 90;       
        const height = 30;
        const thickness = 3;

        if (Main.maxTilesX === 0 || Main.maxTilesY === 0) return;

        const spawnX = Main.spawnTileX;
        const minX = Math.max(100, spawnX - 300);
        const maxX = Math.min(Main.maxTilesX - width - 100, spawnX + 300);
        if (minX >= maxX) return;

        const minY = Main.maxTilesY - 550;
        const maxY = Main.maxTilesY - 250;

        let placed = false;
        for (let attempt = 0; attempt < 50; attempt++) {
            const left = Rand.Next(minX, maxX - width);
            const top = Rand.Next(minY, maxY - height);
            if (left < 0 || top < 0 || left + width >= Main.maxTilesX || top + height >= Main.maxTilesY) continue;
            this.BuildChamber(left, top, width, height, thickness);
            placed = true;
            break;
        }

        if (!placed) {
            const left = Math.max(200, spawnX - 80);
            const top = Main.maxTilesY - 450;
            if (left + width < Main.maxTilesX && top + height < Main.maxTilesY) {
                this.BuildChamber(left, top, width, height, thickness);
            }
        }

        tl.log(`ActiveWorldFileData.Path: ${Terraria.Main.ActiveWorldFileData?.Path}`);
        BloodChamberStructure.PendingPosition = { X: dbX, Y: dbY };
    }

    ClearArea(left, top, width, height) {
        for (let x = left; x < left + width; x++) {
            for (let y = top; y < top + height; y++) {
                const tile = Main.tile.get_Item(x, y);
                tile['void active(bool active)'](false);
                tile.wall = 0;
                tile.liquid = 0;
                tile['void liquidType(int liquidType)'](0);
            }
        }
    }

    BuildChamber(left, top, width, height, thickness) {
        this.ClearArea(left, top, width, height);

        const innerLeft = left + thickness;
        const innerRight = left + width - thickness - 1;
        const innerTop = top + thickness;
        const innerBottom = top + height - thickness - 1;

        for (let x = left; x < left + width; x++) {
            for (let y = top; y < top + height; y++) {
                const isBorder = x < innerLeft || x > innerRight || y < innerTop || y > innerBottom;
                if (isBorder) {
                    this.SetTile(x, y, TileID.StoneSlab);
                } else {
                    this.SetWallOnly(x, y, WallID.StoneSlab);
                }
            }
        }

        const cornerSize = 7; 
        for (let dx = 0; dx < cornerSize; dx++) {
            for (let dy = 0; dy < cornerSize; dy++) {
                if (dx + dy < cornerSize) {
                    const isEdge = (dx + dy === cornerSize - 1);
                    
                    if (isEdge) this.SetSlopedTile(innerLeft + dx, innerTop + dy, 3);
                    else this.SetTile(innerLeft + dx, innerTop + dy, TileID.StoneSlab);
                    
                    if (isEdge) this.SetSlopedTile(innerRight - dx, innerTop + dy, 4);
                    else this.SetTile(innerRight - dx, innerTop + dy, TileID.StoneSlab);
                }
            }
        }

        const platformWidth = 5;
        const centerX = left + Math.floor(width / 2);
        const platformLeft = centerX - Math.floor(platformWidth / 2);
        const platformY = innerBottom; 

        for (let i = 0; i < platformWidth; i++) {
            const x = platformLeft + i;
            this.SetTile(x, platformY, TileID.StoneSlab);
        }

        const dispenserX = centerX - 1;
        const dispenserY = platformY - 3; 

        for (let dx = 0; dx < 3; dx++) {
            for (let dy = 0; dy < 3; dy++) {
                const tx = dispenserX + dx;
                const ty = dispenserY + dy;
                if (tx >= 0 && tx < Main.maxTilesX && ty >= 0 && ty < Main.maxTilesY) {
                    const tile = Main.tile.get_Item(tx, ty);
                    tile['void active(bool active)'](true);
                    tile.type = TileID.HoneyDispenser;
                    tile.frameX = dx * 18;
                    tile.frameY = dy * 18;
                    tile.wall = WallID.StoneSlab; 
                    tile['void halfBrick(bool halfBrick)'](false);
                    tile['void slope(byte slope)'](0);
                }
            }
        }

        const entranceHeight = 5;
        const entranceYStart = innerBottom - entranceHeight + 1;
        
        for (let y = entranceYStart; y <= innerBottom; y++) {
            for (let x = left; x < innerLeft; x++) {
                const tx = x;
                const ty = y;
                if (tx >= 0 && tx < Main.maxTilesX && ty >= 0 && ty < Main.maxTilesY) {
                    const tile = Main.tile.get_Item(tx, ty);
                    tile['void active(bool active)'](false);
                    tile.wall = 0;
                }
            }
        }
        
        for (let y = entranceYStart; y <= innerBottom; y++) {
            for (let x = innerRight + 1; x < left + width; x++) {
                const tx = x;
                const ty = y;
                if (tx >= 0 && tx < Main.maxTilesX && ty >= 0 && ty < Main.maxTilesY) {
                    const tile = Main.tile.get_Item(tx, ty);
                    tile['void active(bool active)'](false);
                    tile.wall = 0;
                }
            }
        }

        this.AddDecorations(innerLeft, innerTop, innerRight, innerBottom, centerX);

        dbX = dispenserX
        dbY = dispenserY
    }

    AddDecorations(innerLeft, innerTop, innerRight, innerBottom, centerX) {
        const occupiedFloor = new Set();
        
        // Reserva o centro do chão para a plataforma e o dispenser
        for (let i = centerX - 5; i <= centerX + 5; i++) {
            occupiedFloor.add(i);
        }

        const isFloorFree = (targetX, objWidth) => {
            for (let i = targetX; i < targetX + objWidth; i++) {
                if (occupiedFloor.has(i)) return false;
            }
            return true;
        };

        const getRandomSideX = (objWidth) => {
            let x;
            let attempts = 0;
            do {
                x = Rand.Next(innerLeft + 3, innerRight - 3 - objWidth);
                attempts++;
            } while (!isFloorFree(x, objWidth) && attempts < 50);
            return attempts < 50 ? x : -1;
        };

        // --- LUSTRE (teto) ---
        this.BruteForcePlace(centerX - 1, innerTop, TileID.Chandeliers, 32, 
            (tx, ty, t, s) => {
                WorldGen['void PlaceChand(int x, int y, ushort type, int style)'](tx, ty, t, s);
            }
        );

        // --- FOGUEIRAS (3x2) - Y corrigido para innerBottom ---
        const numCampfires = Rand.Next(1, 3);
        for (let i = 0; i < numCampfires; i++) {
            const x = getRandomSideX(3);
            if (x !== -1) {
                if (this.BruteForcePlace(x, innerBottom, TileID.Campfire, 2, (tx, ty, t, s) => {
                    WorldGen['void Place3x2(int x, int y, ushort type, int style)'](tx, ty, t, s);
                })) {
                    for (let w = 0; w < 3; w++) occupiedFloor.add(x + w);
                }
            }
        }

        // --- LARGE PILES (3x2) - Y corrigido para innerBottom ---
        const numLarge = Rand.Next(1, 3);
        const largeStyles = [18, 19, 20, 21];
        for (let i = 0; i < numLarge; i++) {
            const x = getRandomSideX(3);
            if (x !== -1) {
                const style = largeStyles[Rand.Next(0, largeStyles.length)];
                if (this.BruteForcePlace(x, innerBottom, TileID.LargePiles, style, (tx, ty, t, s) => {
                    WorldGen['void Place3x2(int x, int y, ushort type, int style)'](tx, ty, t, s);
                })) {
                    for (let w = 0; w < 3; w++) occupiedFloor.add(x + w);
                }
            }
        }

        // --- SMALL PILES (2x1) - Y = innerBottom (já correto) ---
        const numSmall = Rand.Next(2, 4);
        const smallStyles = [16, 17, 18];
        for (let i = 0; i < numSmall; i++) {
            const x = getRandomSideX(2);
            if (x !== -1) {
                const style = smallStyles[Rand.Next(0, smallStyles.length)];
                if (this.BruteForcePlace(x, innerBottom, TileID.SmallPiles, style, (tx, ty, t, s) => {
                    WorldGen['void Place2x1(int x, int y, ushort type, int style)'](tx, ty, t, s);
                })) {
                    for (let w = 0; w < 2; w++) occupiedFloor.add(x + w);
                }
            }
        }

        // --- QUADROS (3x3) na parede (sem alterações) ---
        const occupiedWalls = [];
        const isWallFree = (wx, wy, w, h) => {
            if (wx < centerX + 2 && wx + w > centerX - 2 && wy < innerTop + 4 && wy + h > innerTop) return false;
            if (wx < centerX + 3 && wx + w > centerX - 3 && wy + h > innerBottom - 4) return false;
            for (const box of occupiedWalls) {
                if (wx < box.x + box.w && wx + w > box.x && wy < box.y + box.h && wy + h > box.y) return false;
            }
            return true;
        };

        const placePaintings = (stylesArray, amount) => {
            for (let i = 0; i < amount; i++) {
                for (let attempt = 0; attempt < 50; attempt++) {
                    const x = Rand.Next(centerX - 15, centerX + 12);
                    const y = Rand.Next(innerTop + 3, innerBottom - 5);
                    if (isWallFree(x, y, 3, 3)) {
                        const style = stylesArray[Rand.Next(0, stylesArray.length)];
                        if (this.BruteForcePlace(x, y, TileID.Painting3X3, style, (tx, ty, t, s) => {
                            WorldGen['void Place3x3(int x, int y, ushort type, int style)'](tx, ty, t, s);
                        })) {
                            occupiedWalls.push({ x: x, y: y, w: 3, h: 3 });
                            break;
                        }
                    }
                }
            }
        };

        placePaintings([16, 17], Rand.Next(1, 3));
        placePaintings([42, 43, 44, 45], 1);
    }

    BruteForcePlace(startX, startY, type, style, placeFunc) {
        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            const tryX = startX + offsetX;
            const tryY = startY; // Não mexe na altura mais!

            placeFunc(tryX, tryY, type, style);

            if (this.CheckIfTileExists(tryX, tryY, type, 2)) {
                return true;
            }
        }
        return false; 
    }

    SetTile(x, y, type) {
        const tile = Main.tile.get_Item(x, y);
        tile['void active(bool active)'](true);
        tile.type = type;
        tile['void halfBrick(bool halfBrick)'](false);
        tile['void slope(byte slope)'](0);
    }

    SetWallOnly(x, y, wallType) {
        const tile = Main.tile.get_Item(x, y);
        tile.wall = wallType;
    }

    SetSlopedTile(x, y, slopeType) {
        const tile = Main.tile.get_Item(x, y);
        tile['void active(bool active)'](true);
        tile.type = TileID.StoneSlab;
        tile['void slope(byte slope)'](slopeType);
        tile['void halfBrick(bool halfBrick)'](false);
    }

    CheckIfTileExists(x, y, type, radius) {
        for (let i = x - radius; i <= x + radius; i++) {
            for (let j = y - radius; j <= y + radius; j++) {
                if (i >= 0 && i < Main.maxTilesX && j >= 0 && j < Main.maxTilesY) {
                    const tile = Main.tile.get_Item(i, j);
                    
                    // AQUI ESTAVA O SEU ERRO FATAL: tile.active() quebrava a ponte JS/C# silenciosamente.
                    // Agora está estritamente usando o getter ['bool active()']().
                    if (tile && tile['bool active()']() && tile.type === type) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}