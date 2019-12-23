function setUp() {
  // Variables
  let charCode = null
  let gunTimer = null
  let alienTimer = null
  let gunX = 50
  let alienX = null

  // DOM Variables
  const gunner = document.querySelector('div.gunner')
  const battleField = document.querySelector('div.container')
  const alienContainer = document.querySelector('div.alien-container')
  const aliens = new Array(20)
  
  // Functions
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
    alienX++
    alienContainer.style.left = `${alienX}px`
    console.log('Time is running')
  }

  function addAliens() {
    for (let i = 0; i < aliens.length; i++){
      const alien = document.createElement('div')
      alien.classList.add('alien')
      aliens[i] = alien
      alienContainer.appendChild(alien)
    }
  }

  // Event Handlers
  function keyDownHandler(e) {
    if (e.keyCode === 32) {
      createBullet()
    } else if ([37,39].includes(e.keyCode)) {
      clearInterval(gunTimer)
      charCode = e.keyCode
      gunTimer = setInterval(moveGunner, 1)
    } else if (e.keyCode === 38) {
      alienTimer = setInterval(moveAliens, 10)
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
}

window.addEventListener('DOMContentLoaded', setUp)