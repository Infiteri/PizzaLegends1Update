window.Actions = {
  damage1: {
    name: 'Whomp!',
    description: 'Pillowy punch of dough',
    success: [
      { type: 'textMessage', text: '{CASTER} uses {ACTION}!' },
      { type: 'animation', animation: 'spin' },
      { type: 'stateChange', damage: 10 },
    ],
  },
  saucyStatus: {
    name: 'Tomato Squeeze',
    description: 'Applies the Saucy status',
    targetType: 'friendly',
    success: [
      { type: 'textMessage', text: '{CASTER} uses {ACTION}!' },
      { type: 'stateChange', status: { type: 'saucy', expiresIn: 3 } },
    ],
  },
  clumsyStatus: {
    name: 'Olive Oil',
    description: 'Slippery mess of deliciousness',
    success: [
      { type: 'textMessage', text: '{CASTER} uses {ACTION}!' },
      { type: 'animation', animation: 'glob', color: '#dafd2a' },
      { type: 'stateChange', status: { type: 'clumsy', expiresIn: 3 } },
      { type: 'textMessage', text: '{TARGET} is slipping all around!' },
    ],
  },
  mustard: {
    name: 'Mustard',
    description: 'Mustard',
    success: [
      { type: 'textMessage', text: '{CASTER} uses {ACTION}!' },
      { type: 'animation', animation: 'glob', color: '#ffdb58' },
      {
        type: 'stateChange',
        status: { type: 'mustard', expiresIn: 2 },
        damage: 25,
      },
      { type: 'textMessage', text: '{TARGET} is full of Deez Mustard!' },
    ],
  },
  sexyVeggie: {
    name: 'Sexy Veggie',
    description: 'Sexy n hoy',
    success: [
      { type: 'textMessage', text: '{CASTER} uses a sexy move: {ACTION}!' },
      { type: 'animation', animation: 'glob', color: '#ff69b4' },
      {
        type: 'stateChange',
        status: { type: `Hot`, expiresIn: 5 },
        damage: 35,
      },
      { type: 'textMessage', text: '{TARGET} is full of veggie sexy food!' },
    ],
  },
  //Items
  item_recoverStatus: {
    name: 'Heating Lamp',
    description: 'Feeling fresh and warm',
    targetType: 'friendly',
    success: [
      { type: 'textMessage', text: '{CASTER} uses a {ACTION}!' },
      { type: 'stateChange', status: null },
      { type: 'textMessage', text: 'Feeling fresh!' },
    ],
  },
  item_recoverHp: {
    name: 'Parmesan',
    targetType: 'friendly',
    success: [
      { type: 'textMessage', text: '{CASTER} sprinkles on some {ACTION}!' },
      { type: 'stateChange', recover: 10 },
      { type: 'textMessage', text: '{CASTER} recovers HP!' },
    ],
  },
}
