import { BaseScene } from '../../../src/logic/scene/SceneSystem.js';
import { UILabel } from '../../../src/logic/ui/UILabel.js';
import { GameScene } from './GameScene.js';

export class TitleScene extends BaseScene {
    init() {
        this.engine.entities.clear();
        this.engine.sprite.clear();
        this.engine.particles.clear();

        // 状態のリセット（新しいゲームが常にフロア1から始まるようにする）
        if (this.engine.globalState) {
            this.engine.globalState.stageno = 1;
            this.engine.globalState.playerData = null;
        }

        this.uiRoot = new UILabel("TOP-DOWN ACTION");
        this.uiRoot.x = 160;
        this.uiRoot.y = 80;
        this.uiRoot.align = "center";
        this.uiRoot.fontSize = 24;
        this.uiRoot.color = "#f0f"; // もとの DSFL は 0ff ですが、CVっぽく

        this.subTitle = new UILabel("PRESS START / SPACE");
        this.subTitle.x = 0;
        this.subTitle.y = 60;
        this.subTitle.align = "center";
        this.subTitle.fontSize = 14;
        this.subTitle.color = "#fff";
        this.uiRoot.addChild(this.subTitle);

        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;
        // 点滅エフェクト
        this.subTitle.visible = Math.floor(this.timer / 500) % 2 === 0;

        // cv_clone の入力マッピング (action1 or Select)
        if (this.engine.input.isPressed('action1') || this.engine.input.isPressed('Select')) {
            console.log("Start Game!");
            this.engine.scenes.replace(new GameScene(this.engine));
        }

        this.uiRoot.update(dt, this.engine);
    }

    draw(display) {
        // 背景色（黒）は最背面レイヤーで
        const bgLayer = display.getLayer(0);
        bgLayer.ctx.fillStyle = "#000";
        bgLayer.ctx.fillRect(0, 0, display.width, display.height);

        // UIは Layer 1
        this.uiRoot.draw(display, 1);
    }
}
