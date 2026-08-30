import { Terraria } from '../../../TL/ModImports.js';

export class BestiaryOrder {
    static Find(list, type) {
        const count = list.Count;
        for (let i = 0; i < count; i++) {
            if (list.get_Item(i) === type) return i;
        }
        return -1;
    }

    static Place(type, anchor, offset) {
        const list = Terraria.ID.NPCID.Sets.BossBestiaryPriority;

        const current = BestiaryOrder.Find(list, type);
        if (current >= 0) list.RemoveAt(current);

        const index = BestiaryOrder.Find(list, anchor);
        if (index < 0) {
            list.Add(type);
            return;
        }

        list.Insert(index + offset, type);
    }

    static BossAfter(type, anchor) {
        BestiaryOrder.Place(type, anchor, 1);
    }

    static BossBefore(type, anchor) {
        BestiaryOrder.Place(type, anchor, 0);
    }
}
