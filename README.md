# Shape Invaders

A geometric space shooter game with full sound implementation.

![Shape Invaders Screenshot]

## Description

Shape Invaders is a modern take on the classic space invaders concept, using geometric shapes instead of pixel art sprites. The game features a player-controlled ship (triangle) that moves horizontally at the bottom of the screen, facing waves of geometric enemies with different behaviors and abilities.

### Key Features

- **Geometric Graphics**: All game elements are rendered using simple shapes (triangles, squares, circles) with vibrant colors
- **Full Sound Effects**: Complete audio implementation with sounds for all game actions and events
- **Multiple Enemy Types**: Four different enemy types with unique behaviors:
  - Normal enemies (red)
  - Fast enemies (orange)
  - Shooter enemies (purple)
  - Boss enemies (yellow) with tractor beam abilities
- **Power-up System**: Collect various power-ups to enhance your ship:
  - Health power-ups (red cross)
  - Missile power-ups (orange)
  - Speed power-ups (green)
  - Dual fighter power-ups (yellow)
- **Wave-based Progression**: Increasing difficulty with each wave
- **Special Mechanics**: Boss enemies can capture your ship with tractor beams

## How to Play

### Controls

- **Mouse Movement**: Move your ship horizontally
- **Left Click**: Fire regular projectiles
- **Right Click**: Launch special missiles with area damage
- **Sound Toggle**: Click the sound icon in the bottom right corner to mute/unmute

### Game Elements

- **Player Ship**: Green triangle at the bottom of the screen
- **Enemies**: Various colored shapes that move in formation and attack
- **Power-ups**: Special items that fall from destroyed enemies
- **Score**: Displayed at the top left of the screen
- **Lives**: Displayed at the top right of the screen
- **Missiles**: Special weapons with limited ammunition

## Technical Details

Shape Invaders is built with:

- **Phaser.js**: HTML5 game framework
- **Canvas Rendering**: For optimal performance
- **Vanilla JavaScript**: No additional libraries required
- **HTML5 Audio**: For sound implementation

The game uses geometric rendering techniques instead of sprite-based graphics, creating a unique visual style while maintaining classic gameplay.

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/shape-invaders.git
   ```

2. No build process required! Simply open `index.html` in a web browser to play.

3. For the best experience, use a modern browser with HTML5 and canvas support.

## Development

The game code is organized as follows:

- `index.html`: Main game file
- `css/style.css`: Styling for the game interface
- `js/game.js`: Core game mechanics and logic
- `js/sound_manager.js`: Sound implementation and management
- `sounds/`: Directory containing all game sound files

## Credits

- Game Design & Development: [Your Name]
- Sound Effects: Custom-created audio files

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Enjoy playing Shape Invaders! Feel free to contribute to the project by submitting issues or pull requests.
