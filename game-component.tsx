import React, { useRef, useEffect, useState } from 'react';

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Game state
    let coins: { x: number; y: number; radius: number; speed: number }[] = [];
    const player = { x: canvas.width / 2, y: canvas.height - 30, radius: 20 };
    let gameSpeed = 1;

    // Game loop
    const render = () => {
      if (gameOver) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw player
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'blue';
      ctx.fill();

      // Draw and update coins
      coins.forEach((coin, index) => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'gold';
        ctx.fill();

        // Move coin down
        coin.y += coin.speed * gameSpeed;

        // Check collision with player
        const dx = player.x - coin.x;
        const dy = player.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + coin.radius) {
          // Collision detected
          coins.splice(index, 1);
          setScore(prevScore => {
            const newScore = prevScore + 1;
            // Increase game speed based on score
            gameSpeed = 1 + Math.floor(newScore / 10) * 0.1;
            return newScore;
          });
        }

        // Game over if coin reaches bottom
        if (coin.y > canvas.height + coin.radius) {
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
        }
      });

      // Spawn new coins randomly
      if (Math.random() < 0.02 * gameSpeed) {
        coins.push({
          x: Math.random() * canvas.width,
          y: -20,
          radius: 10,
          speed: 2 + Math.random() * 2 // Varying speeds
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Event listener for mouse movement
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      player.x = event.clientX - rect.left;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameOver]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-2xl font-bold mb-4">Score: {score}</div>
      <div className="text-xl mb-4">High Score: {highScore}</div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300"
      />
      {gameOver && (
        <div className="mt-4">
          <p className="text-2xl font-bold mb-2">Game Over!</p>
          <button 
            onClick={resetGame}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
