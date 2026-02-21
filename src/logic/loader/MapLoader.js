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

        data.forEach((tileId, index) => {
            if (tileId === 0) return; // 0 は空

            const x = (index % width) * tileSize;
            const y = Math.floor(index / width) * tileSize;

            // タイルレイヤーはパフォーマンスのため SpriteSystem に登録
            this.engine.sprite.createItem(tileId, x, y);

            // 衝突判定用の不可視の壁を CollisionSystem に直接登録
            this.engine.entities.collision.register({
                x: x,
                y: y,
                width: tileSize,
                height: tileSize,
                isSolid: true,
                collisionEnabled: true,
                onCollision: () => { } // 壁自体は衝突イベントで動かない
            });
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
            entity.x = objData.x || 0;
            entity.y = objData.y || 0;
            if (objData.width) entity.width = objData.width;
            if (objData.height) entity.height = objData.height;
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
