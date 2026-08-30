export class SpawnHelper {
    static NoBiome(info) {
        if (info.UndergroundCorruption || info.UndergroundCrimson || info.UndergroundHallow) return false;
        if (info.Ice || info.UndergroundJungle || info.Mushroom) return false;
        if (info.DesertCave || info.Marble || info.Granite || info.SpiderCave) return false;
        if (info.Dungeon || info.Lihzahrd || info.Meteor) return false;
        return true;
    }
}
