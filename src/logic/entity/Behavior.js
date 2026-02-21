/**
 * @class Behavior
 * @description
 * Entity に付与可能な独立した挙動（コンポーネント）の基底クラス。
 */
export class Behavior {
    constructor() {
        this.entity = null;
        this.enabled = true;
    }

    onAttach(entity) {
        this.entity = entity;
    }

    onDetach() {
        this.entity = null;
    }

    update(dt) {
        // サブクラスで実装
    }

    onCollision(other) {
        // 衝突時の反応
    }
}
