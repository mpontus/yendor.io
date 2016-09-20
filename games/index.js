module.exports = {
  'rogue': {
    'dockerImage': 'yendor/rogue',
    'gameDataDir': '/root',
  },
  'nethack': {
    'dockerImage': 'yendor/nethack',
    'gameDataDir': '/root/nh/install/games/lib/nethackdir/save/',
  },
  'brogue': {
    'dockerImage': 'yendor/brogue',
    'gameDataDir': '/root',
    'dockerStrategy': 'StartFirst',
  },
};
