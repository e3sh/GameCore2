import { Behavior } from '../../../src/logic/entity/Behavior.js';

/**
 * 接触したプレイヤーを別のシーンへ遷移させるポータルのBehavior
 */
export class PortalBehavior extends Behavior {
    /**
     * @param {string} targetSceneId - 移動先のシーンID（ファイル名や登録名）
     * @param {number} destX - 移動先のX座標
     * @param {number} destY - 移動先のY座標
     */
    constructor(targetSceneId, destX = 0, destY = 0) {
        super();
        this.targetSceneId = targetSceneId;
        this.destX = destX;
        this.destY = destY;
        this.triggered = false;
    }

    onCollision(other, colData) {
        if (this.triggered) return;

        // PlayerControlBehavior を持っているEntity = プレイヤーとみなす
        if (typeof other.getBehavior === 'function' && other.getBehavior('PlayerControlBehavior')) {
            this.triggered = true;
            console.log(`Portal Triggered! Moving to ${this.targetSceneId}`);

            const engine = this.entity.engine;

            // ワープパーティクル
            if (this.entity && this.entity.engine && this.entity.engine.particleSystem) {
                for (let i = 0; i < 30; i++) {
                    this.entity.engine.particleSystem.emit({
                        x: other.x,
                        y: other.y,
                        vx: (Math.random() - 0.5) * 50,
                        vy: (Math.random() - 1.0) * 200,
                        life: 400 + Math.random() * 200,
                        color: 'cyan',
                        size: 2 + Math.random() * 3,
                        drag: 0.95,
                        gravity: -100 // 上へ昇る
                    });
                }
            }

            // ワープ音 (Beepcore)
            if (engine && engine.sound) {
                engine.sound.playScore("O6 L32 CEG CEG CEG", 30, performance.now());
            }

            // グローバルステートの取得・初期化
            if (!engine.globalState) engine.globalState = {};
            if (!engine.globalState.playerData) engine.globalState.playerData = {};

            // プレイヤーデータの退避
            const combat = other.getBehavior('PlayerCombatBehavior');
            if (combat) {
                engine.globalState.playerData.currentHp = combat.currentHp;
                engine.globalState.playerData.maxHp = combat.maxHp;
            }

            const inventory = other.getBehavior('PlayerInventoryBehavior');
            if (inventory) {
                // オブジェクトのディープコピー
                engine.globalState.playerData.items = JSON.parse(JSON.stringify(inventory.items));
            }

            // ステージ番号を進める
            if (engine.globalState.stageno) {
                engine.globalState.stageno++;
            } else {
                engine.globalState.stageno = 2;
            }

            // --- クリア判定 (Phase 10) ---
            let nextSceneId = this.targetSceneId;
            if (engine.globalState.stageno > 3) {
                nextSceneId = 'EndingScene';
            }

            console.log(`State saved: HP=${engine.globalState.playerData.currentHp}, Stage=${engine.globalState.stageno}`);

            // TODO: SceneNavigator経由での正式なシーン遷移
            setTimeout(() => {
                import('../scenes/' + nextSceneId + '.js').then(module => {
                    const SceneClass = module[nextSceneId];
                    if (engine.scenes && engine.scenes.replace) {
                        engine.scenes.replace(new SceneClass(engine));
                    } else if (engine.scenes && engine.scenes.push) {
                        engine.scenes.push(new SceneClass(engine));
                    }
                }).catch(err => {
                    console.error("Failed to load scene:", err);
                });
            }, 100);
        }
    }
}
