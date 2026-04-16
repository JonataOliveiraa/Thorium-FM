import { GlobalHooks } from "../../../TL/GlobalHooks.js";

export class ChangeShimmerPos extends GlobalHooks {
    Initialize() {
        const GenVars = new NativeClass('Terraria.WorldBuilding', 'GenVars');
        const Vector2D = new NativeClass('ReLogic.Utilities', 'Vector2D');
        const Main = new NativeClass('Terraria', 'Main');

        function setShimmerPos(x, y) {
            let pos = Vector2D.new();
            pos['void .ctor(double x, double y)'](x, y);
            GenVars.shimmerPosition = pos;
            return pos;
        }

        new NativeClass('Terraria', 'WorldGen')['bool ShimmerMakeBiome(int X, int Y)'].hook((original, x, y) => {
            let targetX = x; 
            let targetY = Math.floor((Main.rockLayer + (Main.maxTilesY - 200)) / 2);

            setShimmerPos(targetX, targetY);

            return original(targetX, targetY);
        });

        new NativeClass('Terraria', 'WorldGen')['void Shimmerator(int x, int y, bool jungle, bool lavaOk)'].hook((original, x, y, jungle, lavaOk) => {
            let targetX = x;
            let targetY = Math.floor((Main.rockLayer + (Main.maxTilesY - 200)) / 2);

            setShimmerPos(targetX, targetY);
            original(targetX, targetY, jungle, lavaOk);
        });
    }
}