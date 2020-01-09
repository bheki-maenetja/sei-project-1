function setUp() {
  // VARIABLES
  
  // Game Variables
  const player = {
    currentScore: 0,
    lives: 0,
    ammo: 0,
    cityPopulation: 0,
    wavesFought: 0,
    alienKills: 0,
    motherShipKills: 0
  }

  let isGameOver = true
  let gameResult
  let gameClock = null
  let motherShipInPlay = false

  let bombCondition
  let motherShipLife
  let diffSetting

  const gameDiffSettings = [{
    waveSize: 15,
    waveSpeed: 0.002,
    numWaves: 3,
    bombFrequency: 4,
    numBunkers: 3,
    bunkerStrength: 3,
    playerLives: 5,
    playerAmmo: 75,
    populationHit: 1000,
    motherShipsLives: 5
  }, {
    waveSize: 23,
    waveSpeed: 0.003,
    numWaves: 5,
    bombFrequency: 3,
    numBunkers: 2,
    bunkerStrength: 6,
    playerLives: 3,
    playerAmmo: 150,
    populationHit: 2000,
    motherShipsLives: 10
  }, {
    waveSize: 30,
    waveSpeed: 0.004,
    numWaves: 8,
    bombFrequency: 2,
    numBunkers: 1,
    bunkerStrength: 9,
    playerLives: 1,
    playerAmmo: 300,
    populationHit: 4000,
    motherShipsLives: 15
  }]

  const gamePlayStats = ['gamesPlayed', 'wins', 'losses','highScore', 'totalScore', 'alienKills', 'motherShipKills', 'wavesFought', 'ammoUsed', 'livesLost', 'populationLoss', 'gameTime']
  gamePlayStats.forEach(stat => localStorage.setItem(stat, 0))

  // Timer Variables
  let gameTimer = null
  let gameOverTimer = null
  let gunTimer = null
  let alienMoveTimer = null

  // DOM Variables
  let charCode = null
  let alienX = null
  let direction = true

  const header = document.querySelector('header')
  const main = document.querySelector('main')
  
  const mainContainer = document.querySelector('.container')

  const titleScreenDiv = document.querySelector('.title-screen')
  const homeDiv = document.querySelector('#home')
  const statsBoardDiv = document.querySelector('#player-stats')
  const gameExplainerDiv = document.querySelector('#game-explainer')
  const scoreBoardDiv = document.querySelector('#score-board')
  const gameOverDiv = document.querySelector('#game-over')
  
  const titleScreenStartBtn = document.querySelector('#title-screen-start')
  const homeBtn = document.querySelectorAll('.go-home')
  const playBtn = document.querySelector('#play')
  const statsBtn = document.querySelector('#stats')
  const gameExplainBtn = document.querySelector('#go-explainer')
  const quitGameBtn = document.querySelector('#quit-game')
  const playAgainBtn = document.querySelector('#play-again')

  const diffSelector = document.querySelector('.diff-selector')
  
  const gameResultSpan = document.querySelector('#game-result')
  const playerFinalScoreSpan = document.querySelector('#final-score')
  const finalGameTimeSpan = document.querySelector('#game-time')
  const playerHighScoreSpans = document.querySelectorAll('.high-score')
  
  const playerCurrentScoreSpan = document.querySelector('#current-score')
  const gameClockSpan = document.querySelector('#game-timer')
  const lifeCountSpan = document.querySelector('#life-count')
  const populationCountSpan = document.querySelector('#population-count')
  const ammoCountSpan = document.querySelector('#ammo-count')
  const waveCountSpan = document.querySelector('#wave-count')
  
  const gameStatSpans = document.querySelectorAll('.game-stat')
  
  const falconBlastAudio = document.querySelector('#falcon-blast')
  const bombDropAudio = document.querySelector('#bomb-drop')
  const bombExplosionAudio = document.querySelector('#bomb-explosion')
  const alienKillAudio = document.querySelector('#alien-kill')
  const mainThemeAudio = document.querySelector('#main-theme')

  let aliens
  let alienStep
  let alienContainer
  let bunkers 
  let bunkerContainer
  let gunner
  let gunX
  let gunStep
  let citySkyline
  
  // FUNCTIONS

  // Alien & Gunner Movements
  function moveGunner() {
    gunX = gunner.offsetLeft
    gunStep = 0.01 * mainContainer.scrollWidth
    if (charCode === 39) {
      gunner.offsetLeft + gunStep > mainContainer.scrollWidth - gunner.offsetWidth ? clearInterval(gunTimer) : gunX += gunStep
    } else if (charCode === 37) {
      gunner.offsetLeft - gunStep <= 0 ? clearInterval(gunTimer) : gunX -= gunStep
    }
    gunner.style.left = `${gunX}px`
  }

  function moveAliens() {
    let alienCondition
    if (alienContainer.offsetLeft >= mainContainer.scrollWidth - alienContainer.offsetWidth || alienContainer.offsetLeft <= 0) {
      direction = !direction
      alienCondition = aliens.every(alien => alien.offsetTop < alienContainer.scrollHeight - alien.offsetHeight)
      if (alienCondition) {
        aliens.forEach(alien => {
          let alienY = alien.offsetTop
          alienY += 0.01 * alienContainer.scrollHeight
          alien.style.top = `${alienY}px`
        })
      }
    }
    alienCondition = aliens.every(alien => alien.offsetTop < alienContainer.scrollHeight - alien.offsetHeight)
    alienStep = !alienCondition ? 0.008 * mainContainer.scrollWidth : diffSetting.waveSpeed * mainContainer.scrollWidth
    direction ? alienX += alienStep : alienX -= alienStep
    alienContainer.style.left = `${alienX}px`
  }

  // Bullets & Bombs
  function moveBullet(bullet) {
    let bulletY = bullet.offsetTop
    const bulletTimer = setInterval(() => {
      if (isGameOver) {
        clearInterval(bulletTimer)
        mainContainer.removeChild(bullet)
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
            alienKillAudio.src = 'assets/alien-kill.mp3'
            alienKillAudio.play()
          } else {
            alienContainer.removeChild(alien)
            aliens.splice(aliens.indexOf(alien), 1)
            updateScore('alienKill')
          }
          mainContainer.removeChild(bullet)
          clearInterval(bulletTimer)
        }
      })
      bunkers.map(bunker => {
        if (!collisionDetector(bullet, bunker[0], 0, 0, 0, bunkerContainer.offsetTop)) {
          mainContainer.removeChild(bullet)
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
        bulletY -= 0.003 * mainContainer.scrollHeight
        bullet.style.top = `${bulletY}px`
      } else {
        clearInterval(bulletTimer)
        mainContainer.removeChild(bullet)
        console.log('Shot landed')
      }
    }, 1)
  }

  function createBullet() {
    const bullet = document.createElement('div')
    bullet.classList.add('bullet')
    mainContainer.appendChild(bullet)
    bullet.style.left = `${gunX}px`
    bullet.style.top = `${gunner.offsetTop}px`
    moveBullet(bullet)
  }

  function fireBullet() {
    if (player.ammo > 0) {
      createBullet()
      player['ammo']--
      falconBlastAudio.src = 'assets/laser-blast.mp3'
      falconBlastAudio.play()
    } else {
      console.log('YOU\'RE OUT of AMMO!!!')
    }
    if (player.ammo > 0) ammoCountSpan.innerHTML = `Remaining Ammo: ${player.ammo}`
    else ammoCountSpan.innerHTML = 'OUT OF AMMO!!!'
  }

  function moveBomb(bomb) {
    let bombY = bomb.offsetTop
    const bombTimer = setInterval(() => {
      if (isGameOver) {
        clearInterval(bombTimer)
        mainContainer.removeChild(bomb)
        return
      }
      bunkers.forEach(bunker => {
        if (!collisionDetector(bomb, bunker[0], 0, bomb.offsetHeight, 0, bunkerContainer.offsetTop)) {
          mainContainer.removeChild(bomb)
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
        mainContainer.removeChild(bomb)
        updateScore('gunnerHit')
      } else if (bombY >= mainContainer.scrollHeight - bomb.offsetHeight) {
        clearInterval(bombTimer)
        mainContainer.removeChild(bomb)
        updateScore('cityHit')
      } else {
        bombY += 0.003 * mainContainer.scrollHeight
        bomb.style.top = `${bombY}px`
      }
    }, 5)
  }

  function createBomb(alien) {
    const bomb = document.createElement('div')
    bomb.classList.add('bomb')
    mainContainer.appendChild(bomb)
    bomb.style.left = `${alien.offsetLeft + alienContainer.offsetLeft}px`
    bomb.style.top = `${alien.offsetTop + alienContainer.offsetTop}px`
    moveBomb(bomb)
  }

  function dropBombs() {
    if (bombCondition[Math.floor(Math.random() * bombCondition.length)]) {
      const chosenAlien = aliens[Math.floor(Math.random() * aliens.length)]
      createBomb(chosenAlien)
      bombDropAudio.src = 'assets/bomb-launch.mp3'
      bombDropAudio.play()
    }
  }

  // Setting Battlefield
  function addCitySkyline() {
    citySkyline = document.createElement('div')
    mainContainer.appendChild(citySkyline)
    citySkyline.classList.add('city-skyline')
  }

  function addGunner() {
    gunner = document.createElement('div')
    mainContainer.appendChild(gunner)
    gunner.classList.add('gunner')
    gunX = gunner.offsetLeft
  }

  function addBunkers(numBunkers, bunkerStrength) {
    bunkers = new Array(numBunkers)
    bunkerContainer = document.createElement('div')
    mainContainer.appendChild(bunkerContainer)
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

  function addAliens(waveSize) {
    const newAlienWave = new Array(waveSize)

    for (let i = 0; i < newAlienWave.length; i++) {
      const alien = document.createElement('div')
      alien.classList.add('alien')
      newAlienWave[i] = alien
      alienContainer.appendChild(alien)
      // alien.style.backgroundColor = ['yellow', 'green', 'red', 'blue', 'lime', 'cyan', 'violet'][Math.floor(Math.random() * 7)]
    }

    newAlienWave.forEach(item => {
      item.style.left = `${item.offsetLeft}px`
      item.style.top = `${item.offsetTop / alienContainer.scrollHeight * 100}%`
    })

    newAlienWave.forEach(item => item.classList.add('fixed-alien'))

    aliens = aliens.concat(newAlienWave)

    player['wavesFought']--
    const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
    waveCountSpan.innerHTML = ordinals[diffSetting.numWaves - player.wavesFought - 1] + ' wave'
  }

  function setAliens() {
    aliens = []
    alienContainer = document.createElement('div')
    mainContainer.appendChild(alienContainer)
    alienContainer.classList.add('alien-container')
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
    waveCountSpan.innerHTML = 'DARTH VADER'

    mainThemeAudio.src = 'assets/imperial-march.mp3'
    mainThemeAudio.play()
  }

  function setBattleField() {
    addCitySkyline()
    addGunner()
    addBunkers(diffSetting.numBunkers, diffSetting.bunkerStrength)
    setAliens()
    addAliens(diffSetting.waveSize)
  }

  function clearBattleField() {
    mainContainer.removeChild(citySkyline)
    mainContainer.removeChild(gunner)
    mainContainer.removeChild(bunkerContainer)
    mainContainer.removeChild(alienContainer)
  }

  // Collision Detection
  function collisionDetector(movObj, statObj, movOffsetX = 0, movOffsetY = 0, statOffsetX = 0, statOffsetY = 0) {
    const movX = movObj.offsetLeft + movOffsetX
    const movY = movObj.offsetTop + movOffsetY
    const statX = statObj.offsetLeft + statOffsetX
    const statY = statObj.offsetTop + statOffsetY
    const xCondition = movX + movObj.offsetWidth < statX || movX > statX + statObj.offsetWidth
    const yCondition = movY < statY || movY > statY + statObj.offsetHeight
    return xCondition || yCondition
  }

  // Game Set Up
  function setGameVars() {
    diffSetting = gameDiffSettings[diffSelector.value - 1]
    motherShipLife = diffSetting.motherShipsLives
    bombCondition = Array(diffSetting.bombFrequency).fill(false)
    bombCondition[0] = true
  }

  function setPlayer() {
    player['lives'] = diffSetting.playerLives
    player['cityPopulation'] = 100000
    player['wavesFought'] = diffSetting.numWaves
    player['ammo'] = diffSetting.playerAmmo
  }

  function setHTML() {
    homeDiv.style.display = 'none'
    gameOverDiv.style.display = 'none'
    scoreBoardDiv.style.display = 'flex'
    playerCurrentScoreSpan.innerHTML = 0
    gameClockSpan.innerHTML = 0
    populationCountSpan.innerHTML = player.cityPopulation
    lifeCountSpan.innerHTML = player.lives
    ammoCountSpan.innerHTML = `Remaining ammo: ${player.ammo}`
  }

  function setUpGame() {
    setGameVars()
    setPlayer()
    setHTML()
    setBattleField()
  }

  // Game Start & Play
  function startGame() {
    isGameOver = false
    setUpGame()
    alienMoveTimer = setInterval(moveAliens, 1)
    gameTimer = setInterval(playGame, 1000)
    mainThemeAudio.src = 'assets/heat-of-battle.mp3'
    mainThemeAudio.play()
  }
  
  function playGame() {
    clearInterval(gameOverTimer)
    gameClock++
    gameClockSpan.innerHTML = gameClock
    if (player.wavesFought === 0 && !motherShipInPlay && aliens.every(item => item.offsetTop > 0.3 * alienContainer.scrollHeight)) addMotherShip()
    if (aliens.every(item => item.offsetTop > 0.6 * alienContainer.scrollHeight) && !motherShipInPlay) addAliens(diffSetting.waveSize)
    dropBombs()
    // console.log('Playing the GAME!')
    gameOverTimer = setInterval(checkForGameOver, 1)
  }

  function updateScore(event) {
    switch (event) {
      case 'alienKill':
        player['currentScore'] += 100
        player['alienKills']++
        console.log('Alien Kill!!!\nScore:', player['currentScore'])
        alienKillAudio.src = 'assets/alien-kill.mp3'
        alienKillAudio.play()
        break
      case 'motherShipKill':
        player['currentScore'] += motherShipLife === 0 ? 500 : 0
        player['motherShipKills']++
        console.log('You killed the mothership!!!\nScore', player['currentScore'])
        break
      case 'cityHit':
        player['cityPopulation'] -= diffSetting.populationHit
        console.log('City hit!\nPopulation Remaining:', player['cityPopulation'])
        bombExplosionAudio.src = 'assets/bomb-explosion.mp3'
        bombExplosionAudio.play()
        break
      case 'gunnerHit':
        player['lives']--
        console.log(`You've been hit!\nLives remaining: ${player['lives']}`)
        bombExplosionAudio.src = 'assets/bomb-hit.mp3'
        bombExplosionAudio.play()
        break
      default:
        break
    }
    playerCurrentScoreSpan.innerHTML = player['currentScore']
    lifeCountSpan.innerHTML = player['lives']
    populationCountSpan.innerHTML = player['cityPopulation']
  }

  function checkForGameOver() {
    if (aliens.length === 0 && player.wavesFought < 0 || player.lives === 0 || player.cityPopulation === 0) {
      gameOver()
    }
    // console.log('Running game over timer')
  }

  // Game Over & Reset
  function resetGameVars() {
    diffSetting = gameDiffSettings[diffSelector.value - 1]
    gameClock = null
    isGameOver = true
    motherShipInPlay = false
  }

  function resetPlayer() {
    Object.keys(player).map(key => player[key] = 0)
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
    playerCurrentScoreSpan.innerHTML = 0
    gameClockSpan.innerHTML = 0
    populationCountSpan.innerHTML = 0
    lifeCountSpan.innerHTML = 0
    mainThemeAudio.play()
  }

  function resetGame() {
    resetGameVars()
    resetPlayer()
    resetTimers()
    resetDomVars()
  }

  function getResult() {
    let returnString
    if (aliens.length === 0 && player.wavesFought < 0) {
      returnString = 'VICTORY!!!\nYou defeated the empire!'
      mainThemeAudio.src = 'assets/star-wars-main-theme.mp3'
      mainThemeAudio.play()
      gameResult = [true, returnString]
      return
    } else if (player.lives === 0) {
      returnString = 'DEFEAT\nYou were killed'
    } else if (player.cityPopulation === 0) {
      returnString = 'DEFEAT\nThe Republic was destroyed'
    }
    mainThemeAudio.src = 'assets/imperial-march.mp3'
    gameResult = [false, returnString] 
  }

  function updateStats() {
    localStorage.gamesPlayed = parseInt(localStorage.gamesPlayed) + 1
    if (gameResult[0]) localStorage.wins = parseInt(localStorage.wins) + 1
    else localStorage.losses = parseInt(localStorage.losses) + 1
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

  function gameOver() {
    getResult()
    clearBattleField()
    updateStats()
    goGameOver()
    resetGame()
    resetHTML()    
  }

  // Moving Between Game Boards
  function goGameOver() {
    gameResultSpan.innerHTML = gameResult[1]
    gameOverDiv.style.display = 'flex'
    playerFinalScoreSpan.innerHTML = player['currentScore']
    scoreBoardDiv.style.display = 'none'
    playerHighScoreSpans.forEach(item => item.innerHTML = localStorage.highScore)
    finalGameTimeSpan.innerHTML = gameClock
  }

  function goHome() {
    scoreBoardDiv.style.display = 'none'
    statsBoardDiv.style.display = 'none'
    gameOverDiv.style.display = 'none'
    gameExplainerDiv.style.display = 'none'
    homeDiv.style.display = 'flex'
  }

  function goStats() {
    homeDiv.style.display = 'none'
    statsBoardDiv.style.display = 'flex'
    for (let i = 0; i < gamePlayStats.length; i++) {
      gameStatSpans[i].innerHTML = localStorage[gamePlayStats[i]]
    }
  }

  function goExplainer() {
    homeDiv.style.display = 'none'
    gameExplainerDiv.style.display = 'flex'
  }

  function quitGame() {
    clearBattleField()
    resetGame()
    mainThemeAudio.src = 'assets/imperial-march.mp3'
    resetHTML()
    goHome()
  }

  // Initialisers
  function loadGame() {
    header.style.display = 'flex'
    main.style.display = 'flex'
    titleScreenDiv.style.display = 'none'
    mainThemeAudio.src = 'assets/star-wars-opening-theme.mp3'
    mainThemeAudio.play()
  }

  function initialHTMLSetUp() {
    gameOverDiv.style.display = 'none'
    scoreBoardDiv.style.display = 'none'
    statsBoardDiv.style.display = 'none'
    gameExplainerDiv.style.display = 'none'
    header.style.display = 'none'
    main.style.display = 'none'
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
  titleScreenStartBtn.addEventListener('click', loadGame)
  homeBtn.forEach(Btn => Btn.addEventListener('click', goHome))
  playBtn.addEventListener('click', startGame)
  statsBtn.addEventListener('click', goStats)
  gameExplainBtn.addEventListener('click', goExplainer)
  quitGameBtn.addEventListener('click', quitGame)
  playAgainBtn.addEventListener('click', startGame)

  window.addEventListener('keydown', keyDownHandler)
  window.addEventListener('keyup', keyUpHandler)

  // Function Calls
  initialHTMLSetUp()
}

window.addEventListener('DOMContentLoaded', setUp)