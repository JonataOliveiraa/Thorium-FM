import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { Rand } from "../../../TL/Modules/Rand.js";

const { Main, WorldGen } = Terraria;

export class OreInjection extends GlobalHooks {
    Initialize() {
        WorldGen['void NotTheBees()'].hook((original, self) => {
            const worldArea = Main.maxTilesX * Main.maxTilesY;

            //Thorium
            const thoriumOre = Terraria.ID.TileID.TeamBlockBlue;
            const amountOfVeinsThoriumOre = Math.floor(worldArea * 0.00005); 

            for (let i = 0; i < amountOfVeinsThoriumOre; i++) {
                const x = Rand.Next(100, Main.maxTilesX - 100);
                const y = Rand.Next(Math.floor(Main.worldSurface), Main.maxTilesY - 200);
                const strength = Rand.NextFloat(5, 10); 
                const steps = Rand.Next(5, 12);

                WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, strength, steps, thoriumOre, false, 0, 0, false, true, -1
                );
            }

            //LifeQuartz
            const lifeQuartz = Terraria.ID.TileID.TeamBlockRed;
            const amountOfVeinsLifeQuartz = Math.floor(worldArea * 0.00003); 

            for (let i = 0; i < amountOfVeinsLifeQuartz; i++) {
                const x = Rand.Next(100, Main.maxTilesX - 100);
                const y = Rand.Next(Math.floor(Main.worldSurface), Main.maxTilesY - 200);
                const strength = Rand.NextFloat(3, 8); 
                const steps = Rand.Next(10, 15);

                WorldGen['void TileRunner(int i, int j, double strength, int steps, int type, bool addTile, double speedX, double speedY, bool noYChange, bool overRide, int ignoreTileType)'](
                    x, y, strength, steps, lifeQuartz, false, 0, 0, false, true, -1
                );
            }   
            
            return original(self);
        });
    }
}