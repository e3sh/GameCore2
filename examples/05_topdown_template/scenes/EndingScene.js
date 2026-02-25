import { BaseScene } from '../../../src/logic/scene/SceneSystem.js';
import { UILabel } from '../../../src/logic/ui/UILabel.js';

export class EndingScene extends BaseScene {
    init() {
        // 前シーンのエンティティとスプライトをクリア
        this.engine.entities.clear();
        this.engine.sprite.clear();
        this.engine.particles.clear();

        this.uiRoot = new UILabel("CONGRATULATIONS!");
        this.uiRoot.x = 160;
        this.uiRoot.y = 80;
        this.uiRoot.align = "center";
        this.uiRoot.fontSize = 24;
        this.uiRoot.color = "#ff0";

        this.message = new UILabel("YOU CLEARED THE DUNGEON!");
        this.message.x = 0;
        this.message.y = 40;
        this.message.align = "center";
        this.message.fontSize = 14;
        this.message.color = "#fff";
        this.uiRoot.addChild(this.message);

        this.subTitle = new UILabel("PRESS START TO RETURN");
        this.subTitle.x = 0;
        this.subTitle.y = 80;
        this.subTitle.align = "center";
        this.subTitle.fontSize = 12;
        this.subTitle.color = "#aaa";
        this.uiRoot.addChild(this.subTitle);

        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;
        this.subTitle.visible = Math.floor(this.timer / 500) % 2 === 0;

        if (this.engine.input.isPressed('action1') || this.engine.input.isPressed('Select')) {
            // タイトルに戻る（一旦リロードに近い形か、Sceneのreplace）
            // タイトルシーンをロードするために動的インポートするか、事前にメインで定義されたものを参照する
            import('./TitleScene.js').then(m => {
                this.engine.scenes.replace(new m.TitleScene(this.engine));
            });
        }

        this.uiRoot.update(dt, this.engine);
    }

    draw(display) {
        // 背景色
        const bgLayer = display.getLayer(0);
        bgLayer.ctx.fillStyle = "#002200";
        bgLayer.ctx.fillRect(0, 0, display.width, display.height);

        // UIは Layer 1
        this.uiRoot.draw(display, 1);
    }
}
