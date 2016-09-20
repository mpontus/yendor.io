module.exports = {
  'rogue': {
    'dockerImage': 'yendor/rogue',
    'savesPath': '/root',
  },
  'nethack': {
    'dockerImage': 'yendor/nethack',
    'savesPath': '/root/nh/install/games/lib/nethackdir/save/',
  },
  'brogue': {
    'dockerImage': 'yendor/brogue',
    'savesPath': '/root',
    'dockerStrategy': 'StartFirst',
  },
};
