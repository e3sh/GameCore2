import { Entity } from '../../../src/logic/entity/EntityManager.js';
import { SpriteBehavior } from '../behaviors/SpriteBehavior.js';
import { PhysicsBehavior } from '../../../src/logic/entity/PhysicsBehavior.js';
import { PlayerControlBehavior } from '../behaviors/PlayerControlBehavior.js';
import { PlayerAnimationBehavior } from '../behaviors/PlayerAnimationBehavior.js';
import { DebugHitboxBehavior } from '../behaviors/DebugHitboxBehavior.js';
import { TargetTrackingBehavior } from '../behaviors/TargetTrackingBehavior.js';
import { PlayerCombatBehavior } from '../behaviors/PlayerCombatBehavior.js';
import { HUDBehavior } from '../behaviors/HUDBehavior.js';
import { PlayerInventoryBehavior } from '../behaviors/PlayerInventoryBehavior.js';
import { ItemDropBehavior } from '../behaviors/ItemDropBehavior.js';
import { PatrolBehavior } from '../behaviors/PatrolBehavior.js';
import { StateMachineBehavior } from '../behaviors/StateMachineBehavior.js';
import { DoorBehavior } from '../behaviors/DoorBehavior.js';
import { PortalBehavior } from '../behaviors/PortalBehavior.js';
import { TilemapRendererBehavior } from '../behaviors/TilemapRendererBehavior.js';
import { GridCollisionBehavior } from '../behaviors/GridCollisionBehavior.js';

/**
 * GameCoreのMapLoader用にEntityのPrefab(雛形)を登録するファクトリクラス。
 */
export class EntityFactory {
    /**
     * @param {Engine} engine 
     * @param {MapLoader} mapLoader 
     */
    static registerPrefabs(engine, mapLoader) {

        // 背景タイルの描画用Behaviorを登録
        mapLoader.registerBehavior('TilemapRendererBehavior', TilemapRendererBehavior);

        // 壁 
        mapLoader.registerPrefab('Wall', (props) => {
            const wall = new Entity();
            wall.width = 32;
            wall.height = 32;
            wall.isSolid = true;
            wall.collisionEnabled = true;

            const type = props.type || 'Wall';
            wall.addBehavior(new SpriteBehavior(engine, type));
            wall.addBehavior(new DebugHitboxBehavior('rgba(255, 0, 0, 0.5)'));

            return wall;
        });

        // プレイヤー
        mapLoader.registerPrefab('Player', (props) => {
            const player = new Entity();
            player.width = 24;
            player.height = 24;
            player.zOrder = 0;

            player.addBehavior(new SpriteBehavior(engine, 'Mayura_Down'));
            player.addBehavior(new PhysicsBehavior({ gravity: 0.5, friction: 0.85 }));
            player.addBehavior(new PlayerControlBehavior());
            player.addBehavior(new PlayerAnimationBehavior());

            // --- グリッドベースの衝突判定 (最適化) ---
            if (engine.collisionMap) {
                player.addBehavior(new GridCollisionBehavior(engine.collisionMap));
            }

            // --- ステート引継ぎ（復元） ---
            let maxHp = 100;
            let currentHp = 100;
            let items = {};

            if (engine.globalState && engine.globalState.playerData) {
                const pd = engine.globalState.playerData;
                if (pd.maxHp !== undefined) maxHp = pd.maxHp;
                if (pd.currentHp !== undefined) currentHp = pd.currentHp;
                if (pd.items !== undefined) items = JSON.parse(JSON.stringify(pd.items));

                console.log(`[EntityFactory] Player state restored: HP=${currentHp}/${maxHp}`);
            }

            const combatBehavior = new PlayerCombatBehavior(maxHp);
            combatBehavior.currentHp = currentHp; // 現在HPを上書き
            player.addBehavior(combatBehavior);

            const inventoryBehavior = new PlayerInventoryBehavior();
            inventoryBehavior.items = items; // 所持アイテムを上書き
            player.addBehavior(inventoryBehavior);

            player.addBehavior(new HUDBehavior());
            player.addBehavior(new DebugHitboxBehavior('rgba(0, 255, 0, 0.8)'));

            return player;
        });

        // 追跡する敵
        mapLoader.registerPrefab('Enemy', (props) => {
            const enemy = new Entity();
            enemy.width = 24;
            enemy.height = 24;
            enemy.collisionEnabled = true;
            enemy.isSolid = true;
            enemy.hasDamage = true;
            enemy.damageAmount = 20;
            enemy.zOrder = 0;

            const type = props.type || 'Unyuu1';
            enemy.addBehavior(new SpriteBehavior(engine, type));
            enemy.addBehavior(new PhysicsBehavior({ gravity: 0.5, friction: 0.85 }));
            const tracker = new TargetTrackingBehavior(null, 0.5, 500);
            enemy.addBehavior(tracker);

            // --- グリッドベースの衝突判定 (最適化: 移動計算の後に実行されるよう最後に) ---
            if (engine.collisionMap) {
                enemy.addBehavior(new GridCollisionBehavior(engine.collisionMap));
            }

            enemy.addBehavior(new DebugHitboxBehavior('rgba(255, 100, 0, 0.8)'));

            return enemy;
        });

        // 巡回する敵（プレイヤーが近づくと追跡）
        mapLoader.registerPrefab('PatrolEnemy', (props) => {
            const enemy = new Entity();
            enemy.width = 24;
            enemy.height = 24;
            enemy.collisionEnabled = true;
            enemy.isSolid = true;
            enemy.hasDamage = true;
            enemy.damageAmount = 20;
            enemy.zOrder = 0;

            const type = props.type || 'Unyuu2';
            const speed = props.speed || 1.0;
            const direction = props.direction || 1;

            enemy.addBehavior(new SpriteBehavior(engine, type));
            enemy.addBehavior(new PhysicsBehavior({ gravity: 0.5, friction: 0.85 }));
            enemy.addBehavior(new PatrolBehavior(speed, direction));

            // ターゲットは後で設定する
            enemy.addBehavior(new TargetTrackingBehavior(null, 1.5, 0));

            // --- グリッドベースの衝突判定 (最適化: 最後に) ---
            if (engine.collisionMap) {
                enemy.addBehavior(new GridCollisionBehavior(engine.collisionMap));
            }

            enemy.addBehavior(new StateMachineBehavior({
                initial: 'patrol',
                states: {
                    'patrol': {
                        enable: ['PatrolBehavior'],
                        disable: ['TargetTrackingBehavior'],
                        onUpdate: (e, dt) => {
                            // TargetTrackingBehaviorからターゲットを取得して距離判定
                            const tracker = e.getBehavior('TargetTrackingBehavior');
                            const target = tracker ? tracker.target : null;
                            if (!target) return;

                            const dx = target.x - e.x;
                            const dy = target.y - e.y;
                            if (dx * dx + dy * dy < 150 * 150) {
                                e.getBehavior('StateMachineBehavior').setState('chase');
                                e.getBehavior('SpriteBehavior').color = 'rgba(255,100,100,1)';
                            }
                        }
                    },
                    'chase': {
                        enable: ['TargetTrackingBehavior'],
                        disable: ['PatrolBehavior'],
                        onUpdate: (e, dt) => {
                            const tracker = e.getBehavior('TargetTrackingBehavior');
                            const target = tracker ? tracker.target : null;
                            if (!target) return;

                            const dx = target.x - e.x;
                            const dy = target.y - e.y;
                            if (dx * dx + dy * dy > 300 * 300) {
                                e.getBehavior('StateMachineBehavior').setState('patrol');
                                e.getBehavior('SpriteBehavior').color = 'white';
                            }
                        }
                    }
                }
            }));

            enemy.addBehavior(new DebugHitboxBehavior('rgba(150, 0, 255, 0.8)'));
            return enemy;
        });

        // アイテム
        mapLoader.registerPrefab('Item', (props) => {
            const item = new Entity();
            item.width = 16;
            item.height = 16;
            item.isSolid = false;
            item.itemId = props.itemId || 'potion_hp';
            item.healAmount = props.healAmount || 50;

            const itemSprite = new SpriteBehavior(engine, 'Item_Heal');
            itemSprite.scaleX = 0.5;
            itemSprite.scaleY = 0.5;
            item.addBehavior(itemSprite);

            item.addBehavior(new PhysicsBehavior({ gravity: 0.5, friction: 0.85, bounce: 0.5 }));
            item.addBehavior(new ItemDropBehavior({ jumpZ: 6.0, spreadX: 3.0, spreadY: 0.0 }));

            // --- グリッドベースの衝突判定 (最適化: 最後に) ---
            if (engine.collisionMap) {
                item.addBehavior(new GridCollisionBehavior(engine.collisionMap));
            }

            item.addBehavior(new DebugHitboxBehavior('rgba(255, 255, 0, 0.8)'));
            return item;
        });

        // ドア
        mapLoader.registerPrefab('Door', (props) => {
            const door = new Entity();
            door.width = 32;
            door.height = 32;
            door.addBehavior(new SpriteBehavior(engine, 'Door'));
            door.addBehavior(new DoorBehavior(null));
            door.addBehavior(new DebugHitboxBehavior('rgba(255, 255, 0, 0.8)'));
            return door;
        });

        // ポータル
        mapLoader.registerPrefab('Portal', (props) => {
            const portal = new Entity();
            portal.width = 32;
            portal.height = 32;
            portal.isSolid = false;
            portal.zOrder = -1;

            portal.addBehavior(new SpriteBehavior(engine, 'Portal'));
            portal.addBehavior(new PortalBehavior(props.targetScene || 'TitleScene', 0, 0));
            portal.addBehavior(new DebugHitboxBehavior('rgba(0, 0, 255, 0.8)'));
            return portal;
        });

        // ※ 壁(Wall)はTileLayerとして読むか、Objectとして読むかの違いがある。
        // 今回のcv_cloneでは壁はEntityとして扱う(Yソート等に影響させるため)場合、ObjectLayerとして配置するか、MapLoaderを書き換える。
        // （後ほど対応）
    }
}
