/**
 * Entity に付与可能な独立した挙動（コンポーネント）の基底クラス。
 * @class Behavior
 */
export class Behavior {
    /**
     * @constructor
     */
    constructor() {
        this.entity = null;
        this.enabled = true;
    }

    /**
     * Entityにアタッチされた際に呼ばれるフックメソッド。
     * @method onAttach
     * @param {Entity} entity - アタッチ先のEntityインスタンス
     */
    onAttach(entity) {
        this.entity = entity;
    }

    /**
     * Entityからデタッチ（削除）される際に呼ばれるフックメソッド。
     * @method onDetach
     */
    onDetach() {
        this.entity = null;
    }

    /**
     * 毎フレーム呼び出されるメインの更新処理。
     * @method update
     * @param {number} dt - デルタタイム
     */
    update(dt) {
        // サブクラスで実装
    }

    /**
     * Entityが他のEntityと衝突した際に呼ばれるイベント。
     * @method onCollision
     * @param {Entity} other - 衝突相手のEntity
     * @param {Object} colData - 衝突情報（重なり量、方向ベクトル等）
     */
    onCollision(other, colData) {
        // 衝突時の反応
    }
}
