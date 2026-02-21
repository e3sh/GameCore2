import { BaseScene } from '../../../src/logic/scene/SceneSystem.js';
import { UILabel } from '../../../src/logic/ui/UILabel.js';
import { UIButton } from '../../../src/logic/ui/UIButton.js';
import { GameScene } from './GameScene.js';

export class TitleScene extends BaseScene {
    init() {
        this.uiRoot = new UILabel("PROJECT DSFL");
        this.uiRoot.x = 320;
        this.uiRoot.y = 100;
        this.uiRoot.align = "center";
        this.uiRoot.fontSize = 40;
        this.uiRoot.color = "#0ff";

        const startBtn = new UIButton("START GAME", () => {
            console.log("Start clicked!");
            this.engine.scenes.replace(new GameScene(this.engine));
        });
        startBtn.x = -100;
        startBtn.y = 120;
        startBtn.width = 200;
        startBtn.height = 50;

        const exitBtn = new UIButton("EXIT", () => {
            window.close();
        });
        exitBtn.x = -100;
        exitBtn.y = 190;
        exitBtn.width = 200;
        exitBtn.height = 50;

        this.uiRoot.addChild(startBtn);
        this.uiRoot.addChild(exitBtn);
    }

    update(dt) {
        if (!this.engine) console.error("TitleScene.update: this.engine IS UNDEFINED!");
        this.uiRoot.update(dt, this.engine);
    }

    draw(display) {
        this.uiRoot.draw(display);
    }
}
