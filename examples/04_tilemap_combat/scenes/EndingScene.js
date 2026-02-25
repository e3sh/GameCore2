import { BaseScene } from '../../../src/logic/scene/SceneSystem.js';
import { UILabel } from '../../../src/logic/ui/UILabel.js';
import { TitleScene } from './TitleScene.js';

export class EndingScene extends BaseScene {
    init() {
        this.uiRoot = new UILabel("CONGRATULATIONS!");
        this.uiRoot.x = 320;
        this.uiRoot.y = 150;
        this.uiRoot.align = "center";
        this.uiRoot.fontSize = 48;
        this.uiRoot.color = "#ff0";

        this.msg = new UILabel("YOU HAVE COMPLETED THE MISSION");
        this.msg.x = 0;
        this.msg.y = 80;
        this.msg.align = "center";
        this.msg.fontSize = 24;
        this.msg.color = "#fff";
        this.uiRoot.addChild(this.msg);

        this.subTitle = new UILabel("PRESS SELECT TO RETURN TO TITLE");
        this.subTitle.x = 0;
        this.subTitle.y = 150;
        this.subTitle.align = "center";
        this.subTitle.fontSize = 18;
        this.subTitle.color = "#aaa";
        this.uiRoot.addChild(this.subTitle);

        this.timer = 0;
    }

    onEnter() {
        // クリア画面表示の際、ゲーム本編のエンティティ（敵やマップ）を消去する
        this.engine.entities.clear();
    }

    update(dt) {
        this.timer += dt;
        this.subTitle.visible = Math.floor(this.timer / 500) % 2 === 0;

        if (this.engine.input.isPressed('Select')) {
            this.engine.scenes.replace(new TitleScene(this.engine));
        }

        this.uiRoot.update(dt, this.engine);
    }

    draw(display) {
        // 背景色（少し青みのある黒）
        const ctx = display.getLayer(0).ctx;
        ctx.fillStyle = "#001";
        ctx.fillRect(0, 0, display.width, display.height);

        // シンプルな星空っぽい点
        ctx.fillStyle = "#fff";
        for (let i = 0; i < 50; i++) {
            let x = (Math.sin(i * 123.45) * 0.5 + 0.5) * display.width;
            let y = (Math.cos(i * 678.90) * 0.5 + 0.5) * display.height;
            ctx.fillRect(x, y, 1, 1);
        }

        this.uiRoot.draw(display);
    }
}
