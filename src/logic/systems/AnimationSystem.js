import { Behavior } from '../entity/Behavior.js';

/**
 * @class AnimationSystem
 * @description
 * エンティティにアタッチされたSpriteBehaviorを操作し、スプライトアニメーションを描画する。
 */
export class AnimationSystem extends Behavior {
    constructor() {
        super();
        this.animations = new Map(); // name -> { frames: [{sx, sy, sw, sh}], fps: 10, loop: true }
        this.currentState = "";
        this.currentFrameIndex = 0;
        this.elapsedTime = 0;
        this.spriteBehavior = null;
    }

    onAttach(entity) {
        super.onAttach(entity);
        // エンティティに追加されているSpriteBehaviorを探す
        this.spriteBehavior = this.entity.behaviors.find(b => b.constructor.name === 'SpriteBehavior');
    }

    addAnimation(name, frames, fps = 10, loop = true) {
        this.animations.set(name, { frames, fps, loop });
    }

    play(name, force = false) {
        if (this.currentState === name && !force) return;
        if (!this.animations.has(name)) return;

        this.currentState = name;
        this.currentFrameIndex = 0;
        this.elapsedTime = 0;

        // 再生開始時に即座に反映
        this._applyFrame();
    }

    update(dt) {
        if (!this.spriteBehavior) return;

        const anim = this.animations.get(this.currentState);
        if (!anim) return;

        this.elapsedTime += dt;

        let frameTime;
        const currentFrameData = anim.frames[this.currentFrameIndex];

        // フレーム個別の duration（ms）が指定されていればそれを使用。なければ従来通りの fps 計算
        if (currentFrameData && currentFrameData.duration) {
            frameTime = currentFrameData.duration;
        } else {
            frameTime = 1000 / (anim.fps || 10);
        }

        if (this.elapsedTime >= frameTime) {
            // 余剰時間を持ち越す（コマ落ち時の保証）
            this.elapsedTime -= frameTime;
            this.currentFrameIndex++;

            if (this.currentFrameIndex >= anim.frames.length) {
                if (anim.loop) {
                    this.currentFrameIndex = 0;
                } else {
                    this.currentFrameIndex = anim.frames.length - 1;
                }
            }
            this._applyFrame();
        }
    }

    /**
     * AsepriteからエクスポートしたJSONデータを読み込み、自動的にアニメーションを登録する
     * @param {Object} jsonData AssetManager経由などで読み込んだAseprite JSONオブジェクト
     */
    setupFromAseprite(jsonData) {
        if (!jsonData || !jsonData.frames || !jsonData.meta || !jsonData.meta.frameTags) {
            console.error("Invalid Aseprite JSON format.");
            return;
        }

        // frames は Array 形式と Hash 形式の両パターンがある
        const isArrayFormat = Array.isArray(jsonData.frames);
        const getFrameByIndex = (index) => {
            if (isArrayFormat) {
                return jsonData.frames[index];
            } else {
                return Object.values(jsonData.frames)[index];
            }
        };

        // frameTags（walk, idleなど）ごとに登録処理
        jsonData.meta.frameTags.forEach(tag => {
            const name = tag.name;
            const direction = tag.direction; // "forward", "reverse", "pingpong" など
            const frames = [];

            // Asepriteのタグの範囲 (from ～ to) をループしてフレームデータを抽出
            let start = tag.from;
            let end = tag.to;
            let step = 1;

            if (direction === "reverse") {
                start = tag.to;
                end = tag.from;
                step = -1;
            }

            // 指定された範囲のフレームを抽出
            let i = start;
            while (true) {
                const fdata = getFrameByIndex(i);
                if (fdata) {
                    // GameCore の AnimationSystem フォーマットに変換
                    frames.push({
                        sx: fdata.frame.x,
                        sy: fdata.frame.y,
                        sw: fdata.frame.w,
                        sh: fdata.frame.h,
                        duration: fdata.duration // 個別ミリ秒待機時間
                    });
                }

                if (i === end) break;
                i += step;
            }

            // pingpong 再生の場合は、帰り道のフレームを追加（最初と最後の重複避け）
            if (direction === "pingpong" && tag.to - tag.from > 0) {
                for (let j = tag.to - 1; j > tag.from; j--) {
                    const fdata = getFrameByIndex(j);
                    if (fdata) {
                        frames.push({
                            sx: fdata.frame.x, sy: fdata.frame.y,
                            sw: fdata.frame.w, sh: fdata.frame.h,
                            duration: fdata.duration
                        });
                    }
                }
            }

            // GameCore に登録（ループは Aseprite 側の設定には直接依存しないことが多いが、基本的にループさせる）
            this.addAnimation(name, frames, 10, true);
        });
    }

    _applyFrame() {
        if (!this.spriteBehavior) return;
        const anim = this.animations.get(this.currentState);
        if (!anim) return;

        const frame = anim.frames[this.currentFrameIndex];
        if (!frame) return;

        // SpriteBehaviorの描画領域プロパティを更新
        if (frame.sx !== undefined) this.spriteBehavior.sx = frame.sx;
        if (frame.sy !== undefined) this.spriteBehavior.sy = frame.sy;
        if (frame.sw !== undefined) this.spriteBehavior.sw = frame.sw;
        if (frame.sh !== undefined) this.spriteBehavior.sh = frame.sh;

        // 固有の反転や回転も可能
        if (frame.flipX !== undefined) this.spriteBehavior.flipX = frame.flipX;
        if (frame.flipY !== undefined) this.spriteBehavior.flipY = frame.flipY;
    }
}
