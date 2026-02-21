import { Beepcore } from './Beepcore.js';

/**
 * @class AudioManager
 * @description
 * シンセサイザー(Beepcore)とサンプリング音源(MP3/WAV)を統合して管理する。
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
     * @method resume
     * ブラウザの制限により停止しているAudioContextを再開します。
     */
    async resume() {
        if (this.ctx.state !== 'running') {
            await this.ctx.resume();
        }
    }

    /**
     * @method playScore
     * Beepcore (シンセ) でメロディを再生。
     */
    playScore(namelist, interval, now) {
        this.resume();
        this.beep.playScore(namelist, interval, now);
    }

    /**
     * @method playSE
     * @param {AudioBuffer} buffer 
     * @param {number} vol 
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
     * @method playBGM
     * @param {AudioBuffer} buffer 
     * @param {boolean} loop 
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
     * @method stopBGM
     */
    stopBGM() {
        if (this.bgmSource) {
            this.bgmSource.stop();
            this.bgmSource = null;
        }
    }

    setMasterVolume(vol) {
        this.masterVolNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
        this.beep.setMasterVolume(vol);
    }

    step(now) {
        this.beep.step(now);
    }
}
