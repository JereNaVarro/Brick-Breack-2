export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
    this.ballSpeed = 400; // Velocidad inicial de la pelota
    this.score = 0
  }

  create() {
    // Realizar una solicitud al servidor JSON
    fetch("http://localhost:5500/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        data.forEach((post) => {
          this.add.text(
            100,
            100 + post.id * 20,
            `${post.title} by ${post.author}`,
            { font: "16px Arial", fill: "#ffffff" }
          );
        });
      })
      .catch((error) => {
        console.error("Error al cargar los datos:", error);
      });

    this.createBallAndShovel();
    this.createObstacles();
    this.createCollisions();

    this.cursor = this.input.keyboard.createCursorKeys();

    // Escuchar el evento de colisión con el límite inferior del mundo
    this.physics.world.on("worldbounds", this.handleWorldBounds, this);

    // Habilitar la detección de colisiones con los bordes del mundo
    this.ball.body.setCollideWorldBounds(true, 1, 1, true);

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#ffffff",
    });
  }

  createBallAndShovel() {
    // Crear la pelota
    let halfWidth = this.game.config.width / 2;
    let halfHeight = this.game.config.height / 2;
    this.ball = this.add.circle(halfWidth, halfHeight, 8, 0xbbbbbb, 1.0);
    this.physics.add.existing(this.ball);
    this.ball.body.setCircle(8);
    this.ball.body.setVelocity(0, this.ballSpeed);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.setBounce(1, 1);
    this.ball.body.setMaxSpeed(this.ballSpeed);
    this.ball.body.setAllowGravity(false);

    // Crear la pala
    let rectWidth = this.game.config.width / 5.4;
    let rectHeight = 15;
    let rectX = rectWidth * 2.7;
    let rectY = (this.game.config.height * 5) / 6;
    this.shovel = this.add.rectangle(
      rectX,
      rectY,
      rectWidth,
      rectHeight,
      0xbbbbbb
    );
    this.physics.add.existing(this.shovel);
    this.shovel.body.setImmovable(true);
    this.shovel.body.setCollideWorldBounds(true);

    // Inicializar la velocidad actual de la paleta
    this.shovel.body.currentSpeed = 0;
  }

  createObstacles() {
    // Crear obstáculos rectangulares de varios colores
    this.obstacles = this.physics.add.group();
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]; // Colores variados

    for (let i = 0; i < 40; i++) {
      let obstacleX = 90 + (i % 8) * 120;
      let obstacleY = 50 + Math.floor(i / 8) * 40;
      let color = colors[Math.floor(Math.random() * colors.length)];
      let obstacle = this.add.rectangle(obstacleX, obstacleY, 100, 30, color);
      this.physics.add.existing(obstacle);
      obstacle.body.setImmovable(true);
      obstacle.body.setBounce(1, 1);
      this.obstacles.add(obstacle);
    }
  }

  createCollisions() {
    // Colisiones entre la pelota y la pala
    this.physics.add.collider(
      this.ball,
      this.shovel,
      this.handleShovelCollision,
      null,
      this
    );

    // Colisiones entre la pelota y los obstáculos
    this.physics.add.collider(
      this.ball,
      this.obstacles,
      this.handleObstacleCollision,
      null,
      this
    );
  }

  handleShovelCollision(ball, shovel) {
    // Si la pala está en movimiento, enviar la pelota en línea recta hacia arriba
    if (shovel.body.velocity.x !== 0) {
      ball.body.setVelocityY(-this.ballSpeed); // Asegurarse de que la pelota va hacia arriba
      ball.body.setVelocityX(0); // La pelota sigue recta
    }
    // Si la pala está quieta, el rebote es como si fuera un borde normal
    else {
      // Dejar que la física estándar maneje el rebote
      let relativeX = ball.x - shovel.x;
      let percent = relativeX / (shovel.width / 2);
      ball.body.setVelocityX(ball.body.velocity.x + percent * 200);
    }
  }

  handleObstacleCollision(ball, obstacle) {
    let speed = this.ballSpeed;
    ball.body.setVelocity(
      ball.body.velocity.x < 0 ? -speed : speed,
      ball.body.velocity.y < 0 ? -speed : speed
    );

    obstacle.destroy(); // Destruir el obstáculo

    // Incrementar el puntaje y actualizar el texto en pantalla
    this.score += 1;
    this.scoreText.setText("Score: " + this.score);

    // Comprobar si todos los obstáculos han sido destruidos
    if (this.obstacles.countActive(true) === 0) {
      this.resetLevel(); // Reiniciar nivel si todos los obstáculos son destruidos
    }
  }

  resetLevel() {
    this.ballSpeed *= 1.1; // Incrementar la velocidad de la pelota un 10%
    this.ball.setVelocity(0, this.ballSpeed); // Restablecer la velocidad de la pelota

    // Crear nuevos obstáculos
    this.createObstacles();
  }

  // Este método se llama cuando la pelota toca el borde del mundo
  handleWorldBounds(body, up, down, left, right) {
    if (down) {
      // Si la colisión es con el borde inferior
      window.location.reload(); // Reiniciar la página
    }
  }

  update() {
    let rectBody = this.shovel.body; // Acceder al cuerpo de la pala

    if (this.cursor.left.isDown) {
      rectBody.setVelocityX(-350);
    } else if (this.cursor.right.isDown) {
      rectBody.setVelocityX(350);
    } else {
      rectBody.setVelocityX(0);
    }
  }
}
