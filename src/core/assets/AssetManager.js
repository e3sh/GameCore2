/**
 * @class AssetManager
 * @description 画像、音声、JSONなどのゲームアセットを非同期でロード・管理する。
 */
export class AssetManager {
    constructor() {
        this.assets = {
            images: new Map(),
            sounds: new Map(),
            data: new Map()
        };
        this.loadQueue = [];
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * @method loadImage
     * @param {string} key ID 
     * @param {string} src パス
     */
    loadImage(key, src) {
        this.totalCount++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.images.set(key, img);
                this.loadedCount++;
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * @method loadJSON
     * @param {string} key ID
     * @param {string} src パス
     */
    async loadJSON(key, src) {
        this.totalCount++;
        try {
            const response = await fetch(src);
            const json = await response.json();
            this.assets.data.set(key, json);
            this.loadedCount++;
            return json;
        } catch (e) {
            console.error(`Failed to load JSON: ${src}`, e);
            throw e;
        }
    }

    /**
     * @method loadAudio
     * @param {string} key ID
     * @param {string} src パス
     * @param {AudioContext} audioCtx Web Audio API Context (デコード用)
     */
    async loadAudio(key, src, audioCtx) {
        this.totalCount++;
        try {
            const response = await fetch(src);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            this.assets.sounds.set(key, audioBuffer);
            this.loadedCount++;
            return audioBuffer;
        } catch (e) {
            console.error(`Failed to load Audio: ${src}`, e);
            throw e;
        }
    }

    getImage(key) {
        return this.assets.images.get(key);
    }

    getSound(key) {
        return this.assets.sounds.get(key);
    }

    getData(key) {
        return this.assets.data.get(key);
    }

    get progress() {
        return this.totalCount === 0 ? 1 : this.loadedCount / this.totalCount;
    }

    isDone() {
        return this.loadedCount === this.totalCount;
    }
}
