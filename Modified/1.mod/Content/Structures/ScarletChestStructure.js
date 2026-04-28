import { Rand } from '../../TL/Modules/Rand.js';
import { Terraria } from '../../TL/ModImports.js';
import { ModItem } from '../../TL/ModItem.js';

const { Main, ID, WorldGen } = Terraria;
const { TileID, WallID, ItemID } = ID;

// Se você tiver um módulo para itens do mod, descomente e use:
// import { ModItem } from '../../TL/ModItem.js';

export class ScarletChestStructure {
    Generate() {
        const depths = [
            { minY: Main.worldSurface + 300, maxY: Main.worldSurface + 500, count: 3 },
            { minY: Main.worldSurface + 550, maxY: Main.worldSurface + 700, count: 5 }
        ];
        const maxAttempts = 200;
        let placedPositions = [];

        for (let depth of depths) {
            let successCount = 0;
            let attempts = 0;
            while (attempts < maxAttempts && successCount < depth.count) {
                const pos = this.findSuitableLocation(depth.minY, depth.maxY, placedPositions);
                if (pos) {
                    const { x, y } = pos;
                    const centerX = x + 5;
                    const groundY = y + 10;

                    this.destroyAreaWithNoise(centerX, groundY - 5, 6, 6);
                    this.buildPillar(centerX - 1, groundY);
                    this.placeChestOnTop(centerX - 1, groundY);
                    this.addBaseUnderPillar(centerX - 1, groundY);

                    placedPositions.push({ x: centerX, y: groundY });
                    successCount++;
                }
                attempts++;
            }
        }
    }

    findSuitableLocation(minY, maxY, existingPositions) {
        const width = 10;
        const height = 10;
        const minDistBetween = 80;

        for (let attempt = 0; attempt < 100; attempt++) {
            const x = Rand.Next(200, Main.maxTilesX - width - 200);
            const y = Rand.Next(minY, maxY - height);

            const dungeonX = Main.dungeonX;
            const dungeonY = Main.dungeonY;
            if (Math.abs(x - dungeonX) < 400 && Math.abs(y - dungeonY) < 400) continue;

            const tile = Main.tile.get_Item(x, y + height);
            if (tile.type === TileID.BlueDungeonBrick || tile.type === TileID.GreenDungeonBrick || tile.type === TileID.PinkDungeonBrick) continue;

            const wall = Main.tile.get_Item(x, y + height).wall;
            if (wall === WallID.BlueDungeonUnsafe || wall === WallID.GreenDungeonUnsafe || wall === WallID.PinkDungeonUnsafe) continue;

            const centerX = x + 5;
            const centerY = y + 10;
            let tooClose = false;
            for (let p of existingPositions) {
                const dx = Math.abs(p.x - centerX);
                const dy = Math.abs(p.y - centerY);
                if (Math.sqrt(dx * dx + dy * dy) < minDistBetween) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;

            return { x, y };
        }
        return null;
    }

    destroyAreaWithNoise(centerX, centerY, radiusX, radiusY) {
        for (let x = centerX - radiusX - 3; x <= centerX + radiusX + 3; x++) {
            for (let y = centerY - radiusY - 3; y <= centerY + radiusY + 3; y++) {
                if (x < 0 || x >= Main.maxTilesX || y < 0 || y >= Main.maxTilesY) continue;
                const dx = x - centerX;
                const dy = y - centerY;
                const angle = Math.atan2(dy, dx);
                const noise = Math.sin(angle * 4) * 0.2 + Math.cos(angle * 7) * 0.1;
                const dist = (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY);
                if (dist <= 1 + noise) {
                    const tile = Main.tile.get_Item(x, y);
                    tile['void active(bool active)'](false);
                    tile.wall = 0;
                }
            }
        }
    }

    buildPillar(baseX, baseY) {
        const pillarHeight = 5;
        const pillarWidth = 2;

        for (let h = 0; h < pillarHeight; h++) {
            for (let w = 0; w < pillarWidth; w++) {
                const tx = baseX + w;
                const ty = baseY - h;
                const tile = Main.tile.get_Item(tx, ty);
                tile['void active(bool active)'](true);
                tile.type = TileID.AncientMythrilBrick;
                tile.wall = WallID.Dirt;
                tile['void halfBrick(bool halfBrick)'](false);
                tile['void slope(byte slope)'](0);
            }
        }

        const topY = baseY - pillarHeight;
        for (let w = 0; w < pillarWidth; w++) {
            const tile = Main.tile.get_Item(baseX + w, topY);
            tile['void active(bool active)'](true);
            tile.type = TileID.AncientMythrilBrick;
            tile.wall = WallID.Dirt;
        }

        const leftTile = Main.tile.get_Item(baseX - 1, topY);
        leftTile['void active(bool active)'](true);
        leftTile.type = TileID.AncientMythrilBrick;
        leftTile.wall = WallID.Dirt;

        const rightTile = Main.tile.get_Item(baseX + pillarWidth, topY);
        rightTile['void active(bool active)'](true);
        rightTile.type = TileID.AncientMythrilBrick;
        rightTile.wall = WallID.Dirt;
    }

    placeChestOnTop(baseX, baseY) {
        const pillarHeight = 5;
        const topY = baseY - pillarHeight;
        const chestX = baseX;
        const chestY = topY - 1;

        for (let cx = chestX; cx <= chestX + 1; cx++) {
            for (let cy = chestY - 1; cy <= chestY; cy++) {
                const tile = Main.tile.get_Item(cx, cy);
                tile['void active(bool active)'](false);
                tile.liquid = 0;
            }
        }

        let chestIndex = WorldGen['int PlaceChest(int x, int y, ushort type, bool notNearOtherChests, int style)'](
            chestX, chestY, TileID.Containers2, false, 9
        );

        if (chestIndex !== -1) {
            this.fillChest(chestIndex);
        }
    }

    fillChest(chestIndex) {
        const storage = new NativeClass('Terraria', 'InventoryStorage').new();
        storage['void .ctor(int chest)'](chestIndex);

        let currentSlot = 0;

        const addItem = (id, stack) => {
            if (typeof id !== 'number' || id <= 0 || isNaN(id)) {
                throw new Error(`[ScarletChest] ID inválido ignorado: ${id}`);
            }
            const item = new NativeClass('Terraria', 'Item').new();
            item['void .ctor()']();
            item['void SetDefaults(int Type, ItemVariant variant)'](id, null);
            item.stack = stack;
            storage.item[currentSlot] = item;
            currentSlot++;
        };

        const rareCandidates = [
            ModItem.getTypeByName('MagmaCharmItem'),
            ModItem.getTypeByName('LootRang'),
            ModItem.getTypeByName('MagmaLocket'),
            ModItem.getTypeByName('SpringSteps'),
            ModItem.getTypeByName('DeepStaff'),
            Terraria.ID.ItemID.LavaCharm
        ].filter(id => typeof id === 'number' && id > 0);

        const rareId = rareCandidates.length ? rareCandidates[Rand.NextInt(0, rareCandidates.length)] : Terraria.ID.ItemID.IronBar;
        addItem(rareId, 1);

        const ringCandidates = [
            ModItem.getTypeByName('AmberRing'),
            ModItem.getTypeByName('AmethystRing'),
            ModItem.getTypeByName('DiamondRing'),
            ModItem.getTypeByName('EmeraldRing'),
            ModItem.getTypeByName('RubyRing'),
            ModItem.getTypeByName('SapphireRing'),
            ModItem.getTypeByName('TheRing')
        ].filter(id => typeof id === 'number' && id > 0);

        const ringId = ringCandidates.length ? ringCandidates[Rand.NextInt(0, ringCandidates.length)] : Terraria.ID.ItemID.IronBar;
        addItem(ringId, 1);

        if (Rand.NextChance(0.2)) {
            addItem(ItemID.SuspiciousLookingEye, 1);
        }

        if (Rand.NextChance(0.33)) {
            const dynamiteCount = Rand.NextInt(1, 4);
            addItem(ItemID.Dynamite, dynamiteCount);
        }

        if (Rand.NextChance(0.5)) {
            const thoriumBarID = ModItem.getTypeByName('ThoriumBar');
            if (thoriumBarID && typeof thoriumBarID === 'number' && thoriumBarID > 0) {
                const barCount = Rand.NextInt(3, 7);
                addItem(thoriumBarID, barCount);
            }
        }

        const commonPool = [
            { id: ItemID.GoldCoin, min: 2, max: 4 },
            { id: ItemID.SpelunkerGlowstick, min: 15, max: 34 },
            { id: ItemID.Torch, min: 5, max: 10 },
            { id: ItemID.HealingPotion, min: 1, max: 2 },
            { id: ItemID.WrathPotion, min: 1, max: 2 },
            { id: ItemID.RagePotion, min: 1, max: 2 },
            { id: ItemID.InfernoPotion, min: 1, max: 2 },
            { id: ItemID.TeleportationPotion, min: 1, max: 2 },
            { id: ItemID.EndurancePotion, min: 1, max: 2 },
            { id: ItemID.SpelunkerPotion, min: 1, max: 2 },
            { id: ItemID.LifeforcePotion, min: 1, max: 2 },
            { id: ItemID.RecallPotion, min: 1, max: 2 },
            { id: ItemID.Bomb, min: 3, max: 9 },
        ];

        const shuffled = [...commonPool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Rand.NextFloat(0, 1) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const commonCount = 5;
        for (let i = 0; i < commonCount && i < shuffled.length; i++) {
            const item = shuffled[i];
            const stack = Rand.NextInt(item.min, item.max + 1);
            addItem(item.id, stack);
        }

        addItem(ItemID.SilverCoin, Rand.NextInt(50, 91));

        storage.SyncToChest();
    }

    addBaseUnderPillar(baseX, baseY) {
        const baseWidth = 4;
        const baseHeight = 2;
        const startX = baseX - 1;
        const startY = baseY;

        for (let dx = 0; dx < baseWidth; dx++) {
            for (let dy = 0; dy < baseHeight; dy++) {
                const tx = startX + dx;
                const ty = startY + dy;
                if (tx < 0 || tx >= Main.maxTilesX || ty < 0 || ty >= Main.maxTilesY) continue;
                const tile = Main.tile.get_Item(tx, ty);
                tile['void active(bool active)'](true);
                tile.type = TileID.AncientMythrilBrick;
                tile.wall = WallID.Dirt;
                tile['void halfBrick(bool halfBrick)'](false);
                tile['void slope(byte slope)'](0);
            }
        }
    }
}