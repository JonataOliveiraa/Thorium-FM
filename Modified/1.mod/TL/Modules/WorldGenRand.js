const Main = new NativeClass('Terraria', 'Main');
const WorldGen = new NativeClass('Terraria', 'WorldGen');
const Utils = new NativeClass('Terraria', 'Utils');

export class WorldGenRand {
    static get Instance() { return WorldGen.isGeneratingOrLoadingWorld ? WorldGen.genRand : Main.rand; }
    
    static Next(a, b) {
        if (a === undefined) {
            return this.Instance['int Next()']();
        }
        if (b === undefined) {
            return this.Instance['int Next(int maxValue)'](a);
        }
        return this.Instance['int Next(int minValue, int maxValue)'](a, b);
    }
    
    static NextInt(min = 0, max = 1) {
        return this.Next(Math.floor(min), Math.floor(max));
    }
    
    static NextFloat(min = 0, max = 1) {
        return Utils['float NextFloat(UnifiedRandom r)'](this.Instance) * (max - min) + min;
    }
    
    static NextBool(value = 2) {
        return this.Next(value) === 0;
    }
    
    static NextChance(value = 0.5) {
        return this.NextFloat() < value;
    }
    
    static NextVector2Square(rx, ry) {
        return Utils['Vector2 NextVector2Square(UnifiedRandom r, float min, float max)'](this.Instance, rx, ry);
    }
    
    static NextVector2FromRectangle(rect) {
        return Utils['Vector2 NextVector2FromRectangle(UnifiedRandom r, Rectangle rect)'](this.Instance, rect);
    }
    
    static NextVector2Circular(rx, ry) {
        return Utils['Vector2 NextVector2Circular(UnifiedRandom r, float circleHalfWidth, float circleHalfHeight)'](this.Instance, rx, ry);
    }
    
    static NextVector2Unit(start = 0, range = 6.28318548) {
        return Utils['Vector2 NextVector2Unit(UnifiedRandom r, float startRotation, float rotationRange)'](this.Instance, start, range);
    }
    
    static NextSign() {
        return this.NextBool() ? 1 : -1;
    }
    
    static NextFromList(arr) {
        return arr[this.Next(arr.length)];
    }
    
    // [[value1, weight], [value2, weight], ...];
    static NextFromListWeighted(arr) {
        let total = 0;
        for (let i = 0; i < arr.length; i++) total += arr[i][1];
        let r = this.NextFloat() * total;
        for (let i = 0; i < arr.length; i++) {
            if ((r -= arr[i][1]) <= 0) return arr[i][0];
        }
    }
}