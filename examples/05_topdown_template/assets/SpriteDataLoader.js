/**
 * 旧CVBaseの spdata.js / bgdata.js のスプライト定義を
 * GameCoreの SpriteSystem (pattern) 形式に変換して一括ロードするアダプター
 */
export class SpriteDataLoader {

    /**
     * 旧spdata配列を解析し、エンジンへパターン登録する
     * @param {GameCore} engine GameCoreインスタンス
     */
    static loadSpData(engine) {
        // 旧CVBase/content/asset/param/spdata.js からの移植データ
        const sp = [
            // ["SP NO.", "X", "Y", "W", "H"] (元データは ADDX, ADDY というキーで幅、高さを表現)
            ["Mayura1", 0, 0, 32, 32],
            ["Mayura2", 32, 0, 32, 32],
            ["Mayura3", 64, 0, 32, 32],
            ["Mayura4", 96, 0, 32, 32],
            ["Mayura1r", 0, 224, 32, 32],
            ["Mayura2r", 32, 224, 32, 32],
            ["Mayura3r", 64, 224, 32, 32],
            ["Mayura4r", 96, 224, 32, 32],
            ["Unyuu1", 128, 0, 32, 32],
            ["Unyuu2", 160, 0, 32, 32],
            ["Unyuu1r", 128, 224, 32, 32],
            ["Unyuu2r", 160, 224, 32, 32],
            ["Unyuu3", 192, 0, 32, 32], //BlueU
            // ... ここに必要なデータを追加していく（今回はテスト用に主要なものだけ）
            ["Fire1", 0, 32, 16, 16],
            ["Fire2", 16, 32, 16, 16],
            ["BallL1", 176, 80, 16, 16],
            ["BallL2", 192, 80, 16, 16],
            ["BallL3", 208, 80, 16, 16],
            ["Sword", 240, 48, 16, 48],
            ["Cursor1", 176, 32, 16, 16],
            ["Cursor2", 192, 32, 16, 16],
            ["Cursor3", 208, 32, 16, 16]
        ];

        // メイン画像キー名 (仮に全スプライトが cha という単一画像に収まっている前提)
        const imageKey = "cha";

        // パターンの登録
        sp.forEach(w => {
            const key = w[0];
            const x = w[1];
            const y = w[2];
            const width = w[3];
            const height = w[4];

            engine.sprite.setPattern(key, {
                imageKey: imageKey,
                frames: [
                    { x: x, y: y, w: width, h: height }
                ]
            });
        });

        // 汎用アイテム等のタイルセットからの生成 (setBG関数の移植)
        this._setBG(engine, imageKey, "_equip", 16, 10, 24, 24, 0, 0); // 開始位置X, Yは元データから推測または調査が必要
        this._setBG(engine, imageKey, "_item", 16, 17, 24, 24, 0, 240); // 仮の値

        // エイリアスの設定（手動でのマッピング）
        const getPtn = (id) => engine.sprite.patterns.get(id);
        const equip6 = getPtn("_equip_6");
        if (equip6) engine.sprite.setPattern("Knife", equip6);

        const equip24 = getPtn("_equip_24");
        if (equip24) engine.sprite.setPattern("Axe", equip24);

        const equip39 = getPtn("_equip_39");
        if (equip39) engine.sprite.setPattern("Bow", equip39);

        // ==========================================================
        // モーションパターン (アニメーション) の登録
        // ==========================================================
        // ==========================================================
        const motions = {
            "Mayura_Down": { wait: 18, pattern: [["Mayura1", 0, 0], ["Mayura2", 0, 0], ["Mayura3", 0, 0], ["Mayura4", 0, 0]] },
            "Mayura_Left": { wait: 18, pattern: [["Mayura1", 2, 0], ["Mayura2", 2, 0], ["Mayura3", 2, 0], ["Mayura4", 2, 0]] },
            "Mayura_Right": { wait: 18, pattern: [["Mayura1r", 0, 0], ["Mayura2r", 0, 0], ["Mayura3r", 0, 0], ["Mayura4r", 0, 0]] },
            "Mayura_Up": { wait: 18, pattern: [["Mayura1r", 2, 0], ["Mayura2r", 2, 0], ["Mayura3r", 2, 0], ["Mayura4r", 2, 0]] },
            "Item_Heal": { wait: 10, pattern: [["BallL1", 0, 0], ["BallL2", 0, 0], ["BallL3", 0, 0], ["BallL2", 0, 0]] }
        };

        for (const [motionName, motionData] of Object.entries(motions)) {
            const frames = [];
            for (const p of motionData.pattern) {
                const spName = p[0];
                const mirror = p[1]; // 0: normal, 1: vertical, 2: horizontal
                const basePtn = getPtn(spName);
                if (basePtn && basePtn.frames[0]) {
                    const bf = basePtn.frames[0];
                    frames.push({
                        x: bf.x, y: bf.y, w: bf.w, h: bf.h,
                        fh: mirror === 2, // horizontal flip
                        fv: mirror === 1  // vertical flip
                    });
                }
            }
            if (frames.length > 0) {
                engine.sprite.setPattern(motionName, {
                    imageKey: imageKey,
                    wait: motionData.wait,
                    frames: frames
                });
            }
        }

        console.log("SpriteDataLoader: Loaded SP and Motion patterns.");
    }

    /**
     * 旧bgdata配列を解析し、エンジンへパターン登録する
     * @param {GameCore} engine 
     */
    static loadBgData(engine) {
        const bg = [
            // ["ID/Name", "X", "Y", "W", "H"]
            // bgdata 0, 1 は96x96の巨大テクスチャなので、2, 3 の32x32テクスチャを基準として使用する
            ["Floor", 128 - 96, 128 - 128, 32, 32], //2, 32,0 床32，32 (元データは 31x31 指定だが32x32として切り出す)
            ["Wall", 224 - 96, 128 - 128, 32, 32],  //3, 128,0 壁32x32
            ["LowWall", 0, 64, 32, 32],             //12, 0,64 低い壁(BGNo.12)
        ];

        const imageKey = "bg1";

        bg.forEach(w => {
            const key = w[0];
            engine.sprite.setPattern(key, {
                imageKey: imageKey,
                frames: [
                    { x: w[1], y: w[2], w: w[3], h: w[4] }
                ]
            });
        });

        // MapLoader 用に数値 ID（TiledのtileId等）でのエイリアスを貼る
        const wallPtn = engine.sprite.patterns.get("Wall");
        if (wallPtn) engine.sprite.setPattern(1, wallPtn); // ID 1 は Wall とする

        const lowWallPtn = engine.sprite.patterns.get("LowWall");
        if (lowWallPtn) engine.sprite.setPattern(2, lowWallPtn); // ID 2 は LowWall とする

        console.log("SpriteDataLoader: Loaded BG patterns.");
    }

    /**
     * グリッド状の画像を一括で切り出して名前付きで登録するヘルパー
     */
    static _setBG(engine, imageKey, assetName, col, row, w, h, startX = 0, startY = 0) {
        let c = 0;
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                const key = `${assetName}_${c}`;
                engine.sprite.setPattern(key, {
                    imageKey: imageKey,
                    frames: [
                        { x: startX + j * w, y: startY + i * h, w: w, h: h }
                    ]
                });
                c++;
            }
        }
    }
}
