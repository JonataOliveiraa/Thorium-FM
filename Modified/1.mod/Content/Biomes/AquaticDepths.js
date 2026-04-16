import { Rand } from '../../TL/Modules/Rand.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBiome } from './../../TL/ModBiome.js';
import { SceneEffectPriority } from './../../TL/SceneEffectPriority.js';
import { ModSurfaceBackground, ModUndergroundBackground } from '../../TL/ModBackgrounds.js';

const { Color } = Modules;

export class AquaticDepths extends ModBiome {
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
        if (tileCounts[Terraria.ID.TileID.EasterBlock] >= 150 && player.wet) {
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

    GetSplashDust(dustType) {
        return Terraria.ID.DustID.Water; 
    }

    Generate() {
        const { Main, ID } = Terraria;
        const { TileID, WallID } = ID;

        const scale = Main.maxTilesX / 4200;

        const dungeonOnRight = Main.dungeonX > Main.maxTilesX / 2;
        let startX, endX;
        if (dungeonOnRight) {
            startX = 40;
            endX = startX + Math.floor(400 * scale);
        } else {
            endX = Main.maxTilesX - 40;
            startX = endX - Math.floor(400 * scale);
        }

        const centerX = Math.floor((startX + endX) / 2);
        const oceanFloor = this.GetOceanFloor(centerX);
        if (oceanFloor <= 0) return;

        const radiusX = Math.floor(250 * scale);
        const radiusY = Math.floor(160 * scale);
        const ballCenterY = oceanFloor + radiusY + Math.floor(60 * scale);

        const ballTop = ballCenterY - radiusY;
        const ballBottom = ballCenterY + radiusY;
        const ballLeft = centerX - radiusX;
        const ballRight = centerX + radiusX;

        const ebonWall = WallID.EasterBlockWall;

        // 1. ESTRUTURA PRINCIPAL (Corpo e Paredes)
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
                    tile.wall = ebonWall;
                }
            }
        }

        // 2. QUEIJO SUÍÇO (Com Ruído Extremo e Paredes)
        const amountOfHoles = Math.floor(45 * scale * scale);
        for (let i = 0; i < amountOfHoles; i++) {
            let hx, hy;
            do {
                hx = Rand.Next(ballLeft, ballRight);
                hy = Rand.Next(ballTop, ballBottom);
            } while (Math.pow((hx - centerX) / radiusX, 2) + Math.pow((hy - ballCenterY) / radiusY, 2) > 0.8);

            const holeRadiusX = Rand.Next(15, 40) * scale;
            const holeRadiusY = Rand.Next(10, 25) * scale;
            
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
                    
                    if (dist <= 1 + holeNoise) {
                        const tile = Main.tile.get_Item(x, y);
                        tile['void active(bool active)'](false);
                        tile.wall = ebonWall;
                    }
                }
            }
        }

        // 3. TÚNEL SINUOSO E PETRIFICAÇÃO DA AREIA
        let currentX = centerX;
        const shaftWidth = Math.floor(10 * scale);
        const shaftEnd = ballTop + 15; // Para logo após furar a casca do bioma

        for (let y = oceanFloor; y <= shaftEnd; y++) {
            // Curvas estranhas baseadas em senos e cossenos
            currentX += Math.sin(y * 0.08) * 2.0 + Math.cos(y * 0.04) * 1.5 + Math.sin(y * 0.15) * 0.8;
            
            const shaftLeft = Math.floor(currentX - shaftWidth / 2);
            const shaftRight = Math.floor(currentX + shaftWidth / 2);

            // Primeiro: Petrificamos uma área MAIOR ao redor do buraco para segurar a areia
            for (let x = shaftLeft - 6; x <= shaftRight + 6; x++) {
                if (x < 0 || x >= Main.maxTilesX) continue;
                const tile = Main.tile.get_Item(x, y);
                
                // Transforma a areia (ou qualquer bloco existente) em Pedra
                if (tile['bool active()']()) {
                    tile.type = TileID.EasterBlock;
                }

                // As paredes só começam a gerar 15 blocos abaixo do fundo do oceano
                if (y > oceanFloor + 15) {
                    tile.wall = ebonWall;
                }
            }

            // Segundo: Escavamos o meio exato do túnel para dar passagem
            for (let x = shaftLeft; x <= shaftRight; x++) {
                if (x < 0 || x >= Main.maxTilesX) continue;
                const tile = Main.tile.get_Item(x, y);
                tile['void active(bool active)'](false);
            }
        }

        // 4. INJEÇÃO DE MINÉRIOS
        const copperOre = TileID.Copper;
        //Quantia
        const amountOfVeins = Math.floor(150 * scale * scale);
        for (let i = 0; i < amountOfVeins; i++) {
            const x = Rand.Next(ballLeft, ballRight);
            const y = Rand.Next(ballTop, ballBottom);
            
            if (Math.pow((x - centerX) / radiusX, 2) + Math.pow((y - ballCenterY) / radiusY, 2) <= 1) {
                const strength = Rand.NextFloat(6, 12); 
                const steps = Rand.Next(8, 15);

                Terraria.WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, strength, steps, copperOre, false, 0, 0, false, true, -1
                );
            }
        }

        // 5. INUNDAÇÃO MASSIVA
        for (let x = ballLeft - 50; x <= ballRight + 50; x++) {
            for (let y = oceanFloor; y <= ballBottom + 20; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;

                const dx = x - centerX;
                const dy = y - ballCenterY;
                const dist = Math.pow(dx / radiusX, 2) + Math.pow(dy / radiusY, 2);

                if (dist <= 1.1 || (y <= ballTop && Math.abs(x - currentX) < 100)) {
                    const tile = Main.tile.get_Item(x, y);
                    if (!tile['bool active()']()) {
                        tile.liquid = 255;
                        tile['void liquidType(int liquidType)'](0);
                    }
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