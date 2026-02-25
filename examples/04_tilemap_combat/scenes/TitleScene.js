import { BaseScene } from '../../../src/logic/scene/SceneSystem.js';
import { UILabel } from '../../../src/logic/ui/UILabel.js';
import { UIButton } from '../../../src/logic/ui/UIButton.js';
import { GameScene } from './GameScene.js';

export class TitleScene extends BaseScene {
    init() {
        this.uiRoot = new UILabel("TILEMAP & COMBAT");
        this.uiRoot.x = 320;
        this.uiRoot.y = 120;
        this.uiRoot.align = "center";
        this.uiRoot.fontSize = 48;
        this.uiRoot.color = "#0ff";

        this.subTitle = new UILabel("PRESS START / SPACE");
        this.subTitle.x = 0;
        this.subTitle.y = 100;
        this.subTitle.align = "center";
        this.subTitle.fontSize = 20;
        this.subTitle.color = "#fff";
        this.uiRoot.addChild(this.subTitle);

        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;
        // 点滅エフェクト
        this.subTitle.visible = Math.floor(this.timer / 500) % 2 === 0;

        if (this.engine.input.isPressed('Select')) {
            console.log("Start Game!");
            this.engine.entities.clear(); // 念のためクリア
            this.engine.scenes.replace(new GameScene(this.engine));
        }

        this.uiRoot.update(dt, this.engine);
    }

    draw(display) {
        // 背景色（黒）
        display.getLayer(0).ctx.fillStyle = "#000";
        display.getLayer(0).ctx.fillRect(0, 0, display.width, display.height);

        this.uiRoot.draw(display);
    }
}
