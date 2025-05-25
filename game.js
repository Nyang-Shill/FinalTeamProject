// Get a reference to the canvas element and its 2D drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the dimensions of our canvas
canvas.width = 800;
canvas.height = 600;

// Log to console to confirm script is running
console.log("Game script loaded and canvas initialized!");

// Owner's Hand (Paddle) properties for Difficulty 4
const ownerHand = {
    // Fixed pivot point for the hand's rotation, usually the center of the canvas
    pivotX: canvas.width / 2,
    pivotY: canvas.height / 2,
    // Distance from the pivot to the center of the hand's drawing
    armLength: 100, // How far the hand extends from the center
    radius: 40,     // Size of the hand (as a circular paddle)
    color: 'brown',
    angle: 0        // Current rotation angle in radians
};

// Toy (Ball) properties (initial setup, will be spawned later)
const toy = {
    x: 50,
    y: 50,
    radius: 12,
    color: 'red',
    dx: 5,
    dy: 5
};

// Breakable items (simplified representation as rectangles)
let items = [
    // For now, let's place them around the center.
    { x: canvas.width / 2 - 120, y: canvas.height / 2 - 40, width: 60, height: 30, color: 'lightblue', type: '유리컵' },
    { x: canvas.width / 2 - 50, y: canvas.height / 2 - 70, width: 60, height: 30, color: 'lightgreen', type: '그릇' },
    { x: canvas.width / 2 + 20, y: canvas.height / 2 - 40, width: 60, height: 30, color: 'orange', type: '액자' },
    { x: canvas.width / 2 - 50, y: canvas.height / 2 + 10, width: 60, height: 30, color: 'purple', type: '택배박스' },
    { x: canvas.width / 2 - 120, y: canvas.height / 2 + 10, width: 60, height: 30, color: 'lightcoral', type: '시계' },
    { x: canvas.width / 2 - 50, y: canvas.height / 2 + 50, width: 60, height: 30, color: 'lightgoldenrodyellow', type: '화분' },
    { x: canvas.width / 2 + 20, y: canvas.height / 2 + 10, width: 60, height: 30, color: 'lightgray', type: '거울' },
    { x: canvas.width / 2 + 90, y: canvas.height / 2 + 10, width: 60, height: 30, color: 'lightpink', type: '조각상' }
];

// --- Mouse control for the owner's hand (updated for angle) ---
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate the angle from the pivot point to the mouse position
    // Math.atan2(y, x) returns the angle in radians between the x-axis and a point (x, y)
    ownerHand.angle = Math.atan2(mouseY - ownerHand.pivotY, mouseX - ownerHand.pivotX);

    // Update the hand's actual drawing position based on its angle and armLength
    ownerHand.x = ownerHand.pivotX + ownerHand.armLength * Math.cos(ownerHand.angle);
    ownerHand.y = ownerHand.pivotY + ownerHand.armLength * Math.sin(ownerHand.angle);
});


// --- Game Functions ---

// Draw function: Clears the canvas and draws all game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the central circle where items are located (for visual reference)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 200, 0, Math.PI * 2); // Example circle radius
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw owner's hand (represented as a circle)
    // Its position is now calculated based on pivot, armLength, and angle
    ctx.beginPath();
    ctx.arc(ownerHand.x, ownerHand.y, ownerHand.radius, 0, Math.PI * 2);
    ctx.fillStyle = ownerHand.color;
    ctx.fill();
    ctx.closePath();

    // Draw breakable items (rectangles with text)
    items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(item.type, item.x + 5, item.y + (item.height / 2) + 3);
    });

    // Draw toy
    ctx.beginPath();
    ctx.arc(toy.x, toy.y, toy.radius, 0, Math.PI * 2);
    ctx.fillStyle = toy.color;
    ctx.fill();
    ctx.closePath();
}
// --- Game Loop (Update function) ---
function update() {
    // --- Toy Movement ---
    toy.x += toy.dx;
    toy.y += toy.dy;

    // --- Bounce off walls ---
    if (toy.x + toy.radius > canvas.width || toy.x - toy.radius < 0) {
        toy.dx *= -1;
    }
    if (toy.y + toy.radius > canvas.height || toy.y - toy.radius < 0) {
        toy.dy *= -1;
    }

    // --- Basic collision detection between hand and toy ---
    // For now, let's keep the simple bounce for demonstration
    const distance = Math.sqrt(
        (toy.x - ownerHand.x)**2 + (toy.y - ownerHand.y)**2
    );

    if (distance < toy.radius + ownerHand.radius) {
        // Simple bounce: reverse direction
        toy.dx *= -1;
        toy.dy *= -1;

        // Prevent toy from getting stuck inside the paddle
        const overlap = (toy.radius + ownerHand.radius) - distance;
        const normalX = (toy.x - ownerHand.x) / distance;
        const normalY = (toy.y - ownerHand.y) / distance;
        toy.x += normalX * overlap;
        toy.y += normalY * overlap;
    }

    // --- Collision detection between toy and items ---
    items = items.filter(item => {
        const closestX = Math.max(item.x, Math.min(toy.x, item.x + item.width));
        const closestY = Math.max(item.y, Math.min(toy.y, item.y + item.height));

        const distanceX = toy.x - closestX;
        const distanceY = toy.y - closestY;

        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < (toy.radius * toy.radius)) {
            toy.dx *= -1;
            toy.dy *= -1;
            return false; // Item was hit, remove it
        }
        return true; // Item not hit, keep it
    });

    // --- Call draw and loop ---
    draw();
    requestAnimationFrame(update); // This line is likely game.js:117
} // This is the closing brace for the update function. Make sure it's here!

// Start the game loop
update();