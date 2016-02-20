(function() {
  'use strict';

  angular
    .module('jamjar')
    .directive('jamjarPlayer', jamjarPlayer);

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
    function JamJarPlayerController(ConcertService, $sce, $stateParams, $state) {
      var vm = this;

      vm.$stateParams = $stateParams;

      vm.API = null;
      vm.concert = {};
      vm.nowPlaying = {};
      vm.start_time = 0;

      vm.setSource = function(src, offset) {
        var adjusted_time = (vm.API.currentTime / 1000.0) - offset;

        var new_source = [{src: $sce.trustAsResourceUrl(src), type: 'video/mp4'}];
        vm.config = {
          sources: new_source,
          theme: "bower_components/videogular-themes-default/videogular.css",
        };

        // set this globally -- can't update the time until the video is loaded (in callback)
        vm.start_time = adjusted_time;
      };

      vm.getVideoById = function(video_id) {
        return _.find(vm.concert.graph, function(node) {
          return node.video.id == video_id;
        });
      };

      vm.setSourceByVideoId = function(video_id, offset_seconds) {
        $state.go('dashboard.player', {concert_id: vm.$stateParams.concert_id, video_id: video_id, type: $stateParams.type});
        if (!offset_seconds) {
          offset_seconds = 0;
        }

        var node = vm.getVideoById(video_id);

        vm.nowPlaying = node;
        vm.setSource(node.video.web_src, offset_seconds);
      };

      vm.calculateValidConnections = function() {
        return _.filter(vm.nowPlaying.connects_to, function(node) {
          // require node's video length to be < requested offset position AND offset > 0
          var adjusted_time = (vm.API.currentTime / 1000.0) - node.edge.offset;
          return adjusted_time > 0 && adjusted_time < node.video.length && node.edge.confidence >= 5;
        });
      };

      vm.setValidConnections = function() {
        vm.connections = vm.calculateValidConnections();
      };

      vm.onUpdateSource = function(src) {
        vm.setValidConnections();
        vm.API.seekTime(vm.start_time);
      },

      vm.onUpdateTime = function() {
        // this gets called often... maybe not the best way to handle it..
        vm.setValidConnections();
      };

      vm.onComplete = function() {
        vm.setValidConnections();

        if (vm.connections.length == 0) return;

        // ideally this would sort by some combination of connected videos, length, confidence, etc
        var sorted = _.sortBy(vm.connections, function(node) {
          return -node.video.length;
        });

        vm.setSourceByVideoId(sorted[0].video.id, sorted[0].edge.offset);
      };

      vm.onPlayerReady = function(API) {
        vm.API = API;

        ConcertService.getGraphById(vm.$stateParams.concert_id, function(err, resp) {
          if (err) { debugger; return }

          vm.concert = resp;
          var node = vm.getVideoById(vm.$stateParams.video_id);
          vm.nowPlaying = node;
          vm.config = {
            sources: [{src: $sce.trustAsResourceUrl(node.video.web_src), type: "video/mp4"}],
            theme: "bower_components/videogular-themes-default/videogular.css",
          };
        });
      };
    }

    return directive;

  }

})();

