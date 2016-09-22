module.exports = {
  'rogue': {
    'dockerImage': 'yendor/rogue',
    'gameDataDir': '/root',
    'attachAfterStart': false,
  },
  'nethack': {
    'dockerImage': 'yendor/nethack',
    'gameDataDir': '/root/nh/install/games/lib/nethackdir/save/',
    'attachAfterStart': false,
  },
  'brogue': {
    'dockerImage': 'yendor/brogue',
    'gameDataDir': '/root',
    'attachAfterStart': true,
  },
};
