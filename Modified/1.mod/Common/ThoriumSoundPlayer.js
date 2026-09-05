import { AndroidSound, AndroidSoundManager } from "./Snippets/AndroidSound.js";

export class ThoriumSoundPlayer {
    static sounds = new Map();

    static Initialize() {
        ThoriumSoundPlayer.sounds.set('fluteSound', new AndroidSound('Common/Sounds/Flute_Sound.ogg'))
        ThoriumSoundPlayer.sounds.set('panfluteSound', new AndroidSound('Common/Sounds/Panflute_Sound.ogg'))
        ThoriumSoundPlayer.sounds.set('steelDrumSound', new AndroidSound('Common/Sounds/SteelDrum_Sound.ogg'))
        ThoriumSoundPlayer.sounds.set('bongoSound', new AndroidSound('Common/Sounds/Bongo.ogg'))
        ThoriumSoundPlayer.sounds.set('bardHorn', new AndroidSound('Common/Sounds/Bard_Horn.ogg'))
        ThoriumSoundPlayer.sounds.set('nocturneSound', new AndroidSound('Common/Sounds/Nocturne_Sound.ogg'))
        ThoriumSoundPlayer.sounds.set('guzhengSound', new AndroidSound('Common/Sounds/Guzheng.ogg'))
        ThoriumSoundPlayer.sounds.set('pianoSound', new AndroidSound('Common/Sounds/Piano_Sound.ogg'))
        ThoriumSoundPlayer.sounds.set('boomBoxSound', new AndroidSound('Common/Sounds/BoomBox_Sound.ogg'))
    }

    static Play(sound) {
        if(ThoriumSoundPlayer.sounds.has(sound)) {
            AndroidSoundManager.play(ThoriumSoundPlayer.sounds.get(sound))
        }
    }
}