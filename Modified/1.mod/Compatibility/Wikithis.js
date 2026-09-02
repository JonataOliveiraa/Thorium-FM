import { ItemLoader } from "../TL/Loaders/ItemLoader.js";
import { ModSystem } from "../TL/ModSystem.js";

export class Wikithis extends ModSystem {
    constructor() {
        super();
    }

    SetupContent() {
        // You need to provide the base URL of the wiki
        this.AddWikithisCompatibility('https://thoriummod.wiki.gg/wiki/');
    }

    AddWikithisCompatibility(baseUrl) {
        // import ItemLoader
        const File = new NativeClass('System.IO', 'File');
        const FileExists = File['bool Exists(string path)'];
        const path = tl.mod.path.split('/tl_files/')[0] + '/tl_files/.temp/Wikithis.json';
        if (!FileExists(path)) return;

        const ReadAllBytes = File['byte[] ReadAllBytes(string path)'];
        const WriteAllBytes = File['void WriteAllBytes(string path, byte[] bytes)'];
        const Encoding = new NativeClass('System.Text', 'Encoding');
        const StringToBytes = Encoding.UTF8['byte[] GetBytes(string s)'];
        const BytesToString = Encoding.UTF8['string GetString(byte[] bytes)'];

        let data = JSON.parse(BytesToString(ReadAllBytes(path)));
        const items = {};
        const ItemNames = JSON.parse(tl.file.read('Localization/en-US.json').replace(/^\s*\/\/.*$/gm, '')).ItemName;
        for (const item of ItemLoader.Items) {
            items[item.Type] = ItemNames[item.constructor.name] ?? '';
        }
        data[tl.mod.name] = { baseUrl, items };
        WriteAllBytes(path, StringToBytes(JSON.stringify(data)));
    }

}