import { Behavior } from './Behavior.js';

/**
 * @class TypewriterBehavior
 * @description
 * 同居している TextBehavior の文字列を、指定された速度（ミリ秒）ごとに
 * 1文字ずつ追加して表示する演出（タイプライターエフェクト）を行うコンポーネント。
 */
export class TypewriterBehavior extends Behavior {
    /**
     * @param {number} speedMs 1文字表示するごとの待機時間(ミリ秒)
     */
    constructor(speedMs = 50) {
        super();
        this.fullText = "";
        this.speedMs = speedMs;
        this.elapsed = 0;
        this.currentIndex = 0;
        this.isTyping = false;

        this._textBehavior = null;
    }

    onAttach(entity) {
        super.onAttach(entity);
        this._textBehavior = this.entity.behaviors.find(b => b.constructor.name === 'TextBehavior');
    }

    /**
     * タイプ表示を開始する
     * @param {string} text 表示したい全文
     */
    showText(text) {
        if (!this._textBehavior) {
            console.warn("TypewriterBehavior requires a TextBehavior on the same entity.");
            return;
        }
        this.fullText = text;
        this.currentIndex = 0;
        this.elapsed = 0;
        this.isTyping = true;
        this._textBehavior.text = ""; // 初期化
    }

    /**
     * アニメーションをスキップして全文を即座に表示する
     */
    skipToEnd() {
        if (!this.isTyping || !this._textBehavior) return;
        this.currentIndex = this.fullText.length;
        this._textBehavior.text = this.fullText;
        this.isTyping = false;
    }

    update(dt) {
        if (!this.isTyping || !this._textBehavior) return;

        this.elapsed += dt;

        // 蓄積時間が speedMs を超えている間、文字を進める
        while (this.elapsed >= this.speedMs && this.isTyping) {
            this.elapsed -= this.speedMs;
            this.currentIndex++;

            if (this.currentIndex >= this.fullText.length) {
                this.currentIndex = this.fullText.length;
                this.isTyping = false;
                this._textBehavior.text = this.fullText; // 念のため
                break;
            } else {
                // ここまでの文字列を TextBehavior に反映
                this._textBehavior.text = this.fullText.substring(0, this.currentIndex);
            }
        }
    }
}
