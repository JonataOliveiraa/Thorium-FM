import { Terraria } from '../../TL/ModImports.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Main, WorldGen } = Terraria;
const { TileID, WallID } = Terraria.ID;

export class BloodChamberStructure {
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
    }

    AddDecorations(innerLeft, innerTop, innerRight, innerBottom, centerX) {
        const occupiedFloor = new Set();

        const isFree = (targetX, objWidth, occupiedSet) => {
            for (let i = targetX - objWidth; i <= targetX + objWidth; i++) {
                if (occupiedSet.has(i)) return false;
            }
            return true;
        };

        const getRandomSideX = () => {
            let x;
            let attempts = 0;
            do {
                x = Rand.Next(innerLeft + 3, innerRight - 3);
                attempts++;
            } while (Math.abs(x - centerX) < 12 && attempts < 50);
            return x;
        };

        // 1. TETO: 1 Lustre no centro
        // Y = innerTop (Primeiro bloco de ar abaixo do teto)
        // OBS: Se continuar invisível, troque o '32' por '0' para confirmar se é a textura.
        this.BruteForcePlace(centerX, innerTop, TileID.Chandeliers, 32, 
            (tx, ty, t, s) => {
                WorldGen['void PlaceChand(int x, int y, ushort type, int style)'](tx, ty, t, s);
            }
        );

        // 2. CHÃO: Fogueiras (1 a 3) - Ocupam 3x2
        const numCampfires = Rand.Next(1, 4);
        for (let i = 0; i < numCampfires; i++) {
            for (let attempt = 0; attempt < 10; attempt++) {
                const x = getRandomSideX();
                if (isFree(x, 2, occupiedFloor)) {
                    // Y = innerBottom - 1 (A âncora é no topo do objeto que tem 2 de altura)
                    // Style 1 (Bone Campfire) adicionado!
                    if (this.BruteForcePlace(x, innerBottom - 1, TileID.Campfire, 1, (tx, ty, t, s) => WorldGen.Place3x2(tx, ty, t, s))) {
                        occupiedFloor.add(x - 1).add(x).add(x + 1);
                        break;
                    }
                }
            }
        }

        // 3. CHÃO: Large Piles (1 a 3) - Ocupam 3x2
        const numLarge = Rand.Next(1, 4);
        for (let i = 0; i < numLarge; i++) {
            for (let attempt = 0; attempt < 10; attempt++) {
                const x = getRandomSideX();
                if (isFree(x, 2, occupiedFloor)) {
                    const style = Rand.Next(4, 7);
                    if (this.BruteForcePlace(x, innerBottom - 1, 312, style, (tx, ty, t, s) => WorldGen.Place3x2(tx, ty, t, s))) {
                        occupiedFloor.add(x - 1).add(x).add(x + 1);
                        break;
                    }
                }
            }
        }

        // 4. CHÃO: Potes (4 a 8) - Ocupam 2x2
        const numPots = Rand.Next(4, 9);
        for (let i = 0; i < numPots; i++) {
            for (let attempt = 0; attempt < 10; attempt++) {
                const x = getRandomSideX();
                if (isFree(x, 1, occupiedFloor)) {
                    const style = Rand.Next(10, 13);
                    if (this.BruteForcePlace(x, innerBottom - 1, TileID.Pots, style, (tx, ty, t, s) => WorldGen.Place2x2(tx, ty, t, s))) {
                        occupiedFloor.add(x).add(x + 1);
                        break;
                    }
                }
            }
        }

        // 5. CHÃO: Pilhas de moedas (3 a 10) - Ocupam 1x1
        const coinTypes = [TileID.CopperCoinPile, TileID.SilverCoinPile, TileID.GoldCoinPile];
        const numCoins = Rand.Next(3, 11);
        for (let i = 0; i < numCoins; i++) {
            for (let attempt = 0; attempt < 10; attempt++) {
                const x = getRandomSideX();
                if (isFree(x, 0, occupiedFloor)) {
                    const type = coinTypes[Rand.Next(0, 3)];
                    // Moedas só têm 1 de altura, então o Y é exatamente o innerBottom
                    if (this.BruteForcePlace(x, innerBottom, type, 0, (tx, ty, t, s) => WorldGen.Place1x1(tx, ty, t, s))) {
                        occupiedFloor.add(x);
                        break;
                    }
                }
            }
        }
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