function setUp() {
  // VARIABLES

  // General Variables
  let playerIndex = 0
  
  // DOM Variables
  const gridWidth = 10
  const gridContainer = document.querySelector('.the-grid')
  gridContainer.style.height = gridContainer.style.width = `${gridWidth * 50}px`
  const squares = []

  Array(gridWidth * gridWidth).fill('').forEach(() => {
    const square = document.createElement('div')
    square.classList.add('grid-item')
    squares.push(square)
    gridContainer.appendChild(square)
  })

  squares[0].classList.add('player')

  // FUNCTIONS
  function moveYoda() {
    squares.forEach(item => item.classList.remove('player'))
    if (playerIndex !== squares.length - 1) {
      playerIndex++
    }
    squares[playerIndex].classList.add('player')
  }

  // function generateSnakesAndLadders() {

  // }

  // EVENTS

  // Event Handlers
  function keyDownHandler(e) {
    if (e.keyCode === 39) {
      moveYoda()
    }
  }

  // Event Listeners
  squares.forEach(item => item.addEventListener('click', () => {
    console.log(squares.indexOf(item))
  }))

  window.addEventListener('keydown', keyDownHandler)

  // Other
}

window.addEventListener('DOMContentLoaded', setUp)