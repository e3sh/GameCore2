import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * @class StateMachineBehavior
 * @description
 * 複数の状態(State)を定義し、状態に応じて他のBehaviorの有効/無効を切り替えたり、個別の更新処理を実行するAI基盤。
 */
export class StateMachineBehavior extends Behavior {
    /**
     * @param {Object} config ステートマシンの設定
     * @param {string} config.initial 初期ステート名
     * @param {Object} config.states ステート定義オブジェクト
     * 
     * states の例:
     * {
     *   'patrol': {
     *     enable: ['PatrolBehavior'],
     *     disable: ['TargetTrackingBehavior'],
     *     onEnter: (e) => { ... },
     *     onUpdate: (e, dt) => { ... },
     *     onExit: (e) => { ... }
     *   }
     * }
     */
    constructor(config = {}) {
        super();
        this.states = config.states || {};
        this.currentStateName = null;
        this.initialState = config.initial || null;
    }

    onAttach(entity) {
        super.onAttach(entity);
        if (this.initialState) {
            this.setState(this.initialState);
        }
    }

    /**
     * ステートを切り替える
     * @param {string} stateName 新しいステート名
     */
    setState(stateName) {
        if (!this.states[stateName]) return;
        const e = this.entity;

        // 現在のステートの onExit を呼ぶ
        if (this.currentStateName && this.states[this.currentStateName].onExit) {
            this.states[this.currentStateName].onExit(e);
        }

        this.currentStateName = stateName;
        const newState = this.states[stateName];

        // 状態に応じたBehaviorの無効化
        if (newState.disable) {
            newState.disable.forEach(className => {
                const b = e.getBehavior(className);
                if (b) b.enabled = false;
            });
        }

        // 状態に応じたBehaviorの有効化
        if (newState.enable) {
            newState.enable.forEach(className => {
                const b = e.getBehavior(className);
                if (b) b.enabled = true;
            });
        }

        // 新しいステートの onEnter を呼ぶ
        if (newState.onEnter) {
            newState.onEnter(e);
        }
    }

    update(dt) {
        if (!this.currentStateName || !this.entity) return;

        const currentState = this.states[this.currentStateName];
        if (currentState && currentState.onUpdate) {
            currentState.onUpdate(this.entity, dt);
        }
    }
}
