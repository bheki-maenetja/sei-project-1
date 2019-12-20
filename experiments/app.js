function setUp() {
  // Variables
  let xPos = 0
  let yPos = 0
  let charCode = null
  let timerID = null

  // DOM Variables
  const testBlock = document.querySelector('.test-block')
  const main = document.querySelector('main')

  // Functions
  function moveBlock() {
    switch (charCode) {
      case 39:
        if (testBlock.offsetLeft < main.scrollWidth - testBlock.offsetWidth) {
          xPos++
          testBlock.style.left = `${xPos}px`
        } else {
          clearInterval(timerID)
          console.log(testBlock.offsetLeft, testBlock.offsetTop)
          console.log('timer finished')
        }
        break
      case 37:
        if (testBlock.offsetLeft > 0) {
          xPos--
          testBlock.style.left = `${xPos}px`
        } else {
          clearInterval(timerID)
          console.log(testBlock.offsetLeft, testBlock.offsetTop)
          console.log('timer finished')
        }
        break
      case 40:
        if (testBlock.offsetTop < main.scrollHeight - testBlock.offsetHeight) {
          yPos++
          testBlock.style.top = `${yPos}px`
        } else {
          clearInterval(timerID)
          console.log(testBlock.offsetLeft, testBlock.offsetTop)
          console.log('timer finished')
        }
        break
      case 38:
        if (testBlock.offsetTop > 0) {
          yPos--
          testBlock.style.top = `${yPos}px`
        } else {
          clearInterval(timerID)
          console.log(testBlock.offsetLeft, testBlock.offsetTop)
          console.log('timer finished')
        }
        break
      default:
        clearInterval(timerID)
        console.log('Co-ordinates:',testBlock.offsetLeft, testBlock.offsetTop)
    }
  }

  function moveBullet(bullet) {
    let yCoord = bullet.offsetTop
    const timeID = setInterval(()=> {
      if (bullet.offsetTop > 0) {
        yCoord--
        bullet.style.top = `${yCoord}px`
      } else {
        clearInterval(timeID)
        main.removeChild(bullet)
        console.log('Shots fired!!!')
      }
    }, 5)
  }

  function createBullet() {
    const bullet = document.createElement('div')
    bullet.classList.add('bullet')
    main.appendChild(bullet)
    bullet.style.top = `${yPos}px`
    bullet.style.left = `${xPos}px`
    moveBullet(bullet)
  }

  // Event Handlers
  function keyHandler(e) {
    charCode = e.keyCode
    if (charCode === 13) {
      createBullet()
    } else {
      clearInterval(timerID)
      timerID = setInterval(moveBlock, 1)
    }
  }

  // Event Listeners
  window.addEventListener('keydown', keyHandler)
}

window.addEventListener('DOMContentLoaded', setUp)