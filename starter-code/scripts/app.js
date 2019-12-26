function setUp() {
  // Variables
  let charCode = null
  let gameTimer = null
  let gunTimer = null
  let alienMoveTimer = null
  let alienBombTimer = null
  let gunX = 50
  let alienX = null
  let direction = true

  // DOM Variables
  const gunner = document.querySelector('div.gunner')
  const battleField = document.querySelector('div.container')
  const alienContainer = document.querySelector('div.alien-container')
  const aliens = new Array(20)
  
  // FUNCTIONS

  // Movement Functions
  function moveGunner() {
    if (charCode === 39) {
      gunner.offsetLeft < battleField.scrollWidth - gunner.offsetWidth ? gunX++ : clearInterval(gunTimer)
    } else if (charCode === 37) {
      gunner.offsetLeft > 0 ? gunX-- : clearInterval(gunTimer)
    } else {
      console.log('X-coordinate', gunner.offsetLeft)
    }
    gunner.style.left = `${gunX}%`
  }

  function moveAliens() {
    direction ? alienX++ : alienX--
    alienContainer.style.left = `${alienX}px`
    if (alienContainer.offsetLeft === battleField.scrollWidth - alienContainer.offsetWidth || alienContainer.offsetLeft === 0) {
      direction = !direction
      aliens.forEach(alien => {
        let alienY = alien.offsetTop / alienContainer.offsetHeight * 100
        alienY++
        alien.style.top = `${alienY}%`
      })
      console.log('alien timer finished')
    }
    console.log('Time is running')
  }

  function moveBullet(bullet) {
    let bulletY = bullet.offsetTop
    const bulletTimer = setInterval(() => {
      aliens.map(alien => {
        if (!collisionDetector(bullet, alien, 0, 0, alienContainer.offsetLeft, alienContainer.offsetTop)) {
          aliens.splice(aliens.indexOf(alien), 1)
          alienContainer.removeChild(alien)
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

  // Layout Functions
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

  function addAliens() {
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

  // function startGame() {

  // }

  // function resetGame() {

  // }

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
      alienMoveTimer = setInterval(moveAliens, 5)
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
  
  addAliens()
}

window.addEventListener('DOMContentLoaded', setUp)