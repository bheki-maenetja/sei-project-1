function setUp() {
  // Variables
  let xPos = 0
  let yPos = 0
  let charCode = null
  let timerID = null

  // DOM Variables
  const testBlock = document.querySelector('.test-block')
  const statBlock = document.querySelector('.stationary-block')
  const main = document.querySelector('main.container')

  // Functions
  function checkForCollision(movObj, statObj) {
    const movX = movObj.offsetLeft
    const movY = movObj.offsetTop
    const statX = statObj.offsetLeft
    const statY = statObj.offsetTop
    const xCondition = movX + movObj.offsetWidth < statX || movX > statX + statObj.offsetWidth
    const yCondition = movY + movObj.offsetWidth < statY || movY > statY + statObj.offsetHeight
    return xCondition || yCondition
  }

  function moveBlock() {
    switch (charCode) {
      case 39:
        if (testBlock.offsetLeft < main.scrollWidth - testBlock.offsetWidth) {
          xPos += 1
          testBlock.style.left = `${xPos}px`
        } else {
          clearInterval(timerID)
          console.log(testBlock.offsetLeft, testBlock.offsetTop)
          console.log('timer finished')
        }
        break
      case 37:
        if (testBlock.offsetLeft > 0) {
          xPos -= 1
          testBlock.style.left = `${xPos}px`
        } else {
          clearInterval(timerID)
          console.log(testBlock.offsetLeft, testBlock.offsetTop)
          console.log('timer finished')
        }
        break
      case 40:
        if (testBlock.offsetTop < main.scrollHeight - testBlock.offsetHeight) {
          yPos += 1
          testBlock.style.top = `${yPos}px`
        } else {
          clearInterval(timerID)
          console.log(testBlock.offsetLeft, testBlock.offsetTop)
          console.log('timer finished')
        }
        break
      case 38:
        if (testBlock.offsetTop > 0) {
          yPos -= 1
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
      if (yCoord > 0 && checkForCollision(bullet, statBlock)) {
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
    bullet.style.left = `${xPos + 50}px`
    moveBullet(bullet)
  }

  // Event Handlers
  function keyHandler(e) {
    if (e.keyCode === 13) {
      createBullet()
    } else {
      clearInterval(timerID)
      charCode = e.keyCode
      timerID = setInterval(moveBlock, 1)
    }
  }

  // Event Listeners
  window.addEventListener('keydown', keyHandler)
}

window.addEventListener('DOMContentLoaded', setUp)