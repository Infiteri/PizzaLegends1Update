window.PizzaTypes = {
  normal: 'normal',
  spicy: 'spicy',
  veggie: 'veggie',
  fungi: 'fungi',
  chill: 'chill',
}

window.Pizzas = {
  s001: {
    name: 'Slice Samurai',
    description: 'Pizza desc here',
    type: PizzaTypes.spicy,
    src: 's001.png',
    icon: 'spicy.png',
    actions: ['saucyStatus', 'clumsyStatus', 'damage1', 'mustard'],
  },
  s002: {
    name: 'Bacon Brigade',
    description: 'A salty warrior who fears nothing',
    type: PizzaTypes.spicy,
    src: 's002.png',
    icon: 'spicy.png',
    actions: ['damage1', 'saucyStatus', 'clumsyStatus'],
  },
  v001: {
    name: 'Call Me Kale',
    description: 'Pizza desc here',
    type: PizzaTypes.veggie,
    src: 'v001.png',
    icon: 'veggie.png',
    actions: ['damage1'],
  },
  f001: {
    name: 'Portobello Express',
    description: 'Pizza desc here',
    type: PizzaTypes.fungi,
    src: 'f001.png',
    icon: 'fungi.png',
    actions: ['damage1'],
  },
  v002: {
    name: `I'm sexy vegan.`,
    description: 'Sexy veggan pizza',
    type: PizzaTypes.veggie,
    src: 'v003.png',
    icon: 'veggie.png',
    actions: ['damage1', 'sexyVeggie'],
  },
}
