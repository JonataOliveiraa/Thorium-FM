import { AndroidSound, AndroidSoundManager } from "./Snippets/AndroidSound.js";

export class ThoriumSoundPlayer {
    static sounds = new Map();

    static Initialize() {
        ThoriumSoundPlayer.sounds.set('fluteSound', new AndroidSound('Common/Sounds/Flute_Sound.ogg'))
    }

    static Play(sound) {
        if(ThoriumSoundPlayer.sounds.has(sound)) {
            AndroidSoundManager.play(ThoriumSoundPlayer.sounds.get(sound))
        }
    }
}