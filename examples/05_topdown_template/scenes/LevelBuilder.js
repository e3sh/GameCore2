import { Entity } from '../../../src/logic/entity/EntityManager.js';
import { SpriteBehavior } from '../behaviors/SpriteBehavior.js';
import { TilemapRendererBehavior } from '../behaviors/TilemapRendererBehavior.js';
import { DebugHitboxBehavior } from '../behaviors/DebugHitboxBehavior.js';
import { DoorBehavior } from '../behaviors/DoorBehavior.js';
import { PortalBehavior } from '../behaviors/PortalBehavior.js';

/**
 * 2次元配列データからGameCoreのEntityを生成して配置するビルダー
 */
export class LevelBuilder {
    constructor(engine) {
        this.engine = engine;
        this.tileSize = 32;
    }

    /**
     * 指定された2次元配列マップをビルドし、EntityManagerにEntityを登録する
     * @param {number[][]} mapData 
     */
    buildFromData(mapData) {
        if (!mapData || mapData.length === 0) return;

        const rows = mapData.length;
        const cols = mapData[0].length;

        const bgEntity = new Entity();
        bgEntity.zOrder = -10;
        bgEntity.addBehavior(new TilemapRendererBehavior(this.engine, mapData, this.tileSize));
        this.engine.entities.add(bgEntity);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tileId = mapData[y][x];
                this.createTileEntity(x, y, tileId);
            }
        }
    }

    /**
     * タイル番号に応じたEntityを生成する
     * @param {number} x 
     * @param {number} y 
     * @param {number} tileId 
     */
    createTileEntity(x, y, tileId) {
        // タイルの中心座標
        const px = x * this.tileSize + this.tileSize / 2;
        const py = y * this.tileSize + this.tileSize / 2;

        if (tileId === 1) { // 1: Wall
            const wall = new Entity();
            wall.x = px;
            wall.y = py;
            wall.width = this.tileSize;
            wall.height = this.tileSize;
            // 壁なので中心より少し大きめに補正する場合もあるが、まずは32x32として可視化
            wall.isSolid = true; // 衝突判定あり
            wall.addBehavior(new SpriteBehavior(this.engine, 'Wall'));
            wall.addBehavior(new DebugHitboxBehavior('rgba(255, 0, 0, 0.5)'));
            this.engine.entities.add(wall);
        } else if (tileId === 0) { // 0: Floor
            // 床は背景TilemapRendererBehaviorで一括描画するためEntity生成はスキップ
        } else if (tileId === 2) { // 2: Door (開閉する扉)
            const door = new Entity();
            door.x = px;
            door.y = py;
            door.width = this.tileSize;
            door.height = this.tileSize;
            // 当たり判定はDoorBehaviorのonAttachでtrueになる
            door.addBehavior(new SpriteBehavior(this.engine, 'Door'));
            door.addBehavior(new DoorBehavior(null)); // 今回は鍵なしで開く
            door.addBehavior(new DebugHitboxBehavior('rgba(255, 255, 0, 0.8)')); // 黄色い枠
            this.engine.entities.add(door);
        } else if (tileId === 3) { // 3: Portal (シーン移動)
            const portal = new Entity();
            portal.x = px;
            portal.y = py;
            portal.width = this.tileSize;
            portal.height = this.tileSize;
            portal.isSolid = false; // ポータル自体は通り抜けられる
            portal.zOrder = -1;     // 床に配置されるギミックは、常にキャラクターの下（マイナス）に描画する
            portal.addBehavior(new SpriteBehavior(this.engine, 'Portal'));
            portal.addBehavior(new PortalBehavior('TitleScene', 0, 0)); // テストでTitleSceneへ戻る
            portal.addBehavior(new DebugHitboxBehavior('rgba(0, 0, 255, 0.8)')); // 青い枠
            this.engine.entities.add(portal);
        }
    }
}
