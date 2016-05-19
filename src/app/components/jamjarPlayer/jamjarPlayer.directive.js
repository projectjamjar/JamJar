
(function() {
  'use strict';

  angular
    .module('jamjar')
    .directive('jamjarPlayer', jamjarPlayer)


    /** @ngInject */
    function jamjarPlayer() {
        var directive = {
          restrict: 'E',
          templateUrl: 'app/components/jamjarPlayer/jamjarPlayer.html',
          controller: JamJarPlayerController,
          controllerAs: 'player',
          bindToController: true
        };

        /** @ngInject */
        function JamJarPlayerController(ConcertService, VideoService, $sce, $stateParams, $state, $timeout) {
            var vm = this;
            
            vm.concert = {};
            
            /*vm.tooltip = {
                showTooltip : false,
                tipDirection : 'bottom'
            };*/

            vm.overlay = {
              visible: false,
              timeout: null,
              mouse: {pageX: 0, pageY: 0},
              state: null,
              maxOffset: 1,
              line: {offset: 0}
            };

            vm.jamjarButton = {
              stateIndex: 0,
              icon: null,
            }


            // this will be a factory with DI
            vm.jamjar = new JamJar(ConcertService, VideoService, $sce);
            vm.jamjar.initialize(parseInt($stateParams.concert_id), parseInt($stateParams.video_id), $stateParams.type, vm.overlay);

            vm.individual = $stateParams.type == 'individual';

            vm.jamjar.onPlay = function(video) {
              video.views += 1;
              VideoService.view(video.id, function(err, resp) {
                console.log(err, resp);
              });
            }

            window.jamjar = vm.jamjar;

            vm.onHover = function(event) {

              if (vm.overlay.state != 'auto')
                return

              // make overlay visible
              var timeoutMs = 1500;

              if (event.pageX == vm.overlay.mouse.pageX && event.pageY == vm.overlay.mouse.pageY) {
                return;
              } else {
                vm.overlay.mouse.pageX = event.pageX;
                vm.overlay.mouse.pageY = event.pageY;
              }

              vm.overlay.visible = true;

              // set timeout to make it invisible
              var timeout = $timeout(function() {
                vm.overlay.visible = false;
                vm.overlay.timeout = null;
              }, timeoutMs);

              // if timeout already exists
              // delete it and create a new one
              if (vm.overlay.timeout) {
                $timeout.cancel(vm.overlay.timeout);
              }
              vm.overlay.timeout = timeout;
            }

            vm.toggleOverlay = function(state) {
              if (state == 'off') {
                vm.overlay.visible = false;
                vm.overlay.state = null;
              } else if (state == 'on') {
                vm.overlay.state = null;
                vm.overlay.visible = true;
                if (vm.overlay.timeout) {
                  $timeout.cancel(vm.overlay.timeout);
                }
              } else if (state == 'auto') {
                vm.overlay.visible = true;
                vm.overlay.state = 'auto';
              }
            };

            vm.getThumbForJamJar = function(videoId) {
              var video = _.find(vm.concert.videos, {id: videoId});
              return video.thumb_src[256];
            }
            
            ConcertService.getConcertById($stateParams.concert_id, function(err, res) {
                vm.concert = res;

//                _.each(vm.concert.graph, function(jamjar){
//                    var video_ids = _.keys(jamjar.adjacencies);
//
//                    jamjar.thumbnails = _.map(video_ids, function(videoId){
//                        var video = _.find(vm.concert.videos, {id:parseInt(videoId)});
//                        if (video) {
//                            return video.thumb_src;
//                        }
//                    });
//                });
            });
        }

        return directive;
    }
})();
