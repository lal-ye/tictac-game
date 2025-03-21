import AIPlayer from './ai.js'; // Import the AIPlayer class

// ----- GAME LOGIC MODULE -----
const gameModule = (() => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');
    const statusIcon = document.createElement('span');
    status.prepend(statusIcon);

    let currentPlayer = 'X';
    let gameActive = true;
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let aiPlayer = null; // Instance of AIPlayer
    let gameMode = 'single'; // 'single' or 'two'
    let aiDifficulty = 'medium'; // 'easy', 'medium', or 'hard'

    // Add UI elements for mode and difficulty selection (before createBoard)
    const modeSelect = document.createElement('select');
    modeSelect.id = "modeSelect"
    modeSelect.innerHTML = `
        <option value="single">Single Player</option>
        <option value="two">Two Player</option>
    `;
    modeSelect.addEventListener('change', handleModeChange);
    document.getElementById('gameContainer').insertBefore(modeSelect, status); // Add before status

    const difficultySelect = document.createElement('select');
    difficultySelect.id = 'difficultySelect';
    difficultySelect.innerHTML = `
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
    `;
        difficultySelect.addEventListener('change', handleDifficultyChange);

    document.getElementById('gameContainer').insertBefore(difficultySelect, status);
    //Initially the difficulty select will be hidden
    difficultySelect.style.display = 'none';



    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function createBoard() {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('aria-label', `Cell ${i + 1}`);
            cell.setAttribute('tabindex', '0');
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('keydown', handleKeyPress);
            board.appendChild(cell);
        }
        startGame(); // Start the game (handles AI setup)
    }
    function handleModeChange(event){
        gameMode = event.target.value;
        if(gameMode === 'single'){
            difficultySelect.style.display = 'block'
        }
        else{
             difficultySelect.style.display = 'none'
        }
        resetGame();
    }
    function handleDifficultyChange(event){
        aiDifficulty = event.target.value;
        resetGame(); // Restart the game with the new difficulty
    }

    function startGame() {
        resetGame(); // Initialize the game
        if (gameMode === 'single') {
            aiPlayer = new AIPlayer(aiDifficulty, 'O'); // Create AI with chosen difficulty
            if (currentPlayer === 'O') {
              makeAIMove();
            }
        } else {
            aiPlayer = null; // No AI in two-player mode
        }
    }


    function handleCellClick(event) {
        if (!gameActive) return;

        const clickedCell = event.target;
        const index = clickedCell.getAttribute('data-index');

        if (gameState[index] !== '') return;

        playTurn(clickedCell, index);
    }

    function handleKeyPress(event) {
        if (!gameActive) return;
        if (event.key === 'Enter' || event.key === ' ') {
            handleCellClick(event);
        }
    }

    function playTurn(cell, index) {
        gameState[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer);
        cell.setAttribute('aria-disabled', 'true');
        cell.style.pointerEvents = 'none';
        cell.classList.add('clicked');

        setTimeout(() => {
            cell.classList.remove('clicked');
        }, 800);

        checkResult();
    }

    function checkResult() {
        let roundWon = false;
        let winningLine = null;

        for (let condition of winningConditions) {
            const [a, b, c] = condition.map(idx => gameState[idx]);
            if (a && a === b && b === c) {
                roundWon = true;
                winningLine = condition;
                break;
            }
        }

        if (roundWon) {
            highlightWinningLine(winningLine);
            confettiAnimation();
            statusIcon.textContent = '';
            status.textContent = `Player ${currentPlayer} wins! 🎉`;
            gameActive = false;
            return;
        }

        if (!gameState.includes('')) {
            statusIcon.textContent = '';
            status.textContent = 'It\'s a tie! 🤝';
            gameActive = false;
            return;
        }

        switchPlayer();
    }

    function switchPlayer() {
      status.classList.add('hidden');
        setTimeout(()=>{
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatus();
            status.classList.remove('hidden');
              if (gameMode === 'single' && currentPlayer === 'O' && gameActive) {
                makeAIMove(); // AI's turn
              }

        }, 250)
    }

    function makeAIMove() {
      const aiMove = aiPlayer.getMove(gameState);
      if (aiMove !== null) {
          // Simulate a small delay for the AI "thinking"
          setTimeout(() => {
              const cell = document.querySelector(`[data-index="${aiMove}"]`);
              playTurn(cell, aiMove);
          }, 500); // 500ms delay
      }
    }

    function updateStatus() {
        statusIcon.textContent = currentPlayer;
        status.textContent = `Player ${currentPlayer}'s turn`;
    }

    function highlightWinningLine(line) {
        line.forEach(index => {
            const cellToExplode = document.querySelector(`[data-index="${index}"]`);
             cellToExplode.classList.add('winner');
            cellToExplode.classList.add('explode');
            setTimeout(() => {
               cellToExplode.classList.remove('explode');
            }, 500);

        });
    }

    function resetGame() {
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        updateStatus();
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('winner', 'X', 'O');
            cell.style.pointerEvents = 'auto';
            cell.removeAttribute('aria-disabled');
        });
		document.querySelectorAll('.confetti').forEach(confetti => confetti.remove());
        board.style.transition = 'transform 0.5s';
        board.style.transform = 'scale(0)';
        setTimeout(() => {
            board.style.transform = 'scale(1)';
        }, 100);
         if (gameMode === 'single') {
            aiPlayer = new AIPlayer(aiDifficulty, 'O');
            if(currentPlayer === 'O'){
                makeAIMove();
            }
        } else {
            aiPlayer = null;
        }
    }

     function confettiAnimation() {
        const boardRect = board.getBoundingClientRect();
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = (boardRect.left + Math.random() * boardRect.width) + 'px';
            confetti.style.top = (boardRect.top + Math.random() * boardRect.height) + 'px';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
            document.body.appendChild(confetti);
            confetti.addEventListener('animationend', () => confetti.remove());
        }
    }

    function init() {
        createBoard();
        resetButton.addEventListener('click', resetGame);
    }

    return { init };
})();


// ----- THREE.JS MODULE ----- (No changes needed here for now) -----
const threeModule = (() => {
    let scene, camera, renderer, cube;
    let cubeMaterials; // Array to hold different materials
    let materialIndex = 0; // Index to track current material
    let lastMaterialChange = 0; // Timestamp for material change


    function init() {
            // Scene setup
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Enable antialiasing
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio); // For sharper rendering
            document.getElementById('three-container').appendChild(renderer.domElement);

            // Cube Materials - Create an array of materials
            cubeMaterials = [
                new THREE.MeshPhongMaterial({ color: 0x4ecdc4, shininess: 50, specular: 0x333333 }),
                new THREE.MeshPhongMaterial({ color: 0x8abeb7, shininess: 50, specular: 0x333333 }), // Blue
                new THREE.MeshBasicMaterial({ color: 0x4ecdc4, wireframe: true }), // Wireframe
            ];


            // Cube - Use a more interesting geometry

            const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // Slightly larger

            cube = new THREE.Mesh(geometry, cubeMaterials[0]); // Start with the first material

            cube.position.z = -5;
            cube.position.x = 2; //offset the position
            scene.add(cube);

            // Lights - Ambient and Point
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Slightly brighter ambient
            scene.add(ambientLight);
            const pointLight = new THREE.PointLight(0xffffff, 0.8); // White point light
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);

            // Stars - Varying sizes and colors
            const starsGeometry = new THREE.BufferGeometry();
            const starsVertices = [];
            const starsColors = []; // Array for star colors

            for (let i = 0; i < 1500; i++) { // More stars
                const x = THREE.MathUtils.randFloatSpread(2000);
                const y = THREE.MathUtils.randFloatSpread(2000);
                const z = THREE.MathUtils.randFloatSpread(2000);
                starsVertices.push(x, y, z);

                // Subtle color variation
                const color = new THREE.Color();
                color.setHSL(Math.random(), 0.2, Math.random() * 0.5 + 0.5); // Vary hue and lightness
                starsColors.push(color.r, color.g, color.b);
            }
            starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
            starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3)); // Add color attribute

            const starsMaterial = new THREE.PointsMaterial({
                size: 1.5, // Base size
                vertexColors: true, // Use vertex colors
                transparent: true, // For opacity changes
                 });
            const starField = new THREE.Points(starsGeometry, starsMaterial);
            scene.add(starField);

        camera.position.z = 5;

        animate(starField,starsMaterial); // Pass starField to animate
        window.addEventListener('resize', onWindowResize);
    }


    function animate(starField, starsMaterial) { // Add starField parameter
        requestAnimationFrame(() => animate(starField, starsMaterial)); // Pass it recursively
        cube.rotation.x += 0.005; // Slower rotation
        cube.rotation.y += 0.005;
        cube.scale.setScalar(1 + 0.05 * Math.sin(Date.now() * 0.001)); // Subtle pulsating

        // Cycle through materials every 5 seconds
        const now = Date.now();
        if (now - lastMaterialChange > 5000) {
            materialIndex = (materialIndex + 1) % cubeMaterials.length;
            cube.material = cubeMaterials[materialIndex];
            lastMaterialChange = now;
        }

        // Twinkling effect

        const positions = starField.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            // Slightly change the size of some stars randomly
            if (Math.random() > 0.99) { // Affect 1% of stars each frame
                const size = 0.5 + Math.random() * 2;  //Vary the stars size
                starsMaterial.size = size;
            }
        }
        starsMaterial.needsUpdate = true;

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio); // Update pixel ratio on resize
    }

    return { init };
})();
// ----- INITIALIZATION -----
window.addEventListener('load', () => {
        threeModule.init();
        gameModule.init();
});
