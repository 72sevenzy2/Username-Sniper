const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
class Ball {
    constructor(x, y, radius, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.vx *= -1;
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.vy *= -1;
        }

        this.draw();
    }
}

const ball1 = new Ball(300, 390, 100, "white", 3, 2);
const ball2 = new Ball(200, 200, 100, "white", 2, 5);
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ball1.update();
    ball2.update();

    requestAnimationFrame(animate);
}

animate();