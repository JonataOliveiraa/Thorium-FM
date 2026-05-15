const Main = new NativeClass('Terraria', 'Main');
const Utils = new NativeClass('Terraria', 'Utils');

export class Rand {
    static get Instance() {
        return Main.rand ?? null;
    }

    static Next(a, b) {
        const inst = this.Instance;
        if (!inst) {
            if (a === undefined) return Math.floor(Math.random() * 2147483647);
            if (b === undefined) return Math.floor(Math.random() * a);
            return Math.floor(Math.random() * (b - a)) + a;
        }

        if (a === undefined) return inst['int Next()']();
        if (b === undefined) return inst['int Next(int maxValue)'](a);
        return inst['int Next(int minValue, int maxValue)'](a, b);
    }

    static NextFloat(min = 0, max = 1) {
        const inst = this.Instance;
        if (!inst) return Math.random() * (max - min) + min;
        return Utils['float NextFloat(UnifiedRandom r)'](inst) * (max - min) + min;
    }

    static NextBool(value = 2) {
        const inst = this.Instance;
        if (!inst) return Math.random() < 1 / value;
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