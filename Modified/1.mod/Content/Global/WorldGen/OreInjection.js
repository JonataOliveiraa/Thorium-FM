import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { WorldDB } from "../../../TL/WorldDB.js";

const { Main, WorldGen } = Terraria;

export class OreInjection extends GlobalHooks {
    Initialize() {
        WorldGen['void NotTheBees()'].hook((original, self) => {
            const customOreID = Terraria.ID.TileID.TeamBlockRed;
            const worldArea = Main.maxTilesX * Main.maxTilesY;
            const amountOfVeins = Math.floor(worldArea * 0.00003); 

            for (let i = 0; i < amountOfVeins; i++) {
                const x = Rand.Next(100, Main.maxTilesX - 100);
                const y = Rand.Next(Math.floor(Main.worldSurface), Main.maxTilesY - 200);
                const strength = Rand.NextFloat(5, 10); 
                const steps = Rand.Next(5, 12);

                WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, strength, steps, customOreID, false, 0, 0, false, true, -1
                );
            }   
            
            return original(self);
        });
    }
}