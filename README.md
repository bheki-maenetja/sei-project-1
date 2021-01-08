# ![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png) SEI45 - Project 01 (Grid Game)
My first project for the General Assembly Software Engineering Immersive course. A static web application based on the popular arcade game Space Invaders.

## Getting Started
### Installation
- Clone this repository by running the terminal command: `git clone git@github.com:bheki-maenetja/sei-project-1.git`
- Open the index.html file in a web browser of your choice

### Deployment
- You can view the deployed version of the webapp [here](https://bheki-maenetja.github.io/sei-project-1/)

## Technologies Used
- HTML
- CSS
- Vanilla JavaScript (ES6)
 
## Overview
The game is a Star Wars themed implementation of the popular arcade game Space Invaders. A player chooses their desired difficulty. When the game begins, the player will have a finite amount of lives (and ammo) to shoot down multiple waves of approaching aliens. The player moves their spacecraft with the left and right arrow keys whilst firing bullets with the spacebar. The objective of the game is to eliminate all the aliens before they destroy the city. Points are awarded for each alien kill and bonus points are won for each Darth Vader kill.

|![](assets/screenshot-titlepage.png)<figcaption>Title page</figcaption>  |![](assets/screenshot-homepage.png)<figcaption>Home page</figcaption> |
|----------|--------------------------|

<figcaption><strong>Gameplay</strong></figcaption>
<img src="assets/screenshot-gameplay.gif" alt="game play" width="100%" />

## Development
Although the project brief suggested that the project should be a grid-based game, rather than using a grid, the game works by adding and removing objects positioned within a DOM container. The objects are then animated by calling functions that adjust their position relative to the container.

### The DOM Container
- This a simple `div` element with a fixed width of 500px and a height that is 95% of the viewport
- Everything that happens during the game takes place within the DOM container. Aliens and bunkers are themselves placed in containers that are positioned relative to this container.
- When the game is not in play the user navigates through the site by toggling the display property of menu `div`s positioned within the container thus creating the illusion of 'pages' when in fact there is only one page.
```
// Website navigation
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
```

### Moving Objects
- Objects are moved by using JavaScript's built-in `setInterval()` function.
- Each interval is passed a callback function that slightly adjusts the relative position - horizontal in the case of aliens and the spaceship, vertical in the case of bullets & bombs - of an object within the main container.
- Calling these callback functions at an interval of a few milliseconds allows for the slick, seamless movement of objects.

```
// Moving the player's spaceship
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
    gunner.style.left = ${gunX}px
  }
```
```
// Moving aliens
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
```
### Collsion Detection
- The game's functionality relies on the ability to detect collsions between bullets & aliens, bombs & the spaceship, bombs & the city etc.
- All collisions between objects are handled by a universal collision detection function that compares the relative positions of a mobile and static object and returns a boolean denoting whether or not a collsion has occured.
- It is important to note that the game only acts upon collisions between **one mobile and one static object**; it cannot detect collsions between to moving objects (e.g. a bullet hitting a bomb)

```
// The universal collision detection function
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
```
## Reflection
### Challenges
- The main challenge of this project was the positioning and layout of DOM elements; particularly the positioning of aliens. Each alien first has to be positioned relatively within the alien container and the positioned absolutely when the game starts; this ensures that aliens remain fixed in place when an adjacent alien is destroyed.
- Another challenge was the management of timers. The game uses timers for the movements of the spaceship and alien container. Additionally, a new timer is initialised each time a bullet or bomb is fired; this timer is stopped when the bullet or bomb hits another object.

### Room for Improvement
- **Responsive design**: whilst the game does have a responsive layout, the various 'pages' of game are still too small on mobile screens
- **Animation of bullets and bombs**: though they work fine in practice, the functions used to adjust the position of bullets and bombs are clunky and inefficient. Perhaps a better solution would involve the use of css animations.
- **Ammo glitch**: during gameplay it is possible for a player to run out of ammo. The player then has to wait for the aliens to destroy the city or purposely get themselves killed. There are a number of ways to resolve this: unlimited ammo, ammo packs etc.

## Future Features
- **Complex alien movements**: in the game all the aliens are fixed to a container and therefore move in unison; in easier difficulty levels this makes their movements quite predictable. In the next iteration of the game, aliens will be able to move independently of eachother and at different speeds. Some might be moving right while others move left. It should be quite the challenge even on the easiest difficulty level!
- **Levels & Unlockables**: the next iteration of the game will allow players to 'level up'. A player's 'level' will be calculated from gameplay stats such as alien kills, waves fought, mothership kills etc. Levelling up will allow a player to unlock bonus features such more powerful guns, speed boosts, ammo packs etc.
