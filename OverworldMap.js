class OverworldMap {
  constructor(config) {
    this.overworld = null
    this.gameObjects = config.gameObjects
    this.cutsceneSpaces = config.cutsceneSpaces || {}
    this.walls = config.walls || {}

    this.lowerImage = new Image()
    this.lowerImage.src = config.lowerSrc

    this.upperImage = new Image()
    this.upperImage.src = config.upperSrc

    this.isCutscenePlaying = false
    this.isPaused = false
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    )
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction)
    return this.walls[`${x},${y}`] || false
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      let object = this.gameObjects[key]
      object.id = key

      //TODO: determine if this object should actually mount
      object.mount(this)
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      const result = await eventHandler.init()
      if (result === 'LOST_BATTLE') {
        break
      }
    }

    this.isCutscenePlaying = false

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach((object) =>
      object.doBehaviorEvent(this)
    )
  }

  checkForActionCutscene() {
    const hero = this.gameObjects['hero']
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction)
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    })
    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects['hero']
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`]
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events)
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true
  }
  removeWall(x, y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY)
    const { x, y } = utils.nextPosition(wasX, wasY, direction)
    this.addWall(x, y)
  }
}

window.OverworldMaps = {
  DemoRoom: {
    id: 'DemoRoom',
    lowerSrc: 'DemoLower.png',
    upperSrc: 'DemoUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(10),
        y: utils.withGrid(6),
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: 'npc1.png',
        behaviorLoop: [
          { type: 'stand', direction: 'left', time: 800 },
          { type: 'stand', direction: 'up', time: 800 },
          { type: 'stand', direction: 'right', time: 1200 },
          { type: 'stand', direction: 'up', time: 300 },
        ],
        talking: [
          {
            required: ['TALKED_TO_ERIO'],
            events: [
              {
                type: 'textMessage',
                text: "Isn't Erio the coolest?",
                faceHero: 'npcA',
              },
            ],
          },
          {
            events: [
              {
                type: 'textMessage',
                text: "I'm going to crush you!",
                faceHero: 'npcA',
              },
              { type: 'battle', enemyId: 'beth' },
              { type: 'addStoryFlag', flag: 'DEFEATED_BETH' },
              {
                type: 'textMessage',
                text: 'You crushed me like weak pepper.',
                faceHero: 'npcA',
              },
              // { type: "textMessage", text: "Go away!"},
              //{ who: "hero", type: "walk",  direction: "up" },
            ],
          },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: 'erio.png',
        talking: [
          {
            events: [
              { type: 'textMessage', text: 'Bahaha!', faceHero: 'npcB' },
              { type: 'addStoryFlag', flag: 'TALKED_TO_ERIO' },
              //{ type: "battle", enemyId: "erio" }
            ],
          },
        ],
        // behaviorLoop: [
        //   { type: "walk",  direction: "left" },
        //   { type: "stand",  direction: "up", time: 800 },
        //   { type: "walk",  direction: "up" },
        //   { type: "walk",  direction: "right" },
        //   { type: "walk",  direction: "down" },
        // ]
      }),
      pizzaStone: new PizzaStone({
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        storyFlag: 'USED_PIZZA_STONE',
        pizzas: ['v001', 'f001', 'v002'],
      }),
    },
    walls: {
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,
      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(11, 11)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(5, 11)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: 'npcB', type: 'walk', direction: 'left' },
            { who: 'npcB', type: 'stand', direction: 'up', time: 500 },
            { type: 'textMessage', text: "You can't be in there!" },
            { who: 'npcB', type: 'walk', direction: 'right' },
            { who: 'hero', type: 'walk', direction: 'down' },
            { who: 'hero', type: 'walk', direction: 'left' },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Street',
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: 'down',
            },
          ],
        },
      ],
    },
  },
  Kitchen: {
    id: 'Kitchen',
    lowerSrc: 'KitchenLower.png',
    upperSrc: 'KitchenUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: 'npc3.png',
        talking: [
          {
            events: [
              {
                type: 'textMessage',
                text: 'You made it! This video is going to be such a good time!',
                faceHero: 'npcB',
              },
            ],
          },
        ],
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 10)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Street',
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: 'down',
            },
          ],
        },
      ],
    },
  },
  Street: {
    id: 'Street',
    lowerSrc: 'StreetLower.png',
    upperSrc: 'StreetUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(25),
        y: utils.withGrid(5),
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(25, 5)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'StreetLower',
              x: utils.withGrid(7),
              y: utils.withGrid(16),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(29, 9)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'DemoRoom',
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: 'up',
            },
          ],
        },
      ],
      [utils.asGridCoord(5, 9)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'PizzaShop',
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
    },
    walls: {
      [utils.asGridCoord(29, 8)]: true,
      [utils.asGridCoord(28, 9)]: true,
      [utils.asGridCoord(28, 8)]: true,
      [utils.asGridCoord(28, 7)]: true,
      [utils.asGridCoord(27, 7)]: true,
      [utils.asGridCoord(27, 7)]: true,
      [utils.asGridCoord(27, 6)]: true,
      [utils.asGridCoord(26, 6)]: true,
      [utils.asGridCoord(26, 7)]: true,
      [utils.asGridCoord(26, 5)]: true,
      [utils.asGridCoord(25, 4)]: true,
      [utils.asGridCoord(30, 9)]: true,
      [utils.asGridCoord(24, 6)]: true,
      [utils.asGridCoord(24, 5)]: true,
      [utils.asGridCoord(24, 7)]: true,
      [utils.asGridCoord(23, 7)]: true,
      [utils.asGridCoord(22, 7)]: true,
      [utils.asGridCoord(21, 7)]: true,
      [utils.asGridCoord(20, 7)]: true,
      [utils.asGridCoord(19, 7)]: true,
      [utils.asGridCoord(18, 7)]: true,
      [utils.asGridCoord(17, 7)]: true,
      [utils.asGridCoord(16, 7)]: true,
      [utils.asGridCoord(15, 7)]: true,
      [utils.asGridCoord(14, 7)]: true,
      [utils.asGridCoord(14, 8)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(12, 9)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(10, 9)]: true,
      [utils.asGridCoord(9, 9)]: true,
      [utils.asGridCoord(8, 9)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(4, 9)]: true,
      [utils.asGridCoord(5, 8)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(3, 11)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(3, 13)]: true,
      [utils.asGridCoord(3, 14)]: true,
      [utils.asGridCoord(3, 15)]: true,
      [utils.asGridCoord(3, 16)]: true,
      [utils.asGridCoord(3, 17)]: true,
      [utils.asGridCoord(3, 18)]: true,
      [utils.asGridCoord(4, 19)]: true,
      [utils.asGridCoord(5, 19)]: true,
      [utils.asGridCoord(6, 19)]: true,
      [utils.asGridCoord(7, 19)]: true,
      [utils.asGridCoord(8, 19)]: true,
      [utils.asGridCoord(9, 19)]: true,
      [utils.asGridCoord(10, 19)]: true,
      [utils.asGridCoord(11, 19)]: true,
      [utils.asGridCoord(12, 19)]: true,
      [utils.asGridCoord(13, 19)]: true,
      [utils.asGridCoord(14, 19)]: true,
      [utils.asGridCoord(15, 19)]: true,
      [utils.asGridCoord(16, 19)]: true,
      [utils.asGridCoord(17, 19)]: true,
      [utils.asGridCoord(18, 19)]: true,
      [utils.asGridCoord(19, 19)]: true,
      [utils.asGridCoord(20, 19)]: true,
      [utils.asGridCoord(21, 19)]: true,
      [utils.asGridCoord(22, 19)]: true,
      [utils.asGridCoord(23, 19)]: true,
      [utils.asGridCoord(24, 19)]: true,
      [utils.asGridCoord(25, 19)]: true,
      [utils.asGridCoord(26, 19)]: true,
      [utils.asGridCoord(26, 9)]: true,
      [utils.asGridCoord(26, 10)]: true,
      [utils.asGridCoord(26, 11)]: true,
      [utils.asGridCoord(17, 9)]: true,
      [utils.asGridCoord(6, 9)]: true,
      [utils.asGridCoord(17, 10)]: true,
      [utils.asGridCoord(17, 11)]: true,
      [utils.asGridCoord(16, 9)]: true,
      [utils.asGridCoord(16, 10)]: true,
      [utils.asGridCoord(19, 11)]: true,
      [utils.asGridCoord(16, 11)]: true,
      [utils.asGridCoord(18, 11)]: true,
      [utils.asGridCoord(25, 9)]: true,
      [utils.asGridCoord(25, 10)]: true,
      [utils.asGridCoord(25, 11)]: true,
      [utils.asGridCoord(27, 19)]: true,
      [utils.asGridCoord(28, 19)]: true,
      [utils.asGridCoord(29, 19)]: true,
      [utils.asGridCoord(30, 19)]: true,
      [utils.asGridCoord(31, 19)]: true,
      [utils.asGridCoord(32, 19)]: true,
      [utils.asGridCoord(33, 19)]: true,
      [utils.asGridCoord(34, 18)]: true,
      [utils.asGridCoord(34, 17)]: true,
      [utils.asGridCoord(34, 16)]: true,
      [utils.asGridCoord(34, 15)]: true,
      [utils.asGridCoord(34, 14)]: true,
      [utils.asGridCoord(34, 13)]: true,
      [utils.asGridCoord(34, 12)]: true,
      [utils.asGridCoord(34, 11)]: true,
      [utils.asGridCoord(34, 9)]: true,
      [utils.asGridCoord(33, 9)]: true,
      [utils.asGridCoord(32, 9)]: true,
      [utils.asGridCoord(31, 9)]: true,
      [utils.asGridCoord(30, 9)]: true,
    },
  },
  PizzaShop: {
    id: 'PizzaShop',
    lowerSrc: 'PizzaShopLower.png',
    upperSrc: 'PizzaShopUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(12),
      }),
      npc1: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: 'down',
        src: 'bossus.png',
      }),
    },
    walls: {
      [utils.asGridCoord(4, 12)]: true,
      [utils.asGridCoord(3, 12)]: true,
      [utils.asGridCoord(2, 12)]: true,
      [utils.asGridCoord(0, 12)]: true,
      [utils.asGridCoord(0, 11)]: true,
      [utils.asGridCoord(0, 10)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(7, 3)]: true,
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(11, 12)]: true,
      [utils.asGridCoord(10, 12)]: true,
      [utils.asGridCoord(9, 12)]: true,
      [utils.asGridCoord(8, 12)]: true,
      [utils.asGridCoord(7, 12)]: true,
      [utils.asGridCoord(6, 12)]: true,
      [utils.asGridCoord(5, 13)]: true,
      [utils.asGridCoord(2, 4)]: true,
      [utils.asGridCoord(2, 5)]: true,
      [utils.asGridCoord(2, 6)]: true,
      [utils.asGridCoord(3, 6)]: true,
      [utils.asGridCoord(4, 6)]: true,
      [utils.asGridCoord(5, 6)]: true,
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(9, 6)]: true,
      [utils.asGridCoord(9, 5)]: true,
      [utils.asGridCoord(9, 4)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(4, 9)]: true,
      [utils.asGridCoord(4, 8)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(3, 9)]: true,
      [utils.asGridCoord(3, 8)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(8, 9)]: true,
      [utils.asGridCoord(8, 8)]: true,
      [utils.asGridCoord(7, 8)]: true,
    },

    cutsceneSpaces: {
      [utils.asGridCoord(5, 12)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Street',
              x: utils.withGrid(5),
              y: utils.withGrid(9),
              direction: 'down',
            },
          ],
        },
      ],
    },
  },
  StreetLower: {
    lowerSrc: 'StreetNorthLower.png',
    upperSrc: 'StreetNorthUpper.png',
    gameObjects: {
      hero: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(6),
        isPlayerControlled: true,
        direction: 'up',
      }),
    },
    walls: {
      [utils.asGridCoord(7, 17)]: true,
      [utils.asGridCoord(6, 16)]: true,
      [utils.asGridCoord(8, 16)]: true,
      [utils.asGridCoord(6, 15)]: true,
      [utils.asGridCoord(5, 15)]: true,
      [utils.asGridCoord(4, 15)]: true,
      [utils.asGridCoord(3, 15)]: true,
      [utils.asGridCoord(2, 15)]: true,
      [utils.asGridCoord(1, 14)]: true,
      [utils.asGridCoord(1, 13)]: true,
      [utils.asGridCoord(1, 12)]: true,
      [utils.asGridCoord(1, 11)]: true,
      [utils.asGridCoord(1, 10)]: true,
      [utils.asGridCoord(1, 9)]: true,
      [utils.asGridCoord(1, 8)]: true,
      [utils.asGridCoord(2, 7)]: true,
      [utils.asGridCoord(3, 7)]: true,
      [utils.asGridCoord(3, 6)]: true,
      [utils.asGridCoord(4, 5)]: true,
      [utils.asGridCoord(5, 5)]: true,
      [utils.asGridCoord(6, 5)]: true,
      [utils.asGridCoord(7, 4)]: true,
      [utils.asGridCoord(8, 5)]: true,
      [utils.asGridCoord(9, 5)]: true,
      [utils.asGridCoord(10, 5)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(12, 6)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(14, 7)]: true,
      [utils.asGridCoord(14, 8)]: true,
      [utils.asGridCoord(14, 9)]: true,
      [utils.asGridCoord(14, 10)]: true,
      [utils.asGridCoord(14, 11)]: true,
      [utils.asGridCoord(14, 12)]: true,
      [utils.asGridCoord(14, 13)]: true,
      [utils.asGridCoord(14, 14)]: true,
      [utils.asGridCoord(13, 15)]: true,
      [utils.asGridCoord(12, 15)]: true,
      [utils.asGridCoord(11, 15)]: true,
      [utils.asGridCoord(10, 15)]: true,
      [utils.asGridCoord(9, 15)]: true,
      [utils.asGridCoord(8, 15)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(7, 9)]: true,
      [utils.asGridCoord(7, 8)]: true,
      [utils.asGridCoord(8, 8)]: true,
      [utils.asGridCoord(8, 9)]: true,
    },

    cutsceneSpaces: {
      [utils.asGridCoord(7, 5)]: [
        {
          events: [
            {
              type: 'changeMap',
              map: 'Green',
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: 'up',
            },
          ],
        },
      ],
    },
  },

  Green: {
    lowerSrc: 'GreenKitchenLower.png',
    upperSrc: 'GreenKitchenUpper.png',
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(12),
      }),
      cook: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        src: 'npc5.png',

        talking: [
          {
            events: [
              {
                type: 'textMessage',
                text: "Isn't Erio the coolest?",
                faceHero: 'cook',
              },
            ],
          },
        ],
      }),
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 11)]: [
        {
          events: [
            {
              type: 'walk',
              direction: 'right',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'right',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'down',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'down',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'down',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'down',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'left',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'left',
              who: 'cook',
            },
            {
              type: 'walk',
              direction: 'down',
              who: 'cook',
            },
            {
              type: 'textMessage',
              text: 'Go grab a new pizza in the demoRoom.',
              faceHero: 'cook',
            },
            {
              type: 'textMessage',
              text: 'OK.',
              faceHero: 'cook',
            },
          ],
        },
      ],
    },
  },
}
