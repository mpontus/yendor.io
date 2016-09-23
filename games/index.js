module.exports = {
  'rogue': {
    'title': "Rogue 5.4.4",
    'dockerImage': 'yendor/rogue',
    'gameDataDir': '/root',
    'attachAfterStart': false,
    'term': {
      'cols': 80,
      'rows': 24,
    },
  },
  'nethack': {
    'title': "Nethack 3.6.0",
    'dockerImage': 'yendor/nethack',
    'gameDataDir': '/root/nh/install/games/lib/nethackdir/save/',
    'attachAfterStart': false,
    'term': {
      'cols': 80,
      'rows': 24,
    },
  },
  'brogue': {
    'title': "Brogue 1.7.4",
    'dockerImage': 'yendor/brogue',
    'gameDataDir': '/root',
    'attachAfterStart': true,
    'term': {
      'cols': 100,
      'rows': 34,
    },
  },
};
