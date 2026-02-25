import { Entity } from '../entity/EntityManager.js';

/**
 * @class MapLoader
 * @description
 * マップデータを解析し、タイルレイヤーの描画やエンティティの自動配置を行う。
 */
export class MapLoader {
    constructor(engine) {
        this.engine = engine;
        this.prefabs = new Map(); // typeName -> Class/Factory
        this.behaviors = new Map(); // behaviorName -> Class
    }

    /**
     * @method registerPrefab
     * @param {string} type 
     * @param {Function} factory 
     */
    registerPrefab(type, factory) {
        this.prefabs.set(type, factory);
    }

    /**
     * @method registerBehavior
     * @param {string} name 
     * @param {Function} behaviorClass 
     */
    registerBehavior(name, behaviorClass) {
        this.behaviors.set(name, behaviorClass);
    }

    /**
     * @method load
     * @param {Object} mapData 
     */
    load(mapData) {
        // Tiled 形式の 'layers' または シンプルな 'objects' 形式に対応
        const layers = mapData.layers || [{ type: 'objectgroup', objects: mapData.objects }];

        layers.forEach(layer => {
            if (layer.type === 'tilelayer') {
                this._loadTileLayer(layer, mapData);
            } else if (layer.type === 'objectgroup') {
                this._loadObjectLayer(layer);
            }
        });
    }

    _loadTileLayer(layer, mapData) {
        const tileSize = mapData.tileSize || layer.tileSize || 32;
        const data = layer.data;
        const width = layer.width;

        // 背景描画用のEntityを登録 (TilemapRendererBehaviorが登録されている前提)
        const bgBehaviorClass = this.behaviors.get('TilemapRendererBehavior');
        if (bgBehaviorClass) {
            const bgEntity = new Entity();
            bgEntity.zOrder = -10;
            bgEntity.addBehavior(new bgBehaviorClass(this.engine, layer, tileSize));
            this.engine.entities.add(bgEntity);
        }

        // コリジョン用レイヤーなら、エンジン側の参照として保持する（GridCollision用）
        if (layer.name === 'Collision') {
            this.engine.collisionMap = layer;
        }

        data.forEach((tileId, index) => {
            if (tileId === 0) return; // 0 は空

            const startX = (index % width) * tileSize;
            const startY = Math.floor(index / width) * tileSize;

            // 壁(ID:1, 2)はTilemapRendererBehaviorで統合描画するため、
            // 個別のスプライトアイテムとして登録しない
            if (tileId !== 1 && tileId !== 2) {
                // 壁以外のタイルは背景としてSpriteSystemに登録
                this.engine.sprite.createItem(tileId, startX, startY);
            }
        });
    }

    _loadObjectLayer(layer) {
        if (!layer.objects) return;

        layer.objects.forEach(objData => {
            // Tiled v1.9以降は 'class' 、それ以前は 'type' を使用
            const typeName = objData.class || objData.type;
            const Factory = this.prefabs.get(typeName);
            if (!Factory) {
                console.warn(`Unknown prefab type: ${typeName}`);
                return;
            }

            // Tiledのプロパティ配列 [{name:"range", type:"int", value:100}] を展開
            let parsedProps = {};
            if (Array.isArray(objData.properties)) {
                objData.properties.forEach(p => {
                    parsedProps[p.name] = p.value;
                });
            } else if (typeof objData.properties === 'object') {
                // 既に辞書形式（自前JSONなど）の場合
                parsedProps = objData.properties;
            }

            const entity = Factory(parsedProps);
            const w = objData.width || 32;
            const h = objData.height || 32;
            entity.width = w;
            entity.height = h;
            // Tiled等のオブジェクトは左上座標(x,y)で定義されることが多いため、中心座標に変換する
            entity.x = (objData.x || 0) + (w / 2);
            entity.y = (objData.y || 0) + (h / 2);
            entity.tag = objData.name || objData.tag || "";

            // Behavior の動的追加
            if (parsedProps && parsedProps.behaviors) {
                // Tiledのプロパティ内に直接JSON文字列等で仕込んだ場合への対応等
                // 一旦既存のまま残すが、通常は Prefab(Factory) 側で Behavior を組み上げる
            }

            this.engine.entities.add(entity);
        });
    }
}
