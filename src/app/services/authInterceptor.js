
angular
  .module('jamjar')
  .factory('authInterceptor', function ($rootScope, $q, TokenService) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      var token = TokenService.getToken();
      // don't include token on auth requests -- user doesn't have one yet!!
      var isAuth = config.url.match(/\/auth\//);
      if (token && !isAuth)  {
        config.headers.Authorization = 'Token ' + token;
      }
      return config;
    },
    responseError: function(response) {
      if (response.status === 401) {
        TokenService.onUnauthorized();
        // handle the case where the user is not authenticated
      }
      return $q.reject(response);
    }
  };
});

angular
  .module('jamjar')
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});
