import { ModAchievement } from '../TL/ModAchievement.js';

const List = [

]

export function RegisterAchievements() {
    for (const Achievement of List) {
        ModAchievement.register(Achievement)
    }
}