import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { Rand } from "../../../TL/Modules/Rand.js";

const { Main, WorldGen } = Terraria;

export class OreInjection extends GlobalHooks {
    Initialize() {
        WorldGen['void NotTheBees()'].hook((original, self) => {
            const worldArea = Main.maxTilesX * Main.maxTilesY;

            const D = {
                surface: Math.floor(Main.worldSurface),
                rock: Math.floor(Main.rockLayer),
                deep: Math.floor(Main.maxTilesY * 0.78),
                preHell: Math.floor(Main.maxTilesY * 0.88),
                safeBottom: Math.floor(Main.maxTilesY * 0.93),
            };

            const ores = [
                {
                    name: "PreThorium",
                    tile: Terraria.ID.TileID.TeamBlockBlue,
                    amount: worldArea * 0.000085,
                    depth: { min: D.surface, max: D.safeBottom },
                    strength: { min: 5, max: 10 },
                    steps: { min: 5, max: 12 },
                },
                {
                    name: "Thorium",
                    tile: Terraria.ID.TileID.TeamBlockBlue,
                    amount: worldArea * 0.000055,
                    depth: { min: D.preHell, max: D.safeBottom },
                    strength: { min: 7, max: 10 },
                    steps: { min: 7, max: 12 },
                },
                {
                    name: "LifeQuartz",
                    tile: Terraria.ID.TileID.TeamBlockRed,
                    amount: worldArea * 0.00010,
                    depth: { min: D.rock, max: D.safeBottom },
                    strength: { min: 4, max: 6 },
                    steps: { min: 6, max: 10 },
                },
                {
                    name: "PreOpal (Underground)",
                    tile: Terraria.ID.TileID.AncientGoldBrick,
                    amount: worldArea * 0.000020,
                    depth: { min: D.surface, max: D.rock },
                    strength: { min: 2, max: 4 },
                    steps: { min: 3, max: 5 },
                },
                {
                    name: "PreOpal (Scattered)",
                    tile: Terraria.ID.TileID.AncientGoldBrick,
                    amount: worldArea * 0.000018,
                    depth: { min: D.surface, max: D.safeBottom },
                    strength: { min: 1, max: 3 },
                    steps: { min: 3, max: 5 },
                },
                {
                    name: "Opal",
                    tile: Terraria.ID.TileID.AncientGoldBrick,
                    amount: worldArea * 0.000012,
                    depth: { min: D.preHell, max: D.safeBottom },
                    strength: { min: 2, max: 4 },
                    steps: { min: 4, max: 6 },
                },
                {
                    name: "SmoothCoal",
                    tile: Terraria.ID.TileID.ReefBlock,
                    amount: worldArea * 0.0000125,
                    depth: { min: D.surface, max: D.safeBottom },
                    strength: { min: 5, max: 8 },
                    steps: { min: 5, max: 10 },
                }
            ];

            for (const ore of ores) {
                const count = Math.floor(ore.amount);

                for (let i = 0; i < count; i++) {
                    const x = Rand.Next(100, Main.maxTilesX - 100);
                    const y = Rand.Next(ore.depth.min, ore.depth.max);
                    const strength = Rand.NextFloat(ore.strength.min, ore.strength.max);
                    const steps = Rand.Next(ore.steps.min, ore.steps.max);

                    WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                        x, y, strength, steps, ore.tile, false, 0, 0, false, true, -1
                    );
                }
            }

            return original(self);
        });
    }
}