// Fallback analytics stub to prevent 404/MIME errors when legacy gamesalad pages request this file.
(function () {
  if (typeof window === 'undefined') return;
  if (!window.gamesaladAnalytics) {
    window.gamesaladAnalytics = {
      track: function () {},
      identify: function () {},
      page: function () {}
    };
  }
})();
