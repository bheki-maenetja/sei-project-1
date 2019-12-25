function setUp() {
  // Variables
  let charCode = null
  let gunTimer = null
  let alienMoveTimer = null
  let alienBombTimer = null
  let gunX = 50
  let alienX = null
  let alienY = null
  let direction = true

  // DOM Variables
  const gunner = document.querySelector('div.gunner')
  const battleField = document.querySelector('div.container')
  const alienContainer = document.querySelector('div.alien-container')
  const aliens = new Array(20)
  
  // Functions

  // Movement Functions
  function moveGunner() {
    switch (charCode) {
      case 39:
        if (gunner.offsetLeft < battleField.scrollWidth - gunner.offsetWidth) {
          gunX++
          gunner.style.left = `${gunX}%`
        } else {
          clearInterval(gunTimer)
          console.log('Gun timer finished\n', 'X-coordinate', gunner.offsetLeft)
        }
        break
      case 37:
        if (gunner.offsetLeft > 0) {
          gunX--
          gunner.style.left = `${gunX}%`
        } else {
          clearInterval(gunTimer)
          console.log('Gun timer finished\n', 'X-coordinate', gunner.offsetLeft)
        }
        break
      default:
        console.log('X-coordinate', gunner.offsetLeft)
    }
  }

  function moveAliens() {
    direction ? alienX++ : alienX--
    alienContainer.style.left = `${alienX}px`
    if (alienContainer.offsetLeft === battleField.scrollWidth - alienContainer.offsetWidth || alienContainer.offsetLeft === 0) {
      direction = !direction
      alienY++
      alienContainer.style.top = `${alienY}%`
      console.log('alien timer finished')
    }
    console.log('Time is running')
  }

  function moveBullet(bullet) {
    let bulletY = bullet.offsetTop
    const bulletTimer = setInterval(() => {
      aliens.map(alien => {
        if (!bulletCollision(bullet, alien)) {
          console.log('Alien coordinates', alien.offsetLeft, alien.offsetTop, alien.offsetWidth)
          console.log('Bullet coordinates:', bullet.offsetLeft - 100, bullet.offsetTop)
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
    }, 5)
  }

  function moveBomb(bomb) {
    let bombY = bomb.offsetTop
    const bombTimer = setInterval(() => {
      if (bombY < battleField.offsetHeight - bomb.offsetHeight && bombCollision(bomb, gunner)) {
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
    for (let i = 0; i < aliens.length; i++){
      const alien = document.createElement('div')
      alien.classList.add('alien')
      aliens[i] = alien
      alienContainer.appendChild(alien)
      alien.style.backgroundColor = ['yellow', 'green', 'red', 'blue', 'lime', 'grey', 'black'][Math.floor(Math.random() * 7)]
    }

    aliens.forEach(alien => {
      alien.style.left = `${alien.offsetLeft}px`
      alien.style.top = `${alien.offsetTop}px`
    })
    
    aliens.forEach(item => item.style.position = 'absolute')
  }

  // Collision Detection Functions
  function bulletCollision(movObj, statObj) {
    const movX = movObj.offsetLeft
    const movY = movObj.offsetTop
    const statX = statObj.offsetLeft + alienContainer.offsetLeft
    const statY = statObj.offsetTop + alienContainer.offsetTop
    const xCondition = movX + movObj.offsetWidth < statX || movX > statX + statObj.offsetWidth
    const yCondition = movY < statY || movY > statY + statObj.offsetHeight
    return xCondition || yCondition
  }

  function bombCollision(movObj, statObj) {
    const movX = movObj.offsetLeft
    const movY = movObj.offsetTop + movObj.offsetHeight
    const statX = statObj.offsetLeft
    const statY = statObj.offsetTop
    const xCondition = movX + movObj.offsetWidth < statX || movX > statX + statObj.offsetWidth
    const yCondition = movY < statY || movY > statY + statObj.offsetHeight
    return xCondition || yCondition
  }

  // Event Handlers
  function keyDownHandler(e) {
    if (e.keyCode === 32) {
      createBullet()
    } else if ([37,39].includes(e.keyCode)) {
      clearInterval(gunTimer)
      charCode = e.keyCode
      gunTimer = setInterval(moveGunner, 10)
    } else if (e.keyCode === 38) {
      alienMoveTimer = setInterval(moveAliens, 5)
    } else if (e.keyCode === 13) {
      alienBombTimer = setInterval(() => {
        if (aliens.length > 0) {
          const chosenAlien = aliens[Math.floor(Math.random() * aliens.length)]
          createBomb(chosenAlien)
        } else {
          clearInterval(alienBombTimer)
          console.log('Bomb timer cleared')
        }
      }, 2000)
    }
  }

  function keyUpHandler(e) {
    if (e.keyCode !== 32) {
      clearInterval(gunTimer)
      console.log('Gun timer finished\n', 'X-coordinate', gunner.offsetLeft)
    }
  }

  // Event Listeners
  window.addEventListener('keydown', keyDownHandler)
  window.addEventListener('keyup', keyUpHandler)
  

  addAliens()
  aliens.forEach(item => {
    item.addEventListener('click', (e) => {
      console.log(e.target.offsetLeft, e.target.offsetTop)
    })
  })
  
}

window.addEventListener('DOMContentLoaded', setUp)