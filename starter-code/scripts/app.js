function setUp() {
  // VARIABLES
  
  // Game Variables
  const player = {
    currentScore: 0,
    highScore: 0
  }
  let isGameOver


  // Timer Variables
  let gunTimer = null
  let gameTimer = null
  let alienMoveTimer = null
  let alienBombTimer = null

  // DOM Variables
  let charCode = null
  let alienX = null
  let direction = true
  const startBtn = document.querySelector('#start')
  const homeBtn = document.querySelector('#go-home')
  const playAgainBtn = document.querySelector('#play-again')
  const homeDiv = document.querySelector('#home')
  const gameOverDiv = document.querySelector('#game-over')
  const battleField = document.querySelector('div.container')
  let gunner
  let gunX
  let alienContainer
  let aliens
  let bunkers 
  let bunkerContainer
  
  // FUNCTIONS

  // Movement Functions
  function moveGunner() {
    gunX = gunner.offsetLeft / battleField.scrollWidth * 100
    if (charCode === 39) {
      gunner.offsetLeft < battleField.scrollWidth - gunner.offsetWidth ? gunX++ : clearInterval(gunTimer)
    } else if (charCode === 37) {
      gunner.offsetLeft > 0 ? gunX-- : clearInterval(gunTimer)
    }
    gunner.style.left = `${gunX}%`
  }

  function moveAliens() {
    direction ? alienX++ : alienX--
    alienContainer.style.left = `${alienX}px`
    if (alienContainer.offsetLeft === battleField.scrollWidth - alienContainer.offsetWidth || alienContainer.offsetLeft === 0) {
      direction = !direction
      const alienCondition = aliens.every(alien => alien.offsetTop < alienContainer.scrollHeight - alien.offsetHeight)
      if (alienCondition) {
        aliens.forEach(alien => {
          let alienY = alien.offsetTop / alienContainer.scrollHeight * 100
          alienY++
          alien.style.top = `${alienY}%`
        })
      } else {
        console.log('Aliens at the bottom')
      }
      console.log('alien timer finished')
    }
    console.log('Time is running')
  }

  function moveBullet(bullet) {
    let bulletY = bullet.offsetTop
    const bulletTimer = setInterval(() => {
      if (isGameOver) {
        clearInterval(bulletTimer)
        battleField.removeChild(bullet)
        return
      }
      aliens.map(alien => {
        if (!collisionDetector(bullet, alien, 0, 0, alienContainer.offsetLeft, alienContainer.offsetTop)) {
          aliens.splice(aliens.indexOf(alien), 1)
          alienContainer.removeChild(alien)
          battleField.removeChild(bullet)
          clearInterval(bulletTimer)
        }
      })
      bunkers.map(bunker => {
        if (!collisionDetector(bullet, bunker, 0, 0, 0, bunkerContainer.offsetTop)) {
          battleField.removeChild(bullet)
          clearInterval(bulletTimer)
        }
      })
      if (bulletY > 0) {
        bulletY--
        bullet.style.top = `${bulletY}px`
      } else {
        clearInterval(bulletTimer)
        battleField.removeChild(bullet)
        console.log('Shot landed')
      }
    }, 1)
  }

  function moveBomb(bomb) {
    let bombY = bomb.offsetTop
    const bombTimer = setInterval(() => {
      if (isGameOver) {
        clearInterval(bombTimer)
        battleField.removeChild(bomb)
        return
      }
      bunkers.map(bunker => {
        if (!collisionDetector(bomb, bunker, 0, bomb.offsetHeight, 0, bunkerContainer.offsetTop)) {
          battleField.removeChild(bomb)
          bunkerContainer.removeChild(bunker)
          clearInterval(bombTimer)
        }
      })
      if (bombY < battleField.scrollHeight - bomb.offsetHeight && collisionDetector(bomb, gunner, 0, bomb.offsetHeight, 0, 0)) {
        bombY++
        bomb.style.top = `${bombY}px`
      } else {
        clearInterval(bombTimer)
        battleField.removeChild(bomb)
        console.log('Bomb landed')
      }
    }, 5)
  }

  // Bullets & Bombs Functions
  function createBullet() {
    const bullet = document.createElement('div')
    bullet.classList.add('bullet')
    battleField.appendChild(bullet)
    bullet.style.left = `${gunX}%`
    bullet.style.top = `${gunner.offsetTop}px`
    moveBullet(bullet)
  }

  function createBomb(alien) {
    const bomb = document.createElement('div')
    bomb.classList.add('bomb')
    battleField.appendChild(bomb)
    bomb.style.left = `${alien.offsetLeft + alienContainer.offsetLeft}px`
    bomb.style.top = `${alien.offsetTop + alienContainer.offsetTop}px`
    moveBomb(bomb)
  }

  // Layout Functions 
  function addAliens() {
    aliens = new Array(20)
    alienContainer = document.createElement('div')
    battleField.appendChild(alienContainer)
    alienContainer.classList.add('alien-container')
    
    for (let i = 0; i < aliens.length; i++) {
      const alien = document.createElement('div')
      alien.classList.add('alien')
      aliens[i] = alien
      alienContainer.appendChild(alien)
      alien.style.backgroundColor = ['yellow', 'green', 'red', 'blue', 'lime', 'grey', 'cyan'][Math.floor(Math.random() * 7)]
    }

    aliens.forEach(item => {
      item.style.left = `${item.offsetLeft}px`
      item.style.top = `${item.offsetTop}px`
    })

    aliens.forEach(item => item.classList.add('fixed-alien'))
  }

  function addBunkers() {
    bunkers = new Array(4)
    bunkerContainer = document.createElement('div')
    battleField.appendChild(bunkerContainer)
    bunkerContainer.classList.add('bunker-container')

    for (let i = 0; i < bunkers.length; i++) {
      const bunker = document.createElement('div')
      bunkerContainer.appendChild(bunker)
      bunker.classList.add('bunker')
      bunkers[i] = bunker
    }

    bunkers.forEach(item => item.style.left = `${item.offsetLeft}px`)
    bunkers.forEach(item => item.classList.add('fixed-bunker'))
  }

  function addGunner() {
    gunner = document.createElement('div')
    battleField.appendChild(gunner)
    gunner.classList.add('gunner')
    gunX = gunner.offsetLeft / battleField.scrollWidth * 100
  }

  function setBattleField() {
    addAliens()
    addBunkers()
    addGunner()
  }

  function clearBattleField() {
    battleField.removeChild(alienContainer)
    battleField.removeChild(bunkerContainer)
    battleField.removeChild(gunner)
  }
  // Collision Detection Functions
  function collisionDetector(movObj, statObj, movOffsetX = 0, movOffsetY = 0, statOffsetX = 0, statOffsetY = 0) {
    const movX = movObj.offsetLeft + movOffsetX
    const movY = movObj.offsetTop + movOffsetY
    const statX = statObj.offsetLeft + statOffsetX
    const statY = statObj.offsetTop + statOffsetY
    const xCondition = movX + movObj.offsetWidth < statX || movX > statX + statObj.offsetWidth
    const yCondition = movY < statY || movY > statY + statObj.offsetHeight
    return xCondition || yCondition
  }
  // Game Functions

  function startGame() {
    isGameOver = false
    homeDiv.style.display = 'none'
    gameOverDiv.style.display = 'none'
    setBattleField()
    gameTimer = setInterval(checkForGameOver, 1)
  }

  function gameOver() {
    isGameOver = true
    clearBattleField()
    gameOverDiv.style.display = 'initial'
  }

  function checkForGameOver() {
    if (aliens.length === 0) {
      clearInterval(gameTimer)
      clearInterval(alienMoveTimer)
      gameOver()
    }
  }

  // Event Handlers
  function keyDownHandler(e) {
    if (e.keyCode === 32) {
      createBullet()
    } else if ([37,39].includes(e.keyCode)) {
      clearInterval(gunTimer)
      charCode = e.keyCode
      gunTimer = setInterval(moveGunner, 15)
    } else if (e.keyCode === 38) {
      alienX = alienContainer.offsetLeft
      clearInterval(alienMoveTimer)
      alienMoveTimer = setInterval(moveAliens, 1)
    } else if (e.keyCode === 13) {
      clearInterval(alienBombTimer)
      alienBombTimer = setInterval(() => {
        if (aliens.length > 0) {
          const chosenAlien = aliens[Math.floor(Math.random() * aliens.length)]
          createBomb(chosenAlien)
        } else {
          clearInterval(alienBombTimer)
          console.log('Bomb timer cleared')
        }
      }, 200)
    }
  }

  function keyUpHandler(e) {
    if (e.keyCode !== 32) clearInterval(gunTimer)
  }

  // Event Listeners
  
  window.addEventListener('keydown', keyDownHandler)
  window.addEventListener('keyup', keyUpHandler)
  
  startBtn.addEventListener('click', startGame)
  playAgainBtn.addEventListener('click', startGame)

  homeBtn.addEventListener('click', () => {
    gameOverDiv.style.display = 'none'
    homeDiv.style.display = 'initial'
  })

  gameOverDiv.style.display = 'none'
}

window.addEventListener('DOMContentLoaded', setUp)