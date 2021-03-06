
(function() {
  'use strict';

  angular
    .module('jamjar')
    .directive('jamjarVline', jamjarVLine)

    /** @ngInject */
    function jamjarVLine () {
        var directive = {
            restrict: "E",
            require: "^videogular",
            templateUrl: 'app/components/jamjarPlayer/jamjarVLine.html',
            link: function(scope, elem, attrs, API) {
                scope.API = API;
            },
            scope: {
              'overlay': '=',
            },
            controller: JamJarVLineController,
            controllerAs: 'vline',
            bindToController: true
        }

        /** @ngInject */
        function JamJarVLineController(ConcertService) {
            var vm = this;

            vm.offset = function() {
              var screen_width = $('.videogular-container').width() * 0.95;
              var relOffset = (vm.overlay.line.offset / vm.overlay.maxOffset) * screen_width;
              return relOffset;
            }
        }

        return directive;
    }
})();

