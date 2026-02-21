import { Beepcore } from './Beepcore.js';

/**
 * シンセサイザー(Beepcore)とサンプリング音源(MP3/WAV)を統合して管理するクラス。
 * @class AudioManager
 */
export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)({
            latencyHint: 'interactive'
        });

        this.masterVolNode = this.ctx.createGain();
        this.masterVolNode.gain.value = 0.5;
        this.masterVolNode.connect(this.ctx.destination);

        this.beep = new Beepcore(this.ctx, this.masterVolNode);

        this.bgmSource = null;
    }

    /**
     * ブラウザの制限（自動再生ポリシー）により停止しているAudioContextを再開します。
     * @method resume
     * @returns {Promise<void>}
     */
    async resume() {
        if (this.ctx.state !== 'running') {
            await this.ctx.resume();
        }
    }

    /**
     * Beepcore (シンセサイザー) を使用してメロディを再生します。
     * @method playScore
     * @param {string} namelist - MMLに似た音符文字列群
     * @param {number} interval - 音符ごとの長さの基準値
     * @param {number} now - AudioContextのcurrentTimeに等しい基準時間
     */
    playScore(namelist, interval, now) {
        this.resume();
        this.beep.playScore(namelist, interval, now);
    }

    /**
     * サンプリング音源（効果音）を再生します。複数同時再生が可能です。
     * @method playSE
     * @param {AudioBuffer} buffer - AssetManagerで読み込んだAudioBuffer
     * @param {number} [vol=1.0] - 音声のボリューム（0.0〜1.0）
     */
    playSE(buffer, vol = 1.0) {
        this.resume();
        if (!buffer) return;
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        gain.gain.value = vol;
        source.buffer = buffer;
        source.connect(gain).connect(this.masterVolNode);
        source.start(0);
    }

    /**
     * サンプリング音源（BGM）を再生します。現在再生中のBGMは停止されます。
     * @method playBGM
     * @param {AudioBuffer} buffer - AssetManagerで読み込んだAudioBuffer
     * @param {boolean} [loop=true] - ループ再生するかどうか
     */
    playBGM(buffer, loop = true) {
        this.resume();
        this.stopBGM();
        if (!buffer) return;

        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = buffer;
        this.bgmSource.loop = loop;
        this.bgmSource.connect(this.masterVolNode);
        this.bgmSource.start(0);
    }

    /**
     * 現在再生中のBGMを停止します。
     * @method stopBGM
     */
    stopBGM() {
        if (this.bgmSource) {
            this.bgmSource.stop();
            this.bgmSource = null;
        }
    }

    /**
     * 全体のマスターボリュームを設定します。
     * @method setMasterVolume
     * @param {number} vol - 音量（0.0〜1.0）
     */
    setMasterVolume(vol) {
        this.masterVolNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
        this.beep.setMasterVolume(vol);
    }

    /**
     * シンセサイザー音源（Beepcore）の内部状態を更新します。
     * ゲームループなどから定期的に呼び出す必要があります。
     * @method step
     * @param {number} now - タイムスタンプ
     */
    step(now) {
        this.beep.step(now);
    }
}
