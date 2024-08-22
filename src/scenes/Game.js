import { Scene } from "phaser";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  create() {
    // Mitad del ancho y la altura
    let halfWidth = this.game.config.width/2;
    let halfHeight = this.game.config.height/2;

    // Circulo
    let circle = this.add.circle(halfWidth, halfHeight, 8, 0xbbbbbb, 1.0);

    // añadir físicas
    this.physics.add.existing(circle);

    // Acceder al cuerpo del circulo
    let circleBody = circle.body;

    // Configurar el cuerpo de físicas
    circleBody.setCircle(8);

    // Establecer la velocidad del círculo
    circleBody.setVelocity(0, 300);

    // Establecer colisión con el mundo
    circleBody.setCollideWorldBounds(true);

    // Ajustar el rebote para que no pierda velocidad
    circleBody.setBounce(1, 1);

    // Ajustar la fricción para que no pierda velocidad
    circleBody.setDamping(false);
    circleBody.setDrag(0, 0);
    
    // Crear el Rectángulo
    let rectWidth = this.game.config.width / 5.4;
    let rectHeight = 15;
    let rectX = rectWidth / 2;
    let rectY = this.game.config.height * 5/6;

    // La pala de movimiento
    let shovel = this.add.rectangle(rectX, rectY, rectWidth, rectHeight, 0xbbbbbb);
    this.physics.add.existing(shovel);
    let rectBody = shovel.body;
    rectBody.setImmovable(true);
    rectBody.setCollideWorldBounds(true);

    // Añadir colisión entre el círculo y el rectángulo
    this.physics.add.collider(circle, shovel, this.handleCollision, null, this);


    // Crear obstáculos rectangulares en la mitad superior de la pantalla
    this.obstacles = this.physics.add.group();

    for (let i = 0; i < 8; i++) {
      let obstacleX = 100 + i * 90;
      let obstacleY = 50 + Math.random() * (this.game.config.height / 2 - 90);
      let obstacle = this.add.rectangle(obstacleX, obstacleY, 70, 20, 0xff0000);
      this.physics.add.existing(obstacle);
      obstacle.body.setImmovable(true);
      this.obstacles.add(obstacle);
    }

    // Añadir colisión entre el círculo y los obstáculos
    this.physics.add.collider(circle, this.obstacles, this.handleObstacleCollision, null, this);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.shovel = shovel; // Guardar referencia a la pala
    this.circle = circle; // Guardar referencia al círculo
  }

  handleCollision(circle, shovel) {
    // Obtener la posición relativa del punto de colisión
    let relativeX = circle.x - shovel.x;

    // Calcular el porcentaje de la posición relativa
    let percent = relativeX / (shovel.width / 2);

    // Ajustar la velocidad del círculo basado en la posición relativa
    circle.body.setVelocityX(circle.body.velocity.x + percent * 200);
  }

  handleObstacleCollision(circle, obstacle) {
    // Destruir el obstáculo
    obstacle.destroy();

    // Obtener la posición relativa del punto de colisión
    let relativeX = circle.x - obstacle.x;
    let relativeY = circle.y - obstacle.y;

    // Calcular el porcentaje de la posición relativa
    let percentX = relativeX / (obstacle.width / 2);
    let percentY = relativeY / (obstacle.height / 2);

    // Ajustar la velocidad del círculo basado en la posición relativa
    circle.body.setVelocityX(circle.body.velocity.x + percentX * 200);
    circle.body.setVelocityY(circle.body.velocity.y + percentY * 200);
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
