export class GameState {
    constructor() {
        this.INITIAL_HP = 10;

        this.item = {};
        this.itemstack = [];
        this.nowstage = 0;
        this.cold = false;

        this.player = new StatePlayer(this.INITIAL_HP);

        this.outviewCollision = true;

        this.keyon = false;
        this.key_x = 0;
        this.key_y = 0;

        this.lamp = false;
        this.map = false;
        this.armlock = false;

        this.mode = 0;
        this.score = 0;
    }

    reset() {
        this.item = {};
        this.itemstack = [];
        this.player = new StatePlayer(this.INITIAL_HP);
    }
}

class StatePlayer {
    constructor(initialHp) {
        this.zanki = 2;
        this.hp = initialHp;
        this.maxhp = initialHp;
        this.weapon = 0; // 0:wand
        this.speed = 6;
        this.level = 0;
        this.hasDoubleJump = false;
        this.stack = [];

        this.spec = new StateSpec();
        this.base = new StateSpec();
        this.enh = new StateSpec();
    }
}

class StateSpec {
    constructor() {
        this.LV = 0;
        this.HP = 0;
        this.MP = 0;
        this.STR = 0;
        this.DEX = 0;
        this.AGI = 0;
        this.VIT = 0;
        this.INT = 0;
        this.MND = 0;
        this.LAK = 0;
        this.ETC = 0;
    }

    Set(statusArray) {
        if (!statusArray || statusArray.length < 11) return;
        this.LV = statusArray[0];
        this.HP = statusArray[1];
        this.MP = statusArray[2];
        this.STR = statusArray[3];
        this.DEX = statusArray[4];
        this.AGI = statusArray[5];
        this.VIT = statusArray[6];
        this.INT = statusArray[7];
        this.MND = statusArray[8];
        this.LAK = statusArray[9];
        this.ETC = statusArray[10];
    }

    Read() {
        return [
            this.LV, this.HP, this.MP,
            this.STR, this.DEX, this.AGI,
            this.VIT, this.INT, this.MND,
            this.LAK, this.ETC
        ];
    }

    Reset() {
        this.LV = 0; this.HP = 0; this.MP = 0;
        this.STR = 0; this.DEX = 0; this.AGI = 0;
        this.VIT = 0; this.INT = 0; this.MND = 0;
        this.LAK = 0; this.ETC = 0;
    }
}
