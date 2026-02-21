import { Behavior } from './Behavior.js';

/**
 * @class UIBehavior
 * @description
 * このコンポーネントがアタッチされたエンティティは、「UI層」として扱われる。
 * レンダラーによって、カメラのスクロール (scrollX, scrollY) の影響を受けずに
 * 常に画面の同じ位置に固定描画されるようになる。
 */
export class UIBehavior extends Behavior {
    constructor() {
        super();
        this.isUI = true;
    }
}
