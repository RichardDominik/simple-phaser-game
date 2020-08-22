var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};


var score = 0;
var scoreText;
var numberOfBombs = 0;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'assets/bg001.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('zemicka', 'assets/ground.png');
    this.load.image('jump', 'assets/jump.png');
    this.load.image('star', 'assets/cupcake2.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.image('wall', 'assets/wall.png');
    this.load.spritesheet('sprite',
        'assets/sprite.png',
        { frameWidth: 16, frameHeight: 16 }
    );

    this.physics.world.bounds.width = 720 * 4;
    this.physics.world.bounds.height = 800;
}

function create() {

    this.cameras.main.setBounds(0, 0, 720 * 4, 176);

    var sky = this.add.image(400, 300, 'sky');
    sky.setScrollFactor(0)

    scoreText = this.add.text(320, 16, 'Score: 0 ', { fontSize: '32px', fill: '#000', align: 'center' });

    stars = this.physics.add.group({
        key: 'star',
        repeat: 18,
        setXY: { x: 18, y: 0, stepX: 150 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setScale(0.1);
    });


    platforms = this.physics.add.staticGroup();
    trees = this.physics.add.staticGroup();
    walls = this.physics.add.staticGroup();

    buildGround(platforms)

    platforms.create(600, 420, 'jump');
    platforms.create(400, 460, 'jump');
    platforms.create(200, 280, 'jump');
    platforms.create(480, 200, 'jump');
    platforms.create(850, 250, 'jump');
    platforms.create(990, 400, 'jump');
    platforms.create(1050, 100, 'jump');
    platforms.create(1120, 280, 'jump');
    platforms.create(1350, 280, 'jump');

    trees.create(650, 550, 'tree');
    trees.create(60, 550, 'tree');

    walls.create(730, 320, 'wall');
    walls.create(1250, 150, 'wall');



    player = this.physics.add.sprite(100, 450, 'sprite');
    player.setScale(2);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(300);

    this.cameras.main.startFollow(player, true);


    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, trees);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(stars, trees);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.collider(player, walls, hitBomb, null, this);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('sprite', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'sprite', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('sprite', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    if (this.cameras.main.deadzone) {
        graphics = this.add.graphics().setScrollFactor(0);
        graphics.lineStyle(2, 0x00ff00, 1);
        graphics.strokeRect(200, 200, this.cameras.main.deadzone.width, this.cameras.main.deadzone.height);
    }
}

function update() {
    var cam = this.cameras.main;

    cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.flipX = true;

    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        player.flipX = false;

    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-480);
    }

    scoreText.x = player.body.position.x - 80;
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    setInterval(function () {
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 720 * 4);

        if (numberOfBombs < 5) {
            var bomb = bombs.create(x, 16, 'bomb').setScale(2);
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            numberOfBombs++;
        }
    }, 5000);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

function buildGround(platforms) {
    for (let i = 20; i <= 2900; i += 40) {
        platforms.create(i, 588, 'zemicka').refreshBody();
    }
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}