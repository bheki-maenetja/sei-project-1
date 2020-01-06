function setUp() {
  // VARIABLES
  
  // Game Variables
  const player = {
    currentScore: null,
    lives: null,
    ammo: null,
    cityPopulation: null,
    wavesFought: null,
    alienKills: null,
    motherShipKills: null
  }

  let isGameOver = true
  let motherShipLife
  let gameClock = null
  let diffSetting
  let motherShipInPlay = false

  const gamePlayStats = ['gamesPlayed', 'wins', 'losses','highScore', 'totalScore', 'alienKills', 'motherShipKills', 'wavesFought', 'ammoUsed', 'livesLost', 'populationLoss', 'gameTime']
  gamePlayStats.forEach(stat => localStorage.setItem(stat, 0))

  const gameDiffSettings = [{
    waveSize: 15,
    numWaves: 3,
    numBunkers: 3,
    bunkerStrength: 3,
    playerLives: 5,
    playerAmmo: 65,
    populationHit: 1000,
    motherShipsLives: 5
  }, {
    waveSize: 23,
    numWaves: 5,
    numBunkers: 2,
    bunkerStrength: 6,
    playerLives: 3,
    playerAmmo: 130,
    populationHit: 2000,
    motherShipsLives: 10
  }, {
    waveSize: 30,
    numWaves: 8,
    numBunkers: 1,
    bunkerStrength: 9,
    playerLives: 1,
    playerAmmo: 290,
    populationHit: 4000,
    motherShipsLives: 15
  }]

  // Timer Variables
  let gunTimer = null
  let gameTimer = null
  let gameOverTimer = null
  let alienMoveTimer = null

  // DOM Variables
  let charCode = null
  let alienX = null
  let direction = true

  const startBtn = document.querySelector('#start')
  const homeBtn = document.querySelectorAll('.go-home')
  const statsBtn = document.querySelector('#stats')
  const playAgainBtn = document.querySelector('#play-again')
  const diffSelector = document.querySelector('select')

  const homeDiv = document.querySelector('#home')
  const gameOverDiv = document.querySelector('#game-over')
  const statsBoardDiv = document.querySelector('#player-stats') 
  const scoreBoard = document.querySelector('#score-board')
  const battleField = document.querySelector('div.container')

  const playerCurrentScore = document.querySelector('#current-score')
  const populationCount = document.querySelector('#population-count')
  const timer = document.querySelector('#game-timer')
  const lifeCount = document.querySelector('#life-count')
  const ammoCount = document.querySelector('#ammo-count')

  const playerFinalScore = document.querySelector('#final-score')
  const finalGameTime = document.querySelector('#game-time')
  const playerHighScore = document.querySelectorAll('.high-score')
  const gameResult = document.querySelector('#game-result')

  const gameStats = document.querySelectorAll('.game-stat')

  let alienContainer
  let bunkerContainer
  let gunStep
  let alienStep
  let gunner
  let gunX
  let aliens
  let bunkers 
  
  // FUNCTIONS

  // Movement Functions
  function moveGunner() {
    gunX = gunner.offsetLeft
    gunStep = 0.01 * battleField.scrollWidth
    if (charCode === 39) {
      gunner.offsetLeft + gunStep > battleField.scrollWidth - gunner.offsetWidth ? clearInterval(gunTimer) : gunX += gunStep
    } else if (charCode === 37) {
      gunner.offsetLeft - gunStep <= 0 ? clearInterval(gunTimer) : gunX -= gunStep
    }
    gunner.style.left = `${gunX}px`
  }

  function moveAliens() {
    alienStep = 0.002 * battleField.scrollWidth
    direction ? alienX += alienStep : alienX -= alienStep
    alienContainer.style.left = `${alienX}px`
    if (alienContainer.offsetLeft >= battleField.scrollWidth - alienContainer.offsetWidth || alienContainer.offsetLeft <= 0) {
      direction = !direction
      const alienCondition = aliens.every(alien => alien.offsetTop < alienContainer.scrollHeight - alien.offsetHeight)
      if (alienCondition) {
        aliens.forEach(alien => {
          let alienY = alien.offsetTop
          alienY += 0.01 * alienContainer.scrollHeight
          alien.style.top = `${alienY}px`
        })
      }
    }
  }

  function moveBullet(bullet) {
    let bulletY = bullet.offsetTop
    const bulletTimer = setInterval(() => {
      if (isGameOver) {
        clearInterval(bulletTimer)
        battleField.removeChild(bullet)
        return
      }
      aliens.forEach(alien => {
        if (!collisionDetector(bullet, alien, 0, 0, alienContainer.offsetLeft, alienContainer.offsetTop)) {
          if (alien.classList.contains('mothership')) {
            motherShipLife--
            if (motherShipLife === 0) {
              alienContainer.removeChild(alien)
              aliens.splice(aliens.indexOf(alien), 1)
              updateScore('motherShipKill')
            }
          } else {
            alienContainer.removeChild(alien)
            aliens.splice(aliens.indexOf(alien), 1)
            updateScore('alienKill')
          }
          battleField.removeChild(bullet)
          clearInterval(bulletTimer)  
        }
      })
      bunkers.map(bunker => {
        if (!collisionDetector(bullet, bunker[0], 0, 0, 0, bunkerContainer.offsetTop)) {
          battleField.removeChild(bullet)
          bunker[1]--
          console.log('Bunker strength', bunker[1])
          if (bunker[1] === 0) {
            bunkerContainer.removeChild(bunker[0])
            bunkers.splice(bunkers.indexOf(bunker), 1)
          }
          clearInterval(bulletTimer)
        }
      })
      if (bulletY > 0) {
        bulletY -= 0.003 * battleField.scrollHeight
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
      bunkers.forEach(bunker => {
        if (!collisionDetector(bomb, bunker[0], 0, bomb.offsetHeight, 0, bunkerContainer.offsetTop)) {
          battleField.removeChild(bomb)
          bunker[1]--
          console.log('Bunker strength', bunker[1])
          if (bunker[1] === 0) {
            bunkerContainer.removeChild(bunker[0])
            bunkers.splice(bunkers.indexOf(bunker), 1)
          }
          clearInterval(bombTimer)
        }
      })
      if (!collisionDetector(bomb, gunner, 0, bomb.offsetHeight, 0, 0)) {
        clearInterval(bombTimer)
        battleField.removeChild(bomb)
        updateScore('gunnerHit')
      } else if (bombY >= battleField.scrollHeight - bomb.offsetHeight) {
        clearInterval(bombTimer)
        battleField.removeChild(bomb)
        updateScore('cityHit')
      } else {
        bombY += 0.003 * battleField.scrollHeight
        bomb.style.top = `${bombY}px`
      }
    }, 5)
  }

  // Bullets & Bombs Functions
  function createBullet() {
    const bullet = document.createElement('div')
    bullet.classList.add('bullet')
    battleField.appendChild(bullet)
    bullet.style.left = `${gunX}px`
    bullet.style.top = `${gunner.offsetTop}px`
    moveBullet(bullet)
  }

  function fireBullet() {
    if (player.ammo > 0) {
      createBullet()
      player['ammo']--
    } else {
      console.log('YOU\'RE OUT of AMMO!!!')
    }
    ammoCount.innerHTML = player.ammo > 0 ? player.ammo : 'OUT OF AMMO'
  }

  function createBomb(alien) {
    const bomb = document.createElement('div')
    bomb.classList.add('bomb')
    battleField.appendChild(bomb)
    bomb.style.left = `${alien.offsetLeft + alienContainer.offsetLeft}px`
    bomb.style.top = `${alien.offsetTop + alienContainer.offsetTop}px`
    moveBomb(bomb)
  }

  function dropBombs() {
    if ([true, false][Math.floor(Math.random() * 2)]) {
      const chosenAlien = aliens[Math.floor(Math.random() * aliens.length)]
      createBomb(chosenAlien)
    }
  }

  // Layout Functions
  function setAliens() {
    aliens = []
    alienContainer = document.createElement('div')
    battleField.appendChild(alienContainer)
    alienContainer.classList.add('alien-container')
  }
  
  function addAliens(waveSize) {
    const newAlienWave = new Array(waveSize)

    for (let i = 0; i < newAlienWave.length; i++) {
      const alien = document.createElement('div')
      alien.classList.add('alien')
      newAlienWave[i] = alien
      alienContainer.appendChild(alien)
      alien.style.backgroundColor = ['yellow', 'green', 'red', 'blue', 'lime', 'cyan', 'violet'][Math.floor(Math.random() * 7)]
    }

    newAlienWave.forEach(item => {
      item.style.left = `${item.offsetLeft}px`
      item.style.top = `${item.offsetTop / alienContainer.scrollHeight * 100}%`
    })

    newAlienWave.forEach(item => item.classList.add('fixed-alien'))

    aliens = aliens.concat(newAlienWave)

    player['wavesFought']--
  }

  function addMotherShip() {
    const motherShip = document.createElement('div')
    alienContainer.appendChild(motherShip)
    motherShip.classList.add('mothership')

    motherShip.style.left = `${motherShip.offsetLeft}px`
    motherShip.style.top = `${motherShip.offsetTop}px`
    motherShip.classList.add('fixed-mothership')

    aliens.push(motherShip)
    motherShipInPlay = true
    player['wavesFought']--
  }

  function addBunkers(numBunkers, bunkerStrength) {
    bunkers = new Array(numBunkers)
    bunkerContainer = document.createElement('div')
    battleField.appendChild(bunkerContainer)
    bunkerContainer.classList.add('bunker-container')

    for (let i = 0; i < bunkers.length; i++) {
      const bunkerDiv = document.createElement('div')
      bunkerDiv.classList.add('bunker')
      bunkers[i] = [bunkerDiv, bunkerStrength]
      bunkerContainer.appendChild(bunkerDiv)
    }

    bunkers.forEach(item => item[0].style.left = `${item[0].offsetLeft}px`)
    bunkers.forEach(item => item[0].classList.add('fixed-bunker'))
  }

  function addGunner() {
    gunner = document.createElement('div')
    battleField.appendChild(gunner)
    gunner.classList.add('gunner')
    gunX = gunner.offsetLeft
  }

  function setBattleField() {
    setAliens()
    addAliens(diffSetting.waveSize)
    addBunkers(diffSetting.numBunkers, diffSetting.bunkerStrength)
    addGunner()
    aliens.forEach(item => item.addEventListener('click', () => console.log(item.offsetTop)))
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
  function setHTML() {
    homeDiv.style.display = 'none'
    gameOverDiv.style.display = 'none'
    scoreBoard.style.display = 'initial'
    playerCurrentScore.innerHTML = 0
    timer.innerHTML = 0
    populationCount.innerHTML = player.cityPopulation
    lifeCount.innerHTML = player.lives
    ammoCount.innerHTML = player.ammo
  }

  function setPlayer() {
    player['lives'] = diffSetting.playerLives
    player['cityPopulation'] = 100000
    player['wavesFought'] = diffSetting.numWaves
    player['ammo'] = diffSetting.playerAmmo
  }

  function setUpGame() {
    diffSetting = gameDiffSettings[diffSelector.value - 1]
    motherShipLife = diffSetting.motherShipsLives
    setPlayer()
    setHTML()
    setBattleField()
  }

  function startGame() {
    isGameOver = false
    setUpGame()
    alienMoveTimer = setInterval(moveAliens, 1)
    gameTimer = setInterval(playGame, 1000)
  }

  function playGame() {
    clearInterval(gameOverTimer)
    gameClock++
    timer.innerHTML = gameClock
    if (player.wavesFought === 0 && !motherShipInPlay && aliens.every(item => item.offsetTop > 0.6 * alienContainer.scrollHeight)) addMotherShip()
    if (aliens.every(item => item.offsetTop > 0.6 * alienContainer.scrollHeight) && !motherShipInPlay) addAliens(diffSetting.waveSize)
    dropBombs()
    // console.log('Playing the GAME!')
    gameOverTimer = setInterval(checkForGameOver, 1)
  }

  function checkForGameOver() {
    if (aliens.length === 0 && player.wavesFought < 0 || player.lives === 0 || player.cityPopulation === 0) {
      gameOver()
    }
    // console.log('Running game over timer')
  }
  
  function updateScore(event) {
    switch (event) {
      case 'alienKill':
        player['currentScore'] += 100
        player['alienKills']++
        console.log('Alien Kill!!!\nScore:', player['currentScore'])
        break
      case 'motherShipKill':
        player['currentScore'] += motherShipLife === 0 ? 500 : 0
        player['motherShipKills']++
        console.log('You killed the mothership!!!\nScore', player['currentScore'])
        break
      case 'cityHit':
        player['cityPopulation'] -= diffSetting.populationHit
        console.log('City hit!\nPopulation Remaining:', player['cityPopulation'])
        break
      case 'gunnerHit':
        player['lives']--
        console.log(`You've been hit!\nLives remaining: ${player['lives']}`)
        break
      default:
        break
    }
    playerCurrentScore.innerHTML = player['currentScore']
    lifeCount.innerHTML = player['lives']
    populationCount.innerHTML = player['cityPopulation']
  }

  function resetPlayer() {
    Object.keys(player).map(key => player[key] = null)
  }

  function resetTimers() {
    clearInterval(gunTimer)
    clearInterval(gameTimer)
    clearInterval(alienMoveTimer)
    clearInterval(gameOverTimer)
    gunTimer = null
    gameTimer = null
    gameOverTimer = null
    alienMoveTimer = null
  }

  function resetDomVars() {
    charCode = null
    alienX = null
    direction = true
    alienContainer = null
    bunkerContainer = null
    gunStep = null
    alienStep = null
    gunner = null
    gunX = null
    aliens = null
    bunkers  = null
  }

  function resetHTML() {
    playerCurrentScore.innerHTML = 0
    timer.innerHTML = 0
    populationCount.innerHTML = 0
    lifeCount.innerHTML = 0

  }

  function resetGame() {
    diffSetting = gameDiffSettings[diffSelector.value - 1]
    gameClock = null
    isGameOver = true
    motherShipInPlay = false
    resetPlayer()
    resetTimers()
    resetDomVars()
  }

  function updateStats() {
    localStorage.gamesPlayed = parseInt(localStorage.gamesPlayed) + 1
    if (player['currentScore'] > parseInt(localStorage.highScore)) localStorage.highScore = player['currentScore']
    localStorage.totalScore = parseInt(localStorage.totalScore) + player.currentScore
    localStorage.alienKills = parseInt(localStorage.alienKills) + player.alienKills
    localStorage.motherShipKills = parseInt(localStorage.motherShipKills) + player.motherShipKills
    localStorage.wavesFought = parseInt(localStorage.wavesFought) + (diffSetting.numWaves - player.wavesFought)
    localStorage.ammoUsed = parseInt(localStorage.ammoUsed) + (diffSetting.playerAmmo - player.ammo)
    localStorage.livesLost = parseInt(localStorage.livesLost) + (diffSetting.playerLives - player.lives)
    localStorage.populationLoss = parseInt(localStorage.populationLoss) + (100000 - player.cityPopulation)
    localStorage.gameTime = parseInt(localStorage.gameTime) + gameClock
    console.log(localStorage)
  }

  function getResult() {
    if (aliens.length === 0 && player.wavesFought < 0) {
      gameResult.innerHTML = 'YOU WON!!!'
      localStorage.wins = parseInt(localStorage.wins) + 1
    } else {
      gameResult.innerHTML = 'YOU LOST'
      localStorage.losses = parseInt(localStorage.losses) + 1
    } 
  }

  function gameOver() {
    getResult()
    clearBattleField()
    updateStats()
    goGameOver()
    resetGame()
    resetHTML()    
  }

  function goGameOver() {
    gameOverDiv.style.display = 'initial'
    playerFinalScore.innerHTML = player['currentScore']
    scoreBoard.style.display = 'none'
    playerHighScore.forEach(item => item.innerHTML = localStorage.highScore)
    finalGameTime.innerHTML = gameClock
  }

  function goHome() {
    statsBoardDiv.style.display = 'none'
    gameOverDiv.style.display = 'none'
    homeDiv.style.display = 'initial'
  }

  function goStats() {
    homeDiv.style.display = 'none'
    statsBoardDiv.style.display = 'initial'
    for (let i = 0; i < gamePlayStats.length; i++) {
      gameStats[i].innerHTML = localStorage[gamePlayStats[i]]
    }
  }

  // Event Handlers
  function keyDownHandler(e) {
    if (isGameOver) {
      console.log('Game is not in play!')
    } else if (e.keyCode === 32) {
      fireBullet()
    } else if ([37,39].includes(e.keyCode)) {
      clearInterval(gunTimer)
      charCode = e.keyCode
      gunTimer = setInterval(moveGunner, 15)
    }
  }

  function keyUpHandler(e) {
    if (e.keyCode !== 32) clearInterval(gunTimer)
  }

  // Event Listeners
  startBtn.addEventListener('click', startGame)
  playAgainBtn.addEventListener('click', startGame)
  homeBtn.forEach(Btn => Btn.addEventListener('click', goHome))
  statsBtn.addEventListener('click', goStats)

  window.addEventListener('keydown', keyDownHandler)
  window.addEventListener('keyup', keyUpHandler)

  // Other
  gameOverDiv.style.display = 'none'
  scoreBoard.style.display = 'none'
  statsBoardDiv.style.display = 'none'
}

window.addEventListener('DOMContentLoaded', setUp)