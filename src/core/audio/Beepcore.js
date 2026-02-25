/**
 * @class SoundNote
 * @description 個々の発振器の状態を管理する内部クラス。
 */
class SoundNote {
    constructor(audioCtx, masterVolume, destination) {
        this.ctx = audioCtx;
        this.osc = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0;

        const dest = destination || this.ctx.destination;
        this.osc.connect(this.gainNode).connect(dest);

        this.masterVolume = masterVolume;
        this.alive = true;
        this.busy = false;

        this.score = [];
        this.startTime = 0;
        this.currentIndex = -1;

        // 音名 -> 周波数変換用テーブル
        this.noteTable = this._createNoteTable();

        // オシレーターはずっと回し続ける
        this.osc.start();
    }

    init(freq, type = 'square', lfo = null) {
        this.osc.type = type;
        // 仕込み: 周波数を先にセット
        this.osc.frequency.value = freq;

        if (lfo) {
            const lfoOsc = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = lfo.depth;
            lfoOsc.type = lfo.type;
            lfoOsc.frequency.value = lfo.freq;
            lfoOsc.connect(lfoGain).connect(this.osc.frequency);
            lfoOsc.start();
        }
    }

    /**
     * @method play
     * @param {Array} score 演奏データ
     * @param {number} now エンジン内現在時刻 (performance.now())
     */
    play(score, now) {
        this.score = score;
        this.startTime = now;
        this.currentIndex = -1;
        this.busy = true;

        this.score.forEach(n => {
            if (n.name) n.freq = this._nameToFreq(n.name);
        });

        // 即座に最初のフレームの処理を実行
        this.step(now);
    }

    step(now) {
        if (!this.busy) return;

        // 負の経過時間を防ぐ
        const elapsed = Math.max(0, now - this.startTime);
        let timeAcc = 0;
        let targetIndex = -1;

        for (let i = 0; i < this.score.length; i++) {
            const duration = this.score[i].time;
            const nextTime = timeAcc + duration;
            if (elapsed >= timeAcc && elapsed < nextTime) {
                targetIndex = i;
                break;
            }
            timeAcc = nextTime;
        }

        if (targetIndex !== this.currentIndex) {
            this.currentIndex = targetIndex;
            if (targetIndex === -1) {
                // 演奏終了: ここはプチノイズ防止のため僅かに Ramp
                this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.005);
                this.busy = false;
                this.alive = false;
            } else {
                const n = this.score[targetIndex];
                // 実働: 直値代入による最速の発音
                if (n.freq > 0) {
                    this.osc.frequency.value = n.freq;
                }
                // ボリュームを叩く
                this.gainNode.gain.value = n.vol * this.masterVolume;
            }
        }
    }

    _nameToFreq(name) {
        const found = this.noteTable.find(n => n.name === name);
        return found ? found.freq : 0;
    }

    _createNoteTable() {
        const names = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
        let table = [];
        for (let i = 0; i < 9; i++) {
            const startFreq = 27.5 * Math.pow(2, i);
            for (let j = 0; j < 12; j++) {
                table.push({
                    name: names[j] + ((j < 3) ? i : i + 1),
                    freq: startFreq * (Math.pow(2, j / 12))
                });
            }
        }
        return table;
    }
}

/**
 * @class Beepcore
 * @description WebAudio API を使用した音響合成システム。
 */
export class Beepcore {
    constructor(audioCtx, destinationNode) {
        this.ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        this.dest = destinationNode || this.ctx.destination;
        this.masterVol = 0.5;
        this.defaultType = 'square';
        this.lfoSetting = null;
        this.activeNotes = [];
        this.notePool = []; // 再利用可能な音源プール

        // チャタリング防止用
        this._lastPlayKey = "";
        this._lastPlayTime = 0;

        // 事前にいくつか作っておく（プリウォーム）
        for (let i = 0; i < 4; i++) {
            this.notePool.push(new SoundNote(this.ctx, this.masterVol, this.dest));
        }
    }

    setMasterVolume(vol) {
        this.masterVol = vol;
        // プール内の既存音源の音量も更新
        this.notePool.forEach(n => n.masterVolume = vol);
        this.activeNotes.forEach(n => n.masterVolume = vol);
    }

    setOscType(type) {
        this.defaultType = type;
    }

    setLFO(freq, type, depth) {
        this.lfoSetting = { freq, type, depth };
    }

    /**
     * MML風の文字列を解析し、Beepcore内部のスコアデータ配列に変換します。
     * @param {string} mmlString 
     * @param {number} defaultInterval (ms) L4 相当の基準時間
     * @returns {Array} score data
     */
    _parseMML(mmlString, defaultInterval) {
        let score = [];
        let octave = 4;
        let defaultLength = 4; // L4デフォルト
        let volume = 1.0;
        let p = 0;

        const str = mmlString.toUpperCase().replace(/\s+/g, '');

        while (p < str.length) {
            let char = str[p];
            p++;

            if (char === 'O') {
                // Octave O1-O9
                let numStr = "";
                while (p < str.length && str[p] >= '0' && str[p] <= '9') {
                    numStr += str[p];
                    p++;
                }
                if (numStr !== "") octave = parseInt(numStr, 10);
            } else if (char === 'L') {
                // Length L1-L64
                let numStr = "";
                while (p < str.length && str[p] >= '0' && str[p] <= '9') {
                    numStr += str[p];
                    p++;
                }
                if (numStr !== "") defaultLength = parseInt(numStr, 10);
            } else if (char === 'V') {
                // Volume V0-V15
                let numStr = "";
                while (p < str.length && str[p] >= '0' && str[p] <= '9') {
                    numStr += str[p];
                    p++;
                }
                if (numStr !== "") volume = parseInt(numStr, 10) / 15.0;
            } else if (char >= 'A' && char <= 'G') {
                // Note
                let noteName = char;
                if (p < str.length && (str[p] === '#' || str[p] === '+' || str[p] === '-')) {
                    if (str[p] === '#' || str[p] === '+') noteName += '#';
                    // フラットは複雑になるため一旦シャープ置換などは省略（基本仕様）
                    p++;
                }
                noteName += octave;

                // 独自の長さ指定が音符直後にあるか (C8 など)
                let noteLength = defaultLength;
                let numStr = "";
                while (p < str.length && str[p] >= '0' && str[p] <= '9') {
                    numStr += str[p];
                    p++;
                }
                if (numStr !== "") noteLength = parseInt(numStr, 10);

                // 付点 (C4. など)
                let dot = 1.0;
                if (p < str.length && str[p] === '.') {
                    dot = 1.5;
                    p++;
                }

                // 実際の長さを計算 (L4 を defaultInterval とする)
                const playTime = (defaultInterval * (4.0 / noteLength)) * dot;

                score.push({
                    name: noteName,
                    freq: 0,
                    vol: volume,
                    time: playTime,
                    played: false
                });
            } else if (char === 'R') {
                // Rest (休符)
                let noteLength = defaultLength;
                let numStr = "";
                while (p < str.length && str[p] >= '0' && str[p] <= '9') {
                    numStr += str[p];
                    p++;
                }
                if (numStr !== "") noteLength = parseInt(numStr, 10);

                let dot = 1.0;
                if (p < str.length && str[p] === '.') {
                    dot = 1.5;
                    p++;
                }
                const playTime = (defaultInterval * (4.0 / noteLength)) * dot;

                // 休符は vol=0 の特殊な音として登録
                score.push({
                    name: 'R',
                    freq: 0, // 0にすると発音されない
                    vol: 0,
                    time: playTime,
                    played: false
                });
            } else if (char === 'T') {
                // Tempo T30-300 (BeepcoreのMMLではintervalの変動ではなく省略・非対応とするか、全体速度を乗算する。ここでは無視して次へ進める)
                let numStr = "";
                while (p < str.length && str[p] >= '0' && str[p] <= '9') {
                    numStr += str[p];
                    p++;
                }
            }
        }
        return score;
    }

    playScore(namelist, interval = 100, now) {
        let score = [];

        if (typeof namelist === 'string') {
            const hasMmlChars = /[OLVRT]/i.test(namelist);
            if (hasMmlChars) {
                // MMLフォーマットとして解釈
                score = this._parseMML(namelist, interval);
            } else {
                // 単純なスペース区切りの音名リスト（従来の仕様のフォールバック）
                const names = namelist.trim().split(/\s+/);
                score = names.map(name => ({
                    name,
                    freq: 0,
                    vol: 1.0,
                    time: interval,
                    played: false
                }));
            }
        } else if (Array.isArray(namelist)) {
            // 配列の場合は従来通り
            score = namelist.map(name => ({
                name,
                freq: 0,
                vol: 1.0,
                time: interval,
                played: false
            }));
        }

        // チャタリング防止: 100ms以内の同一メロディ再生を無視
        const key = Array.isArray(namelist) ? namelist.join(',') : String(namelist);
        if (this._lastPlayKey === key && (now - this._lastPlayTime < 100)) {
            return;
        }
        this._lastPlayKey = key;
        this._lastPlayTime = now;

        let note = this.notePool.pop() || new SoundNote(this.ctx, this.masterVol, this.dest);
        note.alive = true;
        note.init(440, this.defaultType, this.lfoSetting);
        note.play(score, now);
        this.activeNotes.push(note);
    }

    step(now) {
        this.activeNotes = this.activeNotes.filter(n => {
            n.step(now);
            if (!n.alive) {
                // 演奏が終わった音源をプールに戻す
                this.notePool.push(n);
                return false;
            }
            return true;
        });
    }
}
