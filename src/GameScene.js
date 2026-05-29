class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('blue_body_circle', 'assets/blue_body_circle.png');
        this.load.image('blue_body_rhombus', 'assets/blue_body_rhombus.png');
        this.load.image('blue_body_square', 'assets/blue_body_square.png');
        this.load.image('green_body_circle', 'assets/green_body_circle.png');
        this.load.image('green_body_rhombus', 'assets/green_body_rhombus.png');
        this.load.image('green_body_square', 'assets/green_body_square.png');
        this.load.image('pink_body_circle', 'assets/pink_body_circle.png');
        this.load.image('pink_body_rhombus', 'assets/pink_body_rhombus.png');
        this.load.image('pink_body_square', 'assets/pink_body_square.png');
        this.load.image('purple_body_circle', 'assets/purple_body_circle.png');
        this.load.image('purple_body_rhombus', 'assets/purple_body_rhombus.png');
        this.load.image('purple_body_square', 'assets/purple_body_square.png');
        this.load.image('red_body_circle', 'assets/red_body_circle.png');
        this.load.image('red_body_rhombus', 'assets/red_body_rhombus.png');
        this.load.image('yellow_body_circle', 'assets/yellow_body_circle.png');
        this.load.image('yellow_body_rhombus', 'assets/yellow_body_rhombus.png');
        this.load.image('yellow_body_square', 'assets/yellow_body_square.png');

        this.load.image('face_smile', 'assets/face_smile_open_eye.png');
        this.load.image('face_smile_2', 'assets/face_smile_open_eye_2.png');
        this.load.image('face_smile_3', 'assets/face_smile_open_eye_3.png');
        this.load.image('face_smile_closed', 'assets/face_smile_closed_eye.png');
        this.load.image('face_frown', 'assets/face_frown_open_eye.png');
        this.load.image('face_frown_2', 'assets/face_frown_open_eye_2.png');
        this.load.image('face_frown_closed', 'assets/face_frown_closed_eye.png');
        this.load.image('face_frown_closed_2', 'assets/face_frown_closed_eye_2.png');
        this.load.image('face_grimace', 'assets/face_grimace_open_eye.png');
    }

    create() {
        this.score = 0;
        this.timeLeft = 30;
        this.faces = [];
        this.faceGroup = this.add.group();
        this.smileKeys = ['face_smile', 'face_smile_2', 'face_smile_3', 'face_smile_closed'];
        this.frownKeys = ['face_frown', 'face_frown_2', 'face_frown_closed', 'face_frown_closed_2', 'face_grimace'];
        this.bodyKeys = [
            'blue_body_circle', 'blue_body_rhombus', 'blue_body_square',
            'green_body_circle', 'green_body_rhombus', 'green_body_square',
            'pink_body_circle', 'pink_body_rhombus', 'pink_body_square',
            'purple_body_circle', 'purple_body_rhombus', 'purple_body_square',
            'red_body_circle', 'red_body_rhombus',
            'yellow_body_circle', 'yellow_body_rhombus', 'yellow_body_square'
        ];

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#000' });
        this.timerText = this.add.text(16, 46, 'Time: 30', { fontSize: '24px', fill: '#000' });

        this.spawnFaces();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            },
            loop: true
        });
    }

    spawnFaces() {
        this.faces.forEach(f => f.container.destroy());
        this.faces = [];
        this.faceGroup.clear();

        const count = 10;
        const padding = 60;
        const placed = [];

        for (let i = 0; i < count; i++) {
            const isSmile = i < Math.ceil(count / 2);
            const faceKey = Phaser.Utils.Array.GetRandom(isSmile ? this.smileKeys : this.frownKeys);
            const bodyKey = Phaser.Utils.Array.GetRandom(this.bodyKeys);

            let x, y, attempts = 0;
            do {
                x = Phaser.Math.Between(padding, 800 - padding);
                y = Phaser.Math.Between(padding + 30, 600 - padding);
                attempts++;
            } while (attempts < 50 && placed.some(p => Phaser.Math.Distance.Between(p.x, p.y, x, y) < 90));
            placed.push({ x, y });

            const container = this.add.container(x, y);
            const body = this.add.image(0, 0, bodyKey);
            const face = this.add.image(0, 0, faceKey);
            container.add([body, face]);
            container.setSize(body.width, body.height);
            container.setInteractive();

            const entry = { container, isSmile, clicked: false };
            this.faces.push(entry);
            this.faceGroup.add(container);

            container.on('pointerdown', () => {
                if (entry.clicked || this.timeLeft <= 0) return;
                entry.clicked = true;

                if (entry.isSmile) {
                    this.score++;
                    this.cameras.main.shake(80, 0.003);
                } else {
                    this.score--;
                    this.cameras.main.shake(150, 0.008);
                    container.each(c => c.setTint(0xff0000));
                    this.time.delayedCall(200, () => container.each(c => c.clearTint()));
                }

                container.each(c => c.setAlpha(0.3));
                this.scoreText.setText('Score: ' + this.score);

                if (this.faces.filter(f => f.isSmile && !f.clicked).length === 0) {
                    this.time.delayedCall(400, () => this.spawnFaces());
                }
            });
        }
    }

    endGame() {
        this.timerEvent.remove(false);
        this.faces.forEach(f => f.container.destroy());
        this.faces = [];
        this.scoreText.destroy();
        this.timerText.destroy();

        this.add.text(400, 220, 'Time\'s Up!', { fontSize: '48px', fill: '#000' }).setOrigin(0.5);
        this.add.text(400, 290, 'Final Score: ' + this.score, { fontSize: '36px', fill: '#000' }).setOrigin(0.5);

        const btnBg = this.add.rectangle(400, 370, 200, 50, 0x4a90d9).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(400, 370, 'Play Again', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x357abd));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x4a90d9));
        btnBg.on('pointerdown', () => this.scene.restart());
    }
}
