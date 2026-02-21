/**
 * 画像、音声、JSONなどのゲームアセットを非同期でロード・管理・キャッシュするクラス。
 * @class AssetManager
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
     * 画像アセットを非同期で読み込みます。
     * @method loadImage
     * @param {string} key - アセットに割り当てる任意の文字列ID
     * @param {string} src - 画像のURL/パス
     * @returns {Promise<HTMLImageElement>}
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
     * JSONファイル（マップデータ等）を非同期で読み込みます。
     * @method loadJSON
     * @param {string} key - アセットに割り当てる任意の文字列ID
     * @param {string} src - JSONのURL/パス
     * @returns {Promise<Object>}
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
     * 音声ファイルを非同期で読み込み、AudioBufferとしてデコードします。
     * @method loadAudio
     * @param {string} key - アセットに割り当てる任意の文字列ID
     * @param {string} src - 音声のURL/パス
     * @param {AudioContext} audioCtx - デコードに使用するWeb Audio APIのContext
     * @returns {Promise<AudioBuffer>}
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

    /**
     * 読み込み済みの画像要素を取得します。
     * @method getImage
     * @param {string} key - 登録した文字列ID
     * @returns {HTMLImageElement|undefined} 画像オブジェクト
     */
    getImage(key) {
        return this.assets.images.get(key);
    }

    /**
     * 読み込み済みの音声バッファを取得します。
     * @method getSound
     * @param {string} key - 登録した文字列ID
     * @returns {AudioBuffer|undefined} 音声バッファ
     */
    getSound(key) {
        return this.assets.sounds.get(key);
    }

    /**
     * 読み込み済みのJSONデータを取得します。
     * @method getData
     * @param {string} key - 登録した文字列ID
     * @returns {Object|undefined} JSONデータ
     */
    getData(key) {
        return this.assets.data.get(key);
    }

    /**
     * 現在のアセット読み込み進捗率（0.0〜1.0）を取得します。
     * @property progress
     * @returns {number}
     */
    get progress() {
        return this.totalCount === 0 ? 1 : this.loadedCount / this.totalCount;
    }

    /**
     * 全てのアセットの読み込みが完了しているか判定します。
     * @method isDone
     * @returns {boolean}
     */
    isDone() {
        return this.loadedCount === this.totalCount;
    }
}
