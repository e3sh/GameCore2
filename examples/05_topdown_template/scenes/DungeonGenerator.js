export class DungeonGenerator {
    constructor() {
        this.MAP_W = 40;
        this.MAP_H = 40;
        this.MIN_ROOM_SIZE = 5;
        this.MARGIN = 3;
        this.MIN_RECT_SIZE = this.MIN_ROOM_SIZE + (this.MARGIN * 2);

        this.map = []; // 2D array [x][y] 1=wall, 0=floor
        this.rects = [];
        this.rooms = [];
        this.corridors = [];

        this.rndSeed = 0;
    }

    // 軽量な擬似乱数生成器
    rnd() {
        this.rndSeed = (1103515245 * this.rndSeed + 12345) % 32768;
        return this.rndSeed / 32767.1;
    }

    randInt(min, max) {
        return Math.floor(this.rnd() * (max - min)) + min;
    }

    /**
     * MapLoaderで読み込み可能なJSONライクなオブジェクトを生成する
     * @param {number} stageno 乱数シード 
     * @returns {Object} mapData
     */
    generate(stageno) {
        // シード初期化
        this.rndSeed = stageno || Math.floor(Math.random() * 1000000);

        // マップを壁(1)で初期化
        this.map = Array.from({ length: this.MAP_W }, () => Array(this.MAP_H).fill(1));
        this.rects = [];
        this.rooms = [];

        // BSPによる空間分割
        const rootRect = { x: 0, y: 0, w: this.MAP_W - 1, h: this.MAP_H - 1 };
        this.splitRect(rootRect);

        // デバッグ避け: 最低でもいくつかの部屋を確保
        if (this.rects.length < 2) {
            this.rects.push({ x: 1, y: 1, w: 10, h: 10 });
            this.rects.push({ x: 15, y: 15, w: 10, h: 10 });
        }

        // 部屋の作成
        this.rects.forEach(rect => {
            const w = this.randInt(this.MIN_ROOM_SIZE, rect.w - this.MARGIN * 2 + 1);
            const h = this.randInt(this.MIN_ROOM_SIZE, rect.h - this.MARGIN * 2 + 1);
            const x = this.randInt(rect.x + this.MARGIN, rect.x + rect.w - this.MARGIN - w + 1);
            const y = this.randInt(rect.y + this.MARGIN, rect.y + rect.h - this.MARGIN - h + 1);
            const room = { x, y, w, h, id: this.rooms.length };
            this.rooms.push(room);
            rect.room = room;

            // 部屋部分を床(0)にする
            for (let i = x; i < x + w; i++) {
                for (let j = y; j < y + h; j++) {
                    this.map[i][j] = 0;
                }
            }
        });

        // 部屋を通路で繋ぐ（簡易的にリスト順で繋ぐ）
        for (let i = 0; i < this.rooms.length - 1; i++) {
            this.connectRooms(this.rooms[i], this.rooms[i + 1]);
        }

        // 確実な外壁の描画
        for (let i = 0; i < this.MAP_W; i++) {
            this.map[i][0] = 1;
            this.map[i][this.MAP_H - 1] = 1;
        }
        for (let j = 0; j < this.MAP_H; j++) {
            this.map[0][j] = 1;
            this.map[this.MAP_W - 1][j] = 1;
        }

        // Entity(オブジェクトレイヤー)の構築
        const objects = [];
        const tileSize = 32;

        // PlayerStart （最初の部屋）
        const r0 = this.rooms[0];
        objects.push({
            name: "PlayerStart",
            class: "Player",
            x: (r0.x + Math.floor(r0.w / 2)) * tileSize,
            y: (r0.y + Math.floor(r0.h / 2)) * tileSize,
            width: 24, height: 24
        });

        // Portal （最後の部屋）
        const rL = this.rooms[this.rooms.length - 1];
        objects.push({
            name: "NextStagePortal",
            class: "Portal",
            x: (rL.x + Math.floor(rL.w / 2)) * tileSize,
            y: (rL.y + Math.floor(rL.h / 2)) * tileSize,
            width: 32, height: 32,
            properties: [
                { name: "targetScene", type: "string", value: "GameScene" } // 同一シーンを再読み込み
            ]
        });

        // ランダム配置される敵とアイテム
        for (let i = 1; i < this.rooms.length - 1; i++) {
            const r = this.rooms[i];
            const cx = (r.x + Math.floor(r.w / 2)) * tileSize;
            const cy = (r.y + Math.floor(r.h / 2)) * tileSize;

            // 最初の2部屋はアイテム確定にして安全地帯にする
            const isSafeZone = i <= 2;

            if (!isSafeZone && this.rnd() > 0.5) {
                // 敵を配置
                const type = this.rnd() > 0.5 ? "Unyuu1" : "Unyuu2";
                const isPatrol = type === "Unyuu2";
                const props = [
                    { name: "type", type: "string", value: type }
                ];
                if (isPatrol) {
                    props.push({ name: "speed", type: "float", value: 1.0 });
                    props.push({ name: "direction", type: "int", value: 1 });
                }

                objects.push({
                    name: "Enemy" + i,
                    class: isPatrol ? "PatrolEnemy" : "Enemy",
                    x: cx, y: cy,
                    width: 24, height: 24,
                    properties: props
                });
            } else {
                // アイテムを配置
                objects.push({
                    name: "HealPotion" + i,
                    class: "Item",
                    x: cx, y: cy,
                    width: 16, height: 16,
                    properties: [
                        { name: "itemId", type: "string", value: "potion_hp" },
                        { name: "healAmount", type: "int", value: 50 }
                    ]
                });
            }
        }

        // Tiled形式の 1次元配列(X, Y)へ変換
        const data = [];
        for (let y = 0; y < this.MAP_H; y++) {
            for (let x = 0; x < this.MAP_W; x++) {
                let tileId = this.map[x][y];
                // 壁(1)の一部をランダムに「低い壁(2)」にする
                if (tileId === 1 && this.rnd() > 0.8) {
                    tileId = 2;
                }
                data.push(tileId);
            }
        }

        return {
            tileSize: tileSize,
            width: this.MAP_W,
            height: this.MAP_H,
            layers: [
                {
                    type: "tilelayer",
                    name: "Collision",
                    width: this.MAP_W,
                    height: this.MAP_H,
                    data: data
                },
                {
                    type: "objectgroup",
                    name: "Entities",
                    objects: objects
                }
            ]
        };
    }

    splitRect(rect) {
        if (rect.w <= this.MIN_RECT_SIZE * 2 && rect.h <= this.MIN_RECT_SIZE * 2) {
            this.rects.push(rect);
            return;
        }

        let splitH = false;
        let splitV = false;

        if (rect.w > this.MIN_RECT_SIZE * 2) splitV = true;
        if (rect.h > this.MIN_RECT_SIZE * 2) splitH = true;

        if (splitH && splitV) {
            if (this.rnd() > 0.5) splitH = false; else splitV = false;
        }

        if (splitV) {
            const splitX = this.randInt(rect.x + this.MIN_RECT_SIZE, rect.x + rect.w - this.MIN_RECT_SIZE);
            const r1 = { x: rect.x, y: rect.y, w: splitX - rect.x, h: rect.h };
            const r2 = { x: splitX, y: rect.y, w: rect.x + rect.w - splitX, h: rect.h };
            this.splitRect(r1);
            this.splitRect(r2);
        } else if (splitH) {
            const splitY = this.randInt(rect.y + this.MIN_RECT_SIZE, rect.y + rect.h - this.MIN_RECT_SIZE);
            const r1 = { x: rect.x, y: rect.y, w: rect.w, h: splitY - rect.y };
            const r2 = { x: rect.x, y: splitY, w: rect.w, h: rect.y + rect.h - splitY };
            this.splitRect(r1);
            this.splitRect(r2);
        } else {
            this.rects.push(rect);
        }
    }

    connectRooms(r1, r2) {
        let x1 = this.randInt(r1.x + 1, r1.x + r1.w - 1);
        let y1 = this.randInt(r1.y + 1, r1.y + r1.h - 1);
        let x2 = this.randInt(r2.x + 1, r2.x + r2.w - 1);
        let y2 = this.randInt(r2.y + 1, r2.y + r2.h - 1);

        // L字で繋ぐ
        if (this.rnd() > 0.5) {
            this.drawHLine(x1, x2, y1);
            this.drawVLine(y1, y2, x2);
        } else {
            this.drawVLine(y1, y2, x1);
            this.drawHLine(x1, x2, y2);
        }
    }

    drawHLine(x1, x2, y) {
        const start = Math.min(x1, x2);
        const end = Math.max(x1, x2);
        for (let x = start; x <= end; x++) {
            this.map[x][y] = 0;
        }
    }

    drawVLine(y1, y2, x) {
        const start = Math.min(y1, y2);
        const end = Math.max(y1, y2);
        for (let y = start; y <= end; y++) {
            this.map[x][y] = 0;
        }
    }
}
