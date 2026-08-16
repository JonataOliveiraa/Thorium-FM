import { EmoteBubbleLoader } from './Loaders/EmoteBubbleLoader.js';

export class ModEmoteBubble {
    Type = -1;
    Texture = '';
    
    constructor() {}
    
    SetupContent() {
        
    }
    
    PostSetupContent() {
        
    }
    
    IsUnlocked() {
        return true;
    }
    
    // categoryId: see 'TL/Enums/EmoteBubbleCategory.js'
    AddToCategory(categoryId, list) {
        
    }
    
    OnSpawn(emoteBubble) {
        
    }
    
    GetFrame(emoteBubble, frame) {
        return frame;
    }
    
    PreDraw(emoteBubble, spriteBatch, texture, position, emoteFrame, origin, spriteEffects) {
        return true;
    }
    
    PostDraw(emoteBubble, spriteBatch, texture, position, emoteFrame, origin, spriteEffects) {
        
    }
    
    static isModEmote(name) {
        return EmoteBubbleLoader.isModEmote(name);
    }
    static getModEmote(type) {
        return EmoteBubbleLoader.getModEmote(type);
    }
    static getByName(name) {
        return EmoteBubbleLoader.getByName(name);
    }
    static getTypeByName(name) {
        return EmoteBubbleLoader.getByName(name)?.Type ?? -1;
    }
    static register(emoteBubble) {
        EmoteBubbleLoader.register(new emoteBubble());
    }
}