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

  const gameDiffSettings = [{
    waveSize: 15,
    waveSpeed: 0.002,
    numWaves: 3,
    bombFrequency: 4,
    numBunkers: 3,
    bunkerStrength: 3,
    playerLives: 5,
    playerAmmo: 65,
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
    playerAmmo: 140,
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
    playerAmmo: 290,
    populationHit: 4000,
    motherShipsLives: 15
  }]

  let isGameOver = true // Bool --> Tracks whether the game is in play or not
  let gameResult // Array --> stores the final result and a string denoting how the game was won/lost
  let gameClock = null // Number --> tracks the duration of the game
  let motherShipInPlay = false // Bool --> Tracks whether or not the mothership is in the game

  let diffSetting // Object --> Stores the game configuration settings for the selected difficulty
  let bombCondition // Array --> Stores false values; the value at the first index is true
  let motherShipLife // Number --> Stores the number of remaining lives the mothership has

  const gamePlayStats = ['gamesPlayed', 'wins', 'losses','highScore', 'totalScore', 'alienKills', 'motherShipKills', 'wavesFought', 'ammoUsed', 'livesLost', 'populationLoss', 'gameTime']
  gamePlayStats.forEach(stat => localStorage.setItem(stat, 0)) // Initialises all of the player stats in localStorage

  // Timer Variables
  let gameTimer = null // Runs every second after the game starts
  let gameOverTimer = null // Runs every millisecond to check if the game should end
  let gunMoveTimer = null // Runs every 12 milliseconds to control the movements of the gunner
  let alienMoveTimer = null // Runs every millisecond to move the alien container

  // DOM Variables
  let charCode = null // Number --> Stores the keyCode value of a keydown event
  let alienX = null // Number --> Stores the x-coordinate of the alien container
  let direction = true // Bool --> Tracks whether not the alien container needs to change direction

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
  const homeBtns = document.querySelectorAll('.go-home')
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
  
  const laserBlastAudio = document.querySelector('#laser-blast')
  const bombDropAudio = document.querySelector('#bomb-drop')
  const bombExplosionAudio = document.querySelector('#bomb-explosion')
  const alienKillAudio = document.querySelector('#alien-kill')
  const mainThemeAudio = document.querySelector('#main-theme')

  let aliens // Array --> Stores all the divs with a class of alien or mothership
  let alienStep // Number --> Stores the value (in px) the alien container will move left or right
  let alienContainer // DOM Object --> Container for all divs with class of alien or mothership
  let bunkers // Arrays --> Stores all divs with a class of bunker
  let bunkerContainer // DOM Object --> Container for all divs with class of bunker
  let gunner // DOM Object --> Div with class of gunner
  let gunX // DOM Object --> X-coordinate of the gunner
  let gunStep // Number --> Value (in px) the gunner will move left or right
  let citySkyline // DOM Object --> Div with a background image of a city skyline 
  
  // FUNCTIONS

  // Alien & Gunner Movements
  function moveGunner() {
    /* HOW IT WORKS
    1) gunX is assigned to the x-coordinate (in px) of the gunner. 
    2) Depending on the value of charCode the gunX will be either incremented or decremented.
    3) The position of the gunner is then set to the new value of gunX
    */
    gunX = gunner.offsetLeft
    gunStep = 0.01 * mainContainer.scrollWidth
    if (charCode === 39) {
      gunner.offsetLeft + gunStep > mainContainer.scrollWidth - gunner.offsetWidth ? clearInterval(gunMoveTimer) : gunX += gunStep
    } else if (charCode === 37) {
      gunner.offsetLeft - gunStep <= 0 ? clearInterval(gunMoveTimer) : gunX -= gunStep
    }
    gunner.style.left = `${gunX}px`
  }

  function moveAliens() {
    /* HOW IT WORKS
    1) The variable alienCondition is declared
    2) IF the alienContainer is at either end of the mainContainer
      a) The value of direction is changed
      b) alienCondition is assigned to a boolean denoting if any aliens are at the bottom of alienContainer
      c) IF alienCondition is true
        i) Each alien is moved down by 1% of the alienContainer's height
    3) alienCondition is assigned to a boolean denoting if any aliens are at the bottom of alienContainer
    4) Depending on the value of alienCondition alienStep is assigned to 0.8% of the mainContainer's width or 
    to the percentage specified in diffSetting
    5) Depending on the value of direction alienX will either be incremented or decremented by alienStep
    6) The position of the alienContainer is set to the postion of alien
    */ 
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
    /* HOW IT WORKS
    1) The function takes a parameter (bullet) which is a DOM object with class bullet
    2) The variable bulletY is declared and assigned to the y-coordinate of bullet
    3) A timer is (bulletTimer) runs a function that checks if the bullet collided with any
    of the aliens, bunkers or top of the mainContainer; it does this every millisecond
    4) While the bullet hasn't collided with anything bulletY is incremented and the position
    of bullet is set to bulletY
    */
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
              updateAudio('motherShipKill')
            } else {
              updateAudio('alienKill')
            }
          } else {
            alienContainer.removeChild(alien)
            aliens.splice(aliens.indexOf(alien), 1)
            updateScore('alienKill')
            updateAudio('alienKill')
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
    /* HOW IT WORKS
    1) A DOM object is created and assigned to the variable bullet
    2) bullet is then given a class of 'bullet' and added to mainContainer
    3) The left and top position of bullet is set to the gunX and the vertical
    position of the gunner respectively
    4) The moveBullet() function is then run with bullet passed in as a parameter
    */
    const bullet = document.createElement('div')
    bullet.classList.add('bullet')
    mainContainer.appendChild(bullet)
    bullet.style.left = `${gunX}px`
    bullet.style.top = `${gunner.offsetTop}px`
    moveBullet(bullet)
  }

  function fireBullet() {
    /* HOW IT WORKS
    1) IF player.ammo is greater than 0 the createBullet() function will be run
    and the player.ammo will be decremented
    */
    if (player.ammo > 0) {
      createBullet()
      player['ammo']--
      updateAudio('laserBlast')
    } else {
      console.log('YOU\'RE OUT of AMMO!!!')
    }
    if (player.ammo > 0) ammoCountSpan.innerHTML = `Remaining Ammo: ${player.ammo}`
    else ammoCountSpan.innerHTML = 'OUT OF AMMO!!!'
  }

  function moveBomb(bomb) {
    /* HOW IT WORKS
    1) The function takes a parameter (bomb) which is a DOM object with class bomb
    2) The variable bombY is declared and assigned to the y-coordinate of bomb
    3) A timer is (bombTimer) runs a function that checks if the bomb has collided with any
    of the gunner, bunkers or bottom of the mainContainer; it does this every millisecond
    4) While the bomb hasn't collided with anything bombY is incremented and the position
    of bomb is set to bombY
    */
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
        updateAudio('gunnerHit')
      } else if (bombY >= mainContainer.scrollHeight - bomb.offsetHeight) {
        clearInterval(bombTimer)
        mainContainer.removeChild(bomb)
        updateScore('cityHit')
        updateAudio('cityHit')
      } else {
        bombY += 0.003 * mainContainer.scrollHeight
        bomb.style.top = `${bombY}px`
      }
    }, 5)
  }

  function createBomb(alien) {
    /* HOW IT WORKS
    1) The function takes in a parameter (alien) which is a DOM object
    2) A DOM object is created and assigned to the variable bomb
    3) bomb is then given a class of 'bomb' and added to mainContainer
    4) The left and top position of bomb is set to the left and vertical
    position of alien respectively
    5) The moveBomb() function is then called with bomb passed in as a parameter
    */
    const bomb = document.createElement('div')
    bomb.classList.add('bomb')
    mainContainer.appendChild(bomb)
    bomb.style.left = `${alien.offsetLeft + alienContainer.offsetLeft}px`
    bomb.style.top = `${alien.offsetTop + alienContainer.offsetTop}px`
    moveBomb(bomb)
  }

  function dropBombs() {
    /* HOW IT WORKS
    1) IF the value of bombCondition at a randomly chosen index is true
      a) An alien from the aliens array is randomly chosen and assigned to chosenAlien
      b) The createBomb() is called with chosenAlien passed as a parameter
    */
    if (bombCondition[Math.floor(Math.random() * bombCondition.length)]) {
      const chosenAlien = aliens[Math.floor(Math.random() * aliens.length)]
      createBomb(chosenAlien)
      updateAudio('bombDrop')
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

  function setBunkers() {
    bunkers = new Array(diffSetting.numBunkers)
    bunkerContainer = document.createElement('div')
    mainContainer.appendChild(bunkerContainer)
    bunkerContainer.classList.add('bunker-container')
  }

  function addBunkers() {
    for (let i = 0; i < bunkers.length; i++) {
      const bunkerDiv = document.createElement('div')
      bunkerDiv.classList.add('bunker')
      bunkers[i] = [bunkerDiv, diffSetting.bunkerStrength]
      bunkerContainer.appendChild(bunkerDiv)
    }

    bunkers.forEach(item => item[0].style.left = `${item[0].offsetLeft}px`)
    bunkers.forEach(item => item[0].classList.add('fixed-bunker'))
  }

  function setAliens() {
    aliens = []
    alienContainer = document.createElement('div')
    mainContainer.appendChild(alienContainer)
    alienContainer.classList.add('alien-container')
  }

  function addAliens() {
    const newAlienWave = new Array(diffSetting.waveSize)

    for (let i = 0; i < newAlienWave.length; i++) {
      const alien = document.createElement('div')
      alien.classList.add('alien')
      newAlienWave[i] = alien
      alienContainer.appendChild(alien)
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

    updateAudio('motherShip')
  }

  function setBattleField() {
    addCitySkyline()
    setBunkers()
    addBunkers()
    addGunner()
    setAliens()
    addAliens()
  }

  function clearBattleField() {
    mainContainer.removeChild(citySkyline)
    mainContainer.removeChild(gunner)
    mainContainer.removeChild(bunkerContainer)
    mainContainer.removeChild(alienContainer)
  }

  // Collision Detection
  function collisionDetector(movObj, statObj, movOffsetX = 0, movOffsetY = 0, statOffsetX = 0, statOffsetY = 0) {
    /* HOW IT WORKS
    1) The function takes 6 parameters:
      > A moving object (movObj)
      > A static object (statObj)
      > The horizontal and vertical offsets of the moving object (movOffsetX & movOffsetY)
      > The horizontal and vertical offsets of the static object (statOffsetX & statOffsetY)
    2) The position of the moving object is defined relative to the mainContainer 
    3) The position of the static object is defined relative to the mainContainer
    4) The function checks if the two objects are in the same horizontal position; a boolean
    representing this condition is then assigned to xCondition
    5) The function checks if the two objects are in the same vertical position; a boolean
    representing this condition is then assigned to yCondition
    6) The function checks if either xCondition or yCondition is true and returns a boolean
    */
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
    updateAudio('heatOfBattle')
  }

  // Game Start & Play
  function startGame() {
    isGameOver = false
    setUpGame()
    alienMoveTimer = setInterval(moveAliens, 1)
    gameTimer = setInterval(playGame, 1000)
  }
  
  function playGame() {
    clearInterval(gameOverTimer)
    gameClock++
    gameClockSpan.innerHTML = gameClock
    if (player.wavesFought === 0 && !motherShipInPlay && aliens.every(item => item.offsetTop > 0.3 * alienContainer.scrollHeight)) addMotherShip()
    if (aliens.every(item => item.offsetTop > 0.6 * alienContainer.scrollHeight) && !motherShipInPlay) addAliens(diffSetting.waveSize)
    dropBombs()
    gameOverTimer = setInterval(checkForGameOver, 1)
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
    playerCurrentScoreSpan.innerHTML = player['currentScore']
    lifeCountSpan.innerHTML = player['lives']
    populationCountSpan.innerHTML = player['cityPopulation']
  }

  function checkForGameOver() {
    if (aliens.length === 0 && player.wavesFought < 0 || player.lives === 0 || player.cityPopulation === 0) {
      gameOver()
    }
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
    clearInterval(gunMoveTimer)
    clearInterval(gameTimer)
    clearInterval(alienMoveTimer)
    clearInterval(gameOverTimer)
    gunMoveTimer = null
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
      gameResult = [true, returnString]
      updateAudio('victory')
      return
    } else if (player.lives === 0) {
      returnString = 'DEFEAT\nYou were killed'
    } else if (player.cityPopulation === 0) {
      returnString = 'DEFEAT\nThe Republic was destroyed'
    }
    gameResult = [false, returnString] 
    updateAudio('defeat')
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
    updateAudio('quit')
    resetHTML()
    goHome()
  }

  // Audio Handler
  function updateAudio(event) {
    switch (event) {
      case 'gameLoad':
        mainThemeAudio.src = 'assets/star-wars-opening-theme.mp3'
        mainThemeAudio.play()
        break
      case 'heatOfBattle':
        mainThemeAudio.src = 'assets/heat-of-battle.mp3'
        mainThemeAudio.play()
        break
      case 'motherShip':
        mainThemeAudio.src = 'assets/imperial-march.mp3'
        mainThemeAudio.play()
        break
      case 'victory':
        mainThemeAudio.src = 'assets/star-wars-main-theme.mp3'
        break
      case 'defeat':
        mainThemeAudio.src = 'assets/imperial-march.mp3'
        break
      case 'quit':
        mainThemeAudio.src = 'assets/imperial-march.mp3'
        break
      case 'laserBlast':
        laserBlastAudio.src = 'assets/laser-blast.mp3'
        laserBlastAudio.play()
        break
      case 'bombDrop':
        bombDropAudio.src = 'assets/bomb-launch.mp3'
        bombDropAudio.play()
        break
      case 'alienKill':
        alienKillAudio.src = 'assets/alien-kill.mp3'
        alienKillAudio.play()
        break
      case 'motherShipKill':
        bombExplosionAudio.src = 'assets/bomb-explosion.mp3'
        bombExplosionAudio.play()
        break
      case 'cityHit':
        bombExplosionAudio.src = 'assets/bomb-explosion.mp3'
        bombExplosionAudio.play()
        break
      case 'gunnerHit':
        bombExplosionAudio.src = 'assets/bomb-hit.mp3'
        bombExplosionAudio.play()
        break
      default:
        break
    }
  } 

  // Initialisers
  function loadGame() {
    header.style.display = 'flex'
    main.style.display = 'flex'
    titleScreenDiv.style.display = 'none'
    updateAudio('gameLoad')
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
      return
    } else if (e.keyCode === 32) {
      fireBullet()
    } else if ([37,39].includes(e.keyCode)) {
      clearInterval(gunMoveTimer)
      charCode = e.keyCode
      gunMoveTimer = setInterval(moveGunner, 12)
    }
  }

  function keyUpHandler(e) {
    if ([37,39].includes(e.keyCode)) clearInterval(gunMoveTimer)
  }

  // Event Listeners
  titleScreenStartBtn.addEventListener('click', loadGame)
  homeBtns.forEach(Btn => Btn.addEventListener('click', goHome))
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