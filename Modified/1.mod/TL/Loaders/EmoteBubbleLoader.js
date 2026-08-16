import { Terraria } from './../ModImports.js';
import { ModTexture } from './../ModTexture.js';

function cloneResizedSetLastItem(array, newSize, value) {
    const resized = array.cloneResized(newSize);
    if (value != null) resized[newSize - 1] = value;
    return resized;
}

function resizeArrayProperty(propertyHolder, propertyName, newSize, value) {
    propertyHolder[propertyName] = cloneResizedSetLastItem(propertyHolder[propertyName], newSize, value);
}

export class EmoteBubbleLoader {
    static EmoteBubbles = [];
    static ModTypes = new Set();
    static Count = 0;
    static MAX_VANILLA_ID = Terraria.GameContent.UI.EmoteID.Count;
    static EmoteCount = EmoteBubbleLoader.MAX_VANILLA_ID;
    
    static IEmoteCommand = null;
    static OriginalEmoteTexture = null;
    
    static register(emoteBubble) {
        this.EmoteBubbles.push(emoteBubble);
    }
    
    static isModEmote(name) {
        return this.getByName(name) !== null;
    }
    
    static isModType(type) {
        return this.ModTypes.has(type);
    }
    
    static getModEmote(type) {
        return this.EmoteBubbles.find(e => e.Type === type);
    }
    
    static getByName(name) {
        return this.EmoteBubbles.find(e => e.constructor.name === name);
    }
    
    static LoadEmotes() {
        for (const emoteBubble of this.EmoteBubbles) {
            this.Load(emoteBubble);
        }
        if (this.IEmoteCommand !== null) this.IEmoteCommand.Initialize();
    }
    
    static Load(emoteBubble) {
        this.Count++;
        const next = Terraria.Lang._emojiNameCache.length + 1;
        emoteBubble.Type = Terraria.Lang._emojiNameCache.length;
        this.ModTypes.add(emoteBubble.Type);
        
        resizeArrayProperty(Terraria.Lang, '_emojiNameCache', next, Terraria.Localization.LocalizedText.Empty);
        
        const texturePath = 'Textures/' + emoteBubble.Texture;
        const texture = new ModTexture(texturePath);
        if (texture.exists) {
            emoteBubble._texture = texture.asset.asset;
        } else {
            throw new Error(`[Emote Registry Error] ${emoteBubble.constructor.name}: texture "${texturePath}" not found`);
        }
        
        let name = emoteBubble.constructor.name;
        let originalName = name, i = 1;
        while (Terraria.GameContent.UI.EmoteID.Search.ContainsName(name)) name = originalName + i++;
        Terraria.GameContent.UI.EmoteID.Search.Add(name, emoteBubble.Type);
    }
    
    static SetupContent() {
        this.EmoteCount = Terraria.Lang._emojiNameCache.length;
        this.LoadEmotes();
        for (const emoteBubble of this.EmoteBubbles) {
            emoteBubble.SetupContent();
        }
    }
    
    static PostSetupContent() {
        this.EmoteCount = Terraria.Lang._emojiNameCache.length;
        for (const emoteBubble of this.EmoteBubbles) {
            emoteBubble.PostSetupContent();
        }
    }
    
    static AddToCategory(categoryId, list) {
        for (const emoteBubble of this.EmoteBubbles) {
            if (emoteBubble.IsUnlocked()) {
                emoteBubble.AddToCategory(categoryId, list);
            }
        }
    }
    
    static PreDraw(emoteBubble, spriteBatch, texture, position, emoteFrame, origin, effect) {
        const emote = emoteBubble.emote;
        if (this.isModType(emote)) {
            return this.getModEmote(emote)?.PreDraw(emoteBubble, spriteBatch, texture, position, emoteFrame, origin, effect) ?? true;
        }
        return true;
    }
    
    static PostDraw(emoteBubble, spriteBatch, texture, position, emoteFrame, origin, effect) {
        const emote = emoteBubble.emote;
        if (this.isModType(emote)) {
            this.getModEmote(emote).PostDraw(emoteBubble, spriteBatch, texture, position, emoteFrame, origin, effect);
        }
    }
}