


# WDI Project 01 — Space Invaders
## Overview
This project is a front-end web application built with HTML, CSS and vanilla JavaScript. It’s an implementation of the popular arcade game Space Invaders.

## Approach
Rather than using a grid, the game works by adding and removing objects that are positioned absolutely within a container. The objects are then animated by calling functions that adjust their absolute position.

## Development
The development of the MVP was broken down into 4 major tasks for the:
	* Positioning & Layout
	* Moving Objects
	* Collision Detection
	* Implementation of game logic

The development of additional functionality was broken down into 4 tasks:
	* Adding additional aliens & mothership
	* Responsive Design
	* Implementing difficulty settings
	* Tracking player statistics

### Positioning & Layout
Positioning elements proved to be straightforward at first. Inside the main container there would be 3 elements:
	* A div representing the gunner
	* A container for the aliens
	* A container for the bunkers

Each element in the main container is is positioned absolutely with its position, width & height defined relative to the main container. 

The positioning of aliens and bunkers within their respective containers proved to be more challenging. After much trial and error, I realised I had to first add the objects to their container and then retroactively set their position to absolute. Given that their containers have a `display: flex`
property, the objects would first be spaced out evenly and then be fixed to their container. The following code demonstrates how this was done:
```
for (let I = 0; I < bunkers.length; I++) {
      const bunkerDiv = document.createElement(‘div’)
      bunkerDiv.classList.add(‘bunker’)
      bunkers[I] = [bunkerDiv, diffSetting.bunkerStrength]
      bunkerContainer.appendChild(bunkerDiv)
    }

    bunkers.forEach(item => item[0].style.left = `${item[0].offsetLeft}px`)
    bunkers.forEach(item => item[0].classList.add(‘fixed-bunker’))
```

Once positioning was sorted the layout of the game looked like this:
![](README/Screenshot%202019-12-30%20at%2014.20.36.png)

### Moving Objects
Figuring out how to move elements was easy. The alien container & gunner each have functions that increment their horizontal position. Initially, these functions would increment the position of an element by 1px but in order to aid responsive design this was change to 1% of the main container’s width. When called at an interval of a few milliseconds these functions allowed for the smooth movement of both the alien container and the gunner.

