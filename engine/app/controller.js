'use strict';
var routeProvider;
var interfaceDomain = location.host;
interfaceDomain = mydomain.split(":")[0];

function configureRouteNavigation(navigation, scope) {
	function addRoute(navigationEntry) {
		routeProvider.when(navigationEntry.url.replace('#', ''), {
			templateUrl: navigationEntry.tplPath,
			resolve: {
				load: ['$q', '$rootScope', function ($q, $rootScope) {
					var deferred = $q.defer();
					let scriptLocation = navigationEntry.scripts;
					require(scriptLocation, function () {
						$rootScope.$apply(function () {
							deferred.resolve();
						});
					});
					return deferred.promise;
				}]
			}
		});
	}
	
	navigation.forEach(function (navigationEntry) {
		if (navigationEntry.scripts && navigationEntry.scripts.length > 0) {
			navigationEntry.env = navigationEntry.scripts[0].split("/")[1];
			
			if (navigationEntry.env === 'modules') {
				if (navigationEntry.scripts[0].split("/")[0] === 'engine') {
					navigationEntry.env = 'dashboard';
				}
			}
			
			if (navigationEntry.env === 'dashboard') {
				addRoute(navigationEntry);
			}
			else if (scope) {
				if (navigationEntry.env === scope.currentSelectedEnvironment) {
					addRoute(navigationEntry);
				}
			}
		}
		else {
			routeProvider.when(navigationEntry.url.replace('#', ''), {
				templateUrl: navigationEntry.tplPath
			});
		}
	});
	
	var defaultRoute = navigation[0].url.replace('#', '');
	routeProvider.otherwise({
		redirectTo: defaultRoute
	});
}

/* App Module */
var soajsApp = angular.module('soajsApp', soajsAppModules);

soajsApp.config([
	'$routeProvider',
	'$controllerProvider',
	'$compileProvider',
	'$filterProvider',
	'$provide',
	'$sceDelegateProvider',
	function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $sceDelegateProvider) {
		soajsApp.compileProvider = $compileProvider;
		var whitelisted = ['self'];
		whitelisted = whitelisted.concat(whitelistedDomain);
		$sceDelegateProvider.resourceUrlWhitelist(whitelisted);
		routeProvider = $routeProvider;
		configureRouteNavigation(navigation);
		
		soajsApp.components = {
			filter: $filterProvider.register,
			controller: $controllerProvider.register,
			service: $provide.service
		};
	}
]);

soajsApp.run(function ($rootScope) {
	$rootScope.angular = angular;
	$rootScope.LANG = LANG;
	$rootScope.translation = translation;
});

soajsApp.controller('soajsAppController', ['$window', '$scope', '$routeParams', '$location', '$timeout', '$route', '$cookies', 'ngDataApi', 'checkApiHasAccess', '$localStorage', 'aclDrawHelpers', 'myAccountAccess', 'SOAJSStore',
	function ($window, $scope, $routeParams, $location, $timeout, $route, $cookies, ngDataApi, checkApiHasAccess, $localStorage, aclDrawHelpers, myAccountAccess, SOAJSStore) {
		document.title = titlePrefix;
		$scope.appNavigation = navigation;
		$scope.navigation = [];
		$scope.pillar = null;
		$scope.enableInterface = false;
		$scope.go = function (path) {
			if(path === '/dashboard') {
				// reset left menu items and seleted pillar when redirecting to home page
				if(!$scope.leftMenu) $scope.leftMenu = {};
				$scope.leftMenu.links = [];
				$scope.leftMenu.environments = [];
				$scope.pillar = null;
			}

			$scope.previousPage = $route.current.originalPath;
			if (path) {
				$cookies.put("soajs_current_route", path.replace("#", ""), {'domain': interfaceDomain});
				$location.path(path.replace("#", ""));
			}
		};

		function putMyEnv(record) {
			var data = {
				"_id": record._id,
				"code": record.code,
				"sensitive": record.sensitive,
				"domain": record.domain,
				"profile": record.profile,
				"sitePrefix": record.sitePrefix,
				"apiPrefix": record.apiPrefix,
				"description": record.description,
				"deployer": record.deployer
			};
			if (!$scope.currentDeployer) {
				$scope.currentDeployer = {type: ''};
			}
			$scope.currentDeployer.type = record.deployer.type;
			
			for (let container in data.deployer.container) {
				for (let driver in data.deployer.container[container]) {
					if (data.deployer.container[container][driver].auth && data.deployer.container[container][driver].auth.token) {
						delete data.deployer.container[container][driver].auth.token;
					}
				}
			}
			$cookies.putObject('myEnv', data, {'domain': interfaceDomain});
		}
		
		$scope.alerts = [];
		$scope.themeToUse = themeToUse;
		
		$scope.displayFixedAlert = function (type, msg) {
			$scope.alerts = [];
			$scope.alerts.push({'type': type, 'msg': msg});
		};
		
		$scope.displayAlert = function (type, msg, isCode, service, orgMesg) {
			$scope.alerts = [];
			if (isCode) {
				var msgT = getCodeMessage(msg, service, orgMesg);
				if (msgT) {
					msg = msgT;
				}
			}
			$scope.alerts.push({'type': type, 'msg': msg});
			$scope.closeAllAlerts();
		};
		
		$scope.displayCodeAlert = function (type, code, service) {
			$scope.alerts = [];
			var msg = code;
			if (errorCodes[service] && errorCodes[service][code]) {
				if (errorCodes[service][code][LANG]) {
					msg = errorCodes[service][code][LANG];
				}
			}
			$scope.alerts.push({'type': type, 'msg': msg});
			$scope.closeAllAlerts();
		};
		
		$scope.pushAlert = function (type, msg) {
			$scope.alerts.push({'type': type, 'msg': msg});
			$scope.closeAllAlerts();
		};
		
		$scope.closeAlert = function (index) {
			$scope.alerts.splice(index, 1);
		};
		
		$scope.closeAllAlerts = function () {
			$timeout(function () {
				$scope.alerts = [];
			}, 7000);
		};
		
		$scope.mainMenu = {};
		$scope.mainMenu.links = [];
		
		$scope.footerMenu = {};
		$scope.footerMenu.links = [];
		
		$scope.userMenu = {};
		$scope.userMenu.links = [];
		
		$scope.guestMenu = {};
		$scope.guestMenu.links = [];
		
		$scope.leftMenu = {};
		$scope.leftMenu.links = [];
		$scope.leftMenu.environments = [];
		
		$scope.collapseMainMenu = false;
		
		$scope.collapseExpandMainMenu = function (forcedFlag) {
			if (arguments.length > 0) {
				$scope.collapseMainMenu = forcedFlag;
			}
			else {
				$scope.collapseMainMenu = !$scope.collapseMainMenu;
			}
		};
		
		$scope.pillarChange = function (link) {
			var pillarName = link.pillar.name;
			var url = link.entries[0].url;
			$scope.pillar = pillarName;
			if (pillarName === "operate") {
				if (!$scope.currentSelectedEnvironment || $scope.currentSelectedEnvironment === 'dashboard') {
					if ($localStorage.environments) {
						for (var x = 0; x < $localStorage.environments.length; x++) {
							if ($localStorage.environments[x].code.toLowerCase() !== 'dashboard') {
								$scope.currentSelectedEnvironment = $localStorage.environments[x].code.toLowerCase();
								break;
							}
						}
					}
				}
				
				if ($scope.currentSelectedEnvironment) {
					for (var x = 0; x < link.entries.length; x++) {
						if (link.entries[x].env === $scope.currentSelectedEnvironment) {
							if (link.entries[x].checkPermission && link.entries[x].checkPermission.access === true) {
								url = link.entries[x].url;
								break;
							}
						}
					}
					if (Object.keys($scope.navigation).length === 0) {
						doEnvPerNav();
					}
					$scope.go(url);
				}
				else {
					var envofFirstLink = link.entries[0].env;
					var envFound = false;
					for (var i = 0; i < $localStorage.environments.length; i++) {
						if ($localStorage.environments[i].code.toLowerCase() === envofFirstLink) {
							envFound = true;
							break;
						}
					}
					if (!envFound) {
						url = "#/home/env";
					}
					$scope.go(url);
				}
			}
			else {
				$scope.go(url);
			}
		};
		
		$scope.checkAuthEnvCookie = function () {
			if ($localStorage.environments) {
				return ($localStorage.environments.length > 1);
			}
			return false;
		};
		
		$scope.hideMe = function (link) {
			if(link.pillar && link.pillar.name !== 'deployment'){
				return link.hideMe;
			}
			
			let currentSelectedEnvironment;
			let currentSelectedEnvironmentRecord;
			if ($cookies.getObject('myEnv', {'domain': interfaceDomain})) {
				currentSelectedEnvironment = $cookies.getObject('myEnv', {'domain': interfaceDomain}).code.toLowerCase();
				currentSelectedEnvironmentRecord = $cookies.getObject('myEnv', {'domain': interfaceDomain});
			}
			
			let hide = false;
			if ($scope.currentDeployer.type !== 'manual' && currentSelectedEnvironmentRecord && (currentSelectedEnvironmentRecord.pending || currentSelectedEnvironmentRecord.error)) {
				hide = (['secrets', 'resources', 'environments-clouds-deployments', 'environments-dbs', 'environments-platforms', 'repositories', 'updates-upgrades', 'continuous-delivery',  'endpoints'].indexOf(link.id) !== -1);
			}
			else if ($scope.currentDeployer.type === 'manual') {
				if(currentSelectedEnvironment === 'dashboard'){
					hide = (['secrets', 'repositories', 'updates-upgrades', 'continuous-delivery', 'endpoints'].indexOf(link.id) !== -1);
				}
				else{
					hide = (['secrets', 'updates-upgrades', 'continuous-delivery', 'endpoints'].indexOf(link.id) !== -1);
				}
			}
			else {
				hide = (link.excludedEnvs && currentSelectedEnvironment && link.excludedEnvs.indexOf(currentSelectedEnvironment) !== -1)
			}
			
			return hide;
		};
		
		$scope.reRenderMenu = function (pillarName) {
			$scope.leftMenu.links = [];
			$scope.leftMenu.environments = [];
			$scope.currentSelectedEnvironment = null;
			var user = $localStorage.soajs_user;
			for (var j = 0; j < $scope.mainMenu.links.length; j++) {
				if ($scope.mainMenu.links[j].pillar.name === pillarName) {
					$scope.leftMenu.links = $scope.mainMenu.links[j].entries;
					var pillarsPerEnv = [3, 4];
					if (pillarsPerEnv.indexOf($scope.mainMenu.links[j].pillar.position) !== -1) {
						$scope.leftMenu.environments = angular.copy($localStorage.environments);
						
						if ($scope.mainMenu.links[j].pillar.position === 3) {
							if ($scope.leftMenu.environments.length === 0) {
								$scope.leftMenu.links = [];
							}
						}
						if ($scope.mainMenu.links[j].pillar.position === 4) {
							for (var k = $scope.leftMenu.environments.length - 1; k >= 0; k--) {
								if ($scope.leftMenu.environments[k].code.toLowerCase() === "dashboard") {
									$scope.leftMenu.environments.splice(k, 1);
								}
							}
							if ($cookies.getObject('myEnv', {'domain': interfaceDomain})) {
								if ($cookies.getObject('myEnv', {'domain': interfaceDomain}).code.replace(/\"/g, '').toLowerCase() === 'dashboard') {
									putMyEnv($scope.leftMenu.environments[0]);
								}
							}
						}
						if ($cookies.getObject('myEnv')) {
							$scope.switchEnvironment($cookies.getObject('myEnv', {'domain': interfaceDomain}));
						}
						else {
							$scope.switchEnvironment($scope.leftMenu.environments[0]);
						}
					}
					break;
				}
			}
		};
		
		$scope.switchEnvironment = function (envRecord, forceEnvRecord) {
			if (envRecord) {
				if($routeParams && $routeParams.envCode && $routeParams.envCode !== envRecord.code){
					//get the code from local storage
					// console.log($routeParams, envRecord, forceEnvRecord);
					
					if(forceEnvRecord) {
						$routeParams.envCode = envRecord.code;
					}
					else {
						$localStorage.environments.forEach((oneEnv) => {
							if(oneEnv.code.toUpperCase() === $routeParams.envCode.toUpperCase()){
								envRecord = oneEnv;
								$routeParams.envCode = oneEnv.code;
							}
						});
					}
				}
				
				$scope.currentSelectedEnvironment = envRecord.code.toLowerCase();
				if (
					!$cookies.getObject('myEnv', {'domain': interfaceDomain}) ||
					$cookies.getObject('myEnv', {'domain': interfaceDomain}).code.toLowerCase() !== envRecord.code.toLowerCase()
				) {
					putMyEnv(envRecord);
					if ($scope.pillar && $scope.pillar.toLowerCase() === 'operate') {
						getSendDataFromServer($scope, ngDataApi, {
							"method": "get",
							"routeName": "/key/permission/get"
						}, function (error, response) {
							if (error) {
								$scope.displayAlert('danger', error.code, true, 'dashboard', error.message);
							}
							else {
								if (response.acl && response.acl[envRecord.code.toLowerCase()]) {
									$localStorage.acl_access[envRecord.code.toLowerCase()] = response.acl[envRecord.code.toLowerCase()];
								}
								doEnvPerNav();
								if($routeParams && $routeParams.envCode){
									//better than $route.reload;
									$route.updateParams($routeParams);
								}
								else{
									$route.reload();
								}
							}
						});
					}
					else {
						if($routeParams && $routeParams.envCode){
							//better than $route.reload;
							$route.updateParams($routeParams);
						}
						else{
							$route.reload();
						}
					}
				}
			}
		};
		
		$scope.updateSelectedMenus = function (cb) {
			$scope.mainMenu.selectedMenu = '#/' + $location.path().split("/")[1];
			$localStorage.mainMenu = $scope.mainMenu;
			$scope.footerMenu.selectedMenu = $scope.mainMenu.selectedMenu;
			$scope.userMenu.selectedMenu = $scope.mainMenu.selectedMenu;
			$scope.guestMenu.selectedMenu = $scope.mainMenu.selectedMenu;
			if ($scope.leftMenu) {
				$scope.leftMenu.selectedMenu = '#/' + $location.path().split("/")[1];
			}
			
			if ($scope.mainMenu && Array.isArray($scope.mainMenu.links) && $scope.mainMenu.links.length > 0) {
				updateMyMenus($scope.mainMenu.links, 0, function () {
					return cb();
				});
			}
			
			function updateMyMenus(links, count, cb) {
				var oneLink = links[count];
				for (var i = 0; i < oneLink.entries.length; i++) {
					if (oneLink.entries[i].url === $scope.mainMenu.selectedMenu) {
						oneLink.selected = true;
						$scope.reRenderMenu(oneLink.pillar.name);
						break;
					}
				}
				count++;
				if (count >= links.length) {
					return cb();
				}
				else {
					updateMyMenus(links, count, cb);
				}
			}
		};
		
		$scope.buildNavigation = function () {
			for (var i = 0; i < $scope.appNavigation.length; i++) {
				if ($scope.appNavigation[i].mainMenu) {
					var found = false;
					for (var j = 0; j < $scope.mainMenu.links.length; j++) {
						if ($scope.mainMenu.links[j] && $scope.mainMenu.links[j].pillar) {
							if ($scope.appNavigation[i].pillar.name === $scope.mainMenu.links[j].pillar.name) {
								found = j;
								break;
							}
						}
					}
					if (found === false) {
						$scope.mainMenu.links.push({"pillar": $scope.appNavigation[i].pillar, "entries": []});
						found = $scope.mainMenu.links.length - 1;
					}
					
					$scope.mainMenu.links[found].entries.push($scope.appNavigation[i]);
				}
				
				if ($scope.appNavigation[i].footerMenu) {
					$scope.footerMenu.links.push($scope.appNavigation[i]);
				}
				
				if ($scope.appNavigation[i].userMenu) {
					$scope.userMenu.links.push($scope.appNavigation[i]);
				}
				
				if ($scope.appNavigation[i].guestMenu) {
					$scope.guestMenu.links.push($scope.appNavigation[i]);
				}
			}
			
			for (var x in $scope.mainMenu.links) {
				$scope.mainMenu.links[x].entries.sort(function (a, b) {
					if (a.order > b.order) {
						return 1;
					}
					if (a.order < b.order) {
						return -1;
					}
					// a must be equal to b
					return 0;
				});
			}
		};
		
		$scope.rebuildMenus = function (cb) {
			$scope.mainMenu = {};
			$scope.mainMenu.links = [];
			
			$scope.userMenu = {};
			$scope.userMenu.links = [];
			
			$scope.guestMenu = {};
			$scope.guestMenu.links = [];
			
			$scope.dashboard = [];
			
			function doPermissions(navigation, i, cb) {
				function pushEntry(i) {
					navigation[i].checkPermission.access = true;
					
					$scope.dashboard.push(navigation[i].id);
					if (navigation[i].mainMenu) {
						var found = false;
						for (var j = 0; j < $scope.mainMenu.links.length; j++) {
							if ($scope.mainMenu.links[j] && $scope.mainMenu.links[j].pillar) {
								if (navigation[i].pillar.name === $scope.mainMenu.links[j].pillar.name) {
									found = j;
									break;
								}
							}
						}
						if (found === false) {
							$scope.mainMenu.links.push({"pillar": navigation[i].pillar, "entries": []});
							found = $scope.mainMenu.links.length - 1;
						}
						$scope.mainMenu.links[found].entries.push(navigation[i]);
					}
					
					if (navigation[i].userMenu) {
						$scope.userMenu.links.push(navigation[i]);
					}
					
					if (navigation[i].guestMenu) {
						$scope.guestMenu.links.push(navigation[i]);
					}
				}
				
				var p = {};
				if (navigation[i].checkPermission) {
					navigation[i].hideMe = $scope.hideMe(navigation[i]);
					p = navigation[i].checkPermission;
					if (p.service && p.route) {
						$scope.buildPermittedEnvOperation(p.service, p.route, p.method, navigation[i].env, function (hasAccess) {
							if (hasAccess && !navigation[i].hideMe) {
								pushEntry(i);
							}
							step2();
						});
					}
					else {
						if (!navigation[i].hideMe) {
							navigation[i].checkPermission = {};
							pushEntry(i);
						}
						step2();
					}
				}
				else {
					if (!navigation[i].hideMe) {
						navigation[i].checkPermission = {};
						pushEntry(i);
					}
					step2();
				}
				
				function step2() {
					i++;
					if (i === navigation.length) {
						for (var x in $scope.mainMenu.links) {
							$scope.mainMenu.links[x].entries.sort(function (a, b) {
								if (a.order > b.order) {
									return 1;
								}
								if (a.order < b.order) {
									return -1;
								}
								// a must be equal to b
								return 0;
							});
						}
						return cb();
					}
					else {
						doPermissions(navigation, i, cb);
					}
				}
			}
			
			$scope.navigation = $scope.appNavigation;
			doPermissions($scope.navigation, 0, function () {
				$scope.dashboard.unshift(navigation[0].id);
				$scope.updateSelectedMenus(function () {
					return cb();
				});
			});
		};
		
		$scope.buildNavigation();
		
		$scope.$on('$routeChangeStart', function (event, next, current) {
			if (!current) {
				$cookies.put("soajs_current_route", $location.url(), {'domain': interfaceDomain});
				var gotourl = $cookies.get("soajs_current_route", {'domain': interfaceDomain});
				$timeout(function () {
					overlayLoading.show();
				}, 200);
				$timeout(function () {
					doEnvPerNav(function () {
						overlayLoading.hide();
						if (gotourl) {
							$cookies.put("soajs_current_route", gotourl, {'domain': interfaceDomain});
							$location.url(gotourl);
						}
					});
				}, 2000);
			}
		});
		
		$scope.$on('$routeChangeSuccess', function () {
			$scope.tracker = [];
			doEnvPerNav();
			if ($scope.pillar === 'deployment' && $cookies.getObject('myEnv', {'domain': interfaceDomain})) {
				let envCode = $cookies.getObject('myEnv', {'domain': interfaceDomain}).code;
				if (updateNotifications) {
					updateNotifications($scope, envCode, ngDataApi);
				}
			}
			
			checkSOAJSStore();
			$scope.rebuildMenus(function () {
				for (var i = 0; i < $scope.navigation.length; i++) {
					if ($scope.navigation[i].url === '#' + $route.current.originalPath) {
						if ($scope.navigation[i].label) {
							document.title = titlePrefix + ' | ' + $scope.navigation[i].label;
						}
						else {
							document.title = titlePrefix;
						}
						if ($scope.navigation[i].tracker) {
							if (!$scope.navigation[i].hasOwnProperty('private') && !$scope.navigation[i].hasOwnProperty('guestMenu') && !$scope.navigation[i].hasOwnProperty('footerMenu')) {
								
								if ($scope.navigation[i].hideMe) {
									$scope.closeAlert();
									$scope.go($scope.navigation[i].fallbackLocation);
								}
								else if ($scope.navigation[i].checkPermission && !$scope.navigation[i].checkPermission.access) {
									if ($scope.currentSelectedEnvironment && $scope.currentSelectedEnvironment !== 'dashboard') {
										if ($scope.navigation[i].env === $scope.currentSelectedEnvironment) {
											$scope.displayAlert('danger', 'You do not have permissions to access this section');
											$timeout(function () {
												$scope.closeAlert();
												$scope.go("/dashboard");
											}, 9000);
										}
									}
								}
							}
							
							if ($scope.navigation[i].tracker && $scope.navigation[i].ancestor && Array.isArray($scope.navigation[i].ancestor) && $scope.navigation[i].ancestor.length > 0) {
								$scope.tracker = [];
								for (var j = $scope.navigation[i].ancestor.length - 1; j >= 0; j--) {
									findAndcestorProperties($scope.tracker, $scope.navigation[i].ancestor[j], $route.current.params);
								}
								$scope.tracker.push({
									pillar: ($scope.navigation[i].pillar) ? $scope.navigation[i].pillar.label : null,
									label: $scope.navigation[i].label,
									link: $scope.navigation[i].url,
									current: true
								});
								if ($scope.navigation[i].pillar) {
									$scope.pillar = $scope.navigation[i].pillar.name;
								}
							}
						}
					}
				}
				
				$cookies.put("soajs_current_route", $location.path(), {'domain': interfaceDomain});
			});
		});
		
		$scope.$on("loadUserInterface", function (event, args) {
			doEnvPerNav();
			var user = $localStorage.soajs_user;
			if (user) {
				$scope.enableInterface = true;
				$scope.userFirstName = user.firstName;
				$scope.userLastName = user.lastName;
			}
			else {
				console.log('Missing user object');
			}
			var defaultRoute = navigation[0].url.replace('#', '');
			$scope.go(defaultRoute);
		});
		
		function checkSOAJSStore(){
			if(!$scope.showSOAJSStoreLink || $scope.showSOAJSStoreLink === '' && $scope.enableInterface && !$scope.checkingStore){
				$scope.checkingStore = true;
				SOAJSStore.check($scope);
			}
		}
		
		$scope.buildPermittedEnvOperation = function (serviceName, routePath, method, env, cb) {
			var user = $localStorage.soajs_user;
			if (user) {
				var userGroups = user.groups;
				var acl = {};
				if ($localStorage.acl_access) {
					acl[env.toLowerCase()] = $localStorage.acl_access[env.toLowerCase()];
					var firstEnv = Object.keys(acl)[0];
					//check if old system
					if (acl[firstEnv] && (acl[firstEnv].access || acl[firstEnv].apis || acl[firstEnv].apisRegExp || acl[firstEnv].apisPermission)) {
						acl['dashboard'] = acl;
					}
					checkApiHasAccess(acl, serviceName, routePath, method, userGroups, function (access) {
						return cb(access);
					});
				} else {
					return cb(false);
				}
			}
			else {
				return cb(false);
			}
		};
		
		$scope.switchLanguage = function (lang) {
			LANG = lang;
			$scope.LANG = LANG;
			$cookies.put('soajs_LANG', LANG, {'domain': interfaceDomain});
			window.location.reload();
		};
		
		function doEnvPerNav(cb) {
			configureRouteNavigation(navigation, $scope);
			//delete navigation items based on deployer type
			if (!$scope.currentDeployer) {
				$scope.currentDeployer = {type: ''};
			}
			
			$scope.appNavigation = navigation;
			$scope.navigation = navigation;
			
			var counter = 0;
			var max = $scope.appNavigation.length;
			for (var i = 0; i < $scope.appNavigation.length; i++) {
				var strNav = $scope.appNavigation[i].tplPath.split("/");
				if ($localStorage.environments && Array.isArray($localStorage.environments) && $localStorage.environments.length > 0) {
					for (var e = 0; e < $localStorage.environments.length; e++) {
						if (strNav[1].toLowerCase() === $localStorage.environments[e].code.toLowerCase()) {
							
							if (!$scope.navigation[strNav[1]]) {
								$scope.navigation[strNav[1]] = [];
							}
							$scope.navigation[strNav[1]] = $scope.navigation[strNav[1]].concat($scope.appNavigation[i]);
						}
					}
					counter++;
				}
				else {
					counter++;
				}
				
				if (counter === max) {
					if (!$scope.$$phase) {
						$scope.$apply();
					}
					if (cb && typeof(cb) === 'function') {
						return cb();
					}
				}
			}
		}
		
		function findAndcestorProperties(tracker, ancestorName, params) {
			for (var i = 0; i < $scope.appNavigation.length; i++) {
				if ($scope.appNavigation[i].tracker && $scope.appNavigation[i].label === ancestorName) {
					if (($scope.appNavigation[i].env === "dashboard") ||
						($scope.appNavigation[i].env !== "dashboard" && $scope.appNavigation[i].env === $scope.currentSelectedEnvironment)) {
						var link = $scope.appNavigation[i].url;
						for (var i in params) {
							link = link.replace(":" + i, params[i]);
						}
						tracker.unshift({
							label: ancestorName,
							link: link
						});
					}
				}
			}
		}
		
		if (!$scope.currentSelectedEnvironment) {
			if ($cookies.getObject('myEnv', {'domain': interfaceDomain})) {
				$scope.currentSelectedEnvironment = $cookies.getObject('myEnv', {'domain': interfaceDomain}).code.toLowerCase();
				
				if (!$scope.currentDeployer) {
					$scope.currentDeployer = {type: ''};
				}
				$scope.currentDeployer.type = $cookies.getObject('myEnv', {'domain': interfaceDomain}).deployer.type;
			}
		}
		
		$scope.isUserLoggedIn = function (stopRedirect) {
			if ($cookies.get('access_token', {'domain': interfaceDomain}) && $cookies.get('soajs_username', {'domain': interfaceDomain})) {
				if ($localStorage.soajs_user) {
					$scope.enableInterface = true;
					$scope.$emit('refreshWelcome', {});
				}
			}
			else {
				ngDataApi.logoutUser($scope);
				$scope.displayAlert('danger', translation.expiredSessionPleaseLogin[LANG]);
				redirectToLogin($scope);
			}
		};
		
		$scope.isUserNameLoggedIn = function () {
			if ($cookies.get('access_token', {'domain': interfaceDomain}) && $cookies.get('soajs_username', {'domain': interfaceDomain})) {
				var username = $cookies.get('soajs_username', {'domain': interfaceDomain});
				if (!$cookies.get("soajs_dashboard_login", {'domain': interfaceDomain})) {
					overlayLoading.show();
					myAccountAccess.getUser($scope, username, function (result) {
						if (result) {
							myAccountAccess.getKeyPermissions($scope, function (success) {
								overlayLoading.show();
								if (success) {
									if ($localStorage.acl_access) {
										$timeout(function () {
											overlayLoading.hide();
											$scope.enableInterface = true;
											window.location.reload();
										}, 700);
									} else {
										overlayLoading.hide();
									}
								} else {
									overlayLoading.hide();
								}
							});
						} else {
							ngDataApi.logoutUser($scope);
							redirectToLogin($scope);
						}
					});
				}
				else {
					overlayLoading.show();
					$timeout(function () {
						$scope.rebuildMenus(() => {
							$scope.enableInterface = true;
							$scope.$emit('refreshWelcome', {});
							overlayLoading.hide();
						});
					}, 200);
				}
			}
			else {
				ngDataApi.logoutUser($scope);
				$scope.displayAlert('danger', translation.expiredSessionPleaseLogin[LANG]);
				redirectToLogin($scope);
			}
		};
		
		$scope.checkUserCookie = function () {
			if ($cookies.get('access_token', {'domain': interfaceDomain}) && $cookies.get('soajs_username', {'domain': interfaceDomain})) {
				var username = $cookies.get('soajs_username', {'domain': interfaceDomain});
				myAccountAccess.getUser($scope, username, function (result) {
					if (!result) {
						ngDataApi.logoutUser($scope);
						$scope.displayAlert('danger', translation.expiredSessionPleaseLogin[LANG]);
						redirectToLogin($scope);
					}
				});
			}
		};
		
		$scope.checkUserCookie();
		
		//method used by extended controllers to update the main parent scope.
		$scope.updateParentScope = function(name, data){
			$scope[name] = data;
		};
		
		//method used by extended controllers to remove elements from the main parent scope.
		$scope.removeFromParentScope = function(name){
			if($scope[name]){
				delete $scope[name];
			}
		};
		
		//method used by extended controllers to retrieve elements from the main parent scope.
		$scope.getFromParentScope = function(name){
			return $scope[name];
		};
		
	}]);

soajsApp.controller('welcomeCtrl', ['$scope', 'ngDataApi', '$cookies', '$localStorage', function ($scope, ngDataApi, $cookies, $localStorage) {
	$scope.$parent.$on('refreshWelcome', function (event, args) {
		$scope.setUser();
	});
	
	$scope.soajs_project = $cookies.get('soajs_project', {'domain': interfaceDomain});
	
	$scope.isPortalDeployed = function () {
		let hasPortal = false;
		if ($localStorage && $localStorage.environments) {
			$localStorage.environments.forEach(function (currentEnv) {
				if (currentEnv.code.toLowerCase() === 'portal') {
					hasPortal = true;
				}
			});
		}
		return hasPortal;
	};
	
	$scope.openMy = function (interfaceName) {
		
		let link = "";
		if ($localStorage && $localStorage.environments) {
			$localStorage.environments.forEach(function (currentEnv) {
				if (currentEnv.code.toLowerCase() === 'portal') {
					link = currentEnv.protocol + "://" + currentEnv.sitePrefix + "." + currentEnv.domain + ":" + currentEnv.port;
				}
			});
		}
		
		window.open(link);
	};
	
	$scope.setUser = function () {
		var user = $localStorage.soajs_user;
		if (user) {
			$scope.userFirstName = user.firstName;
			$scope.userLastName = user.lastName;
		}
	};
	
	$scope.logoutUser = function () {
		var user = $localStorage.soajs_user;
		
		function clearData() {
			ngDataApi.logoutUser($scope);
			redirectToLogin($scope.$parent);
		}
		
		function logout() {
			overlayLoading.show();
			// getSendDataFromServer($scope, ngDataApi, {
			// 	"method": "delete",
			// 	"routeName": "/oauth/refreshToken/" + $cookies.get("refresh_token", {'domain': interfaceDomain}),
			// 	"headers": {
			// 		"key": apiConfiguration.key
			// 	}
			// }, function (error, response) {
			// 	// if (error) {
			// 	// 	$scope.$parent.displayAlert('danger', error.code, true, 'dashboard', error.message);
			// 	// }
			// 	getSendDataFromServer($scope, ngDataApi, {
			// 		"method": "delete",
			// 		"routeName": "/oauth/accessToken/" + $cookies.get("access_token", {'domain': interfaceDomain}),
			// 		"headers": {
			// 			"key": apiConfiguration.key
			// 		}
			// 	}, function (error, response) {
            //
					overlayLoading.hide();
			// 		// if (error) {
			// 		// 	$scope.$parent.displayAlert('danger', error.code, true, 'dashboard', error.message);
			// 		// }
					$scope.dashboard = [];
					$scope.currentSelectedEnvironment = null;
					clearData();
				//});
			//});
		}
		
		if (typeof(user) !== 'undefined') {
			logout();
		}
		else {
			clearData();
		}
	};
}]);

soajsApp.directive('header', function () {
	return {
		restrict: 'E',
		templateUrl: 'themes/' + themeToUse + '/directives/header.tmpl'
	};
});

soajsApp.directive('userMenu', function () {
	return {
		restrict: 'E',
		templateUrl: 'themes/' + themeToUse + '/directives/userMenu.tmpl'
	};
});

soajsApp.directive('mainMenu', function () {
	return {
		restrict: 'E',
		templateUrl: 'themes/' + themeToUse + '/directives/mainMenu.tmpl'
	};
});

soajsApp.directive('tracker', function () {
	return {
		restrict: 'E',
		templateUrl: 'themes/' + themeToUse + '/directives/tracker.tmpl'
	};
});

soajsApp.directive('content', function () {
	return {
		restrict: 'E',
		templateUrl: 'themes/' + themeToUse + '/directives/content.tmpl'
	};
});

soajsApp.directive('footer', function () {
	return {
		restrict: 'E',
		templateUrl: 'themes/' + themeToUse + '/directives/footer.tmpl'
	};
});

soajsApp.directive('overlay', function () {
	return {
		restrict: 'E',
		templateUrl: 'themes/' + themeToUse + '/directives/overlay.tmpl'
	};
});

soajsApp.directive('ngConfirmClick', [
	function () {
		return {
			priority: -1,
			restrict: 'A',
			link: function (scope, element, attrs) {
				element.bind('click', function (e) {
					var message = attrs.ngConfirmClick;
					if (message && !confirm(message)) {
						e.stopImmediatePropagation();
						e.preventDefault();
					}
				});
			}
		}
	}
]);

soajsApp.directive('phoneInput', function ($filter, $browser) {
	return {
		require: 'ngModel',
		link: function ($scope, $element, $attrs, ngModelCtrl) {
			var listener = function () {
				var value = $element.val().replace(/[^0-9]/g, '');
				$element.val($filter('tel')(value, false));
			};
			
			// This runs when we update the text field
			ngModelCtrl.$parsers.push(function (viewValue) {
				return viewValue.replace(/[^0-9]/g, '').slice(0, 10);
			});
			
			// This runs when the model gets updated on the scope directly and keeps our view in sync
			ngModelCtrl.$render = function () {
				$element.val($filter('tel')(ngModelCtrl.$viewValue, false));
			};
			
			$element.bind('change', listener);
			$element.bind('keydown', function (event) {
				var key = event.keyCode;
				// If the keys include the CTRL, SHIFT, ALT, or META keys, or the arrow keys, do nothing.
				// This lets us support copy and paste too
				if (key == 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
					return;
				}
				$browser.defer(listener); // Have to do this or changes don't get picked up properly
			});
			
			$element.bind('paste cut', function () {
				$browser.defer(listener);
			});
		}
		
	};
});

soajsApp.directive('textSizeSlider', ['$document', function ($document) {
	return {
		restrict: 'E',
		template: '<table class="text-size-slider"><tr><td class="small-letter" ng-style="{ fontSize: min + unit }">A</td> <td><input type="range" min="{{ min }}" max="{{ max }}" ng-model="textSize" class="slider" value="{{ value }}" /></td> <td class="big-letter" ng-style="{ fontSize: max + unit}">A</td></tr></table>',
		scope: {
			min: '@',
			max: '@',
			unit: '@',
			value: '@',
			idt: '@'
		},
		link: function (scope, element, attr) {
			scope.textSize = scope.value;
			scope.$watch('textSize', function (size) {
				if (scope.idt && document.getElementById(scope.idt)) {
					document.getElementById(scope.idt).style.fontSize = size + scope.unit;
				}
				else {
					$document[0].body.style.fontSize = size + scope.unit;
				}
			});
		}
	}
}]);

soajsApp.directive('jsonText', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attr, ngModel) {
			function into(input) {
				try {
					return JSON.parse(input);
				}
				catch (e) {
					return {};
				}
			}
			
			function out(data) {
				try {
					return JSON.stringify(data, null, 2);
				}
				catch (e) {
					return JSON.stringify("", null, 2);
				}
			}
			
			ngModel.$parsers.push(into);
			ngModel.$formatters.push(out);
		}
	};
});

soajsApp.directive('onReadFile', function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function (scope, element, attrs) {
			var fn = $parse(attrs.onReadFile);
			
			element.on('change', function (onChangeEvent) {
				var reader = new FileReader();
				
				reader.onload = function (onLoadEvent) {
					scope.$apply(function () {
						fn(scope, {$fileContent: onLoadEvent.target.result});
					});
				};
				
				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			});
		}
	};
});

var overlay = {
	show: function (cb) {
		var overlayHeight = jQuery(document).height();
		jQuery("#overlay").css('height', overlayHeight + 'px').show(200);
		jQuery("#overlay .bg").css('height', overlayHeight + 'px').show(200);
		jQuery("#overlay .content").css('top', '10%');
		if (cb && typeof(cb) === 'function') {
			cb();
		}
	},
	hide: function (cb) {
		jQuery("#overlay .content").remove();
		jQuery("#overlay").fadeOut(200);
		if (cb && typeof(cb) === 'function') {
			cb();
		}
	}
};

var overlayLoading = {
	show: function (cb) {
		var overlayHeight = jQuery(document).height();
		jQuery("#overlayLoading").css('height', overlayHeight + 'px').show();
		jQuery("#overlayLoading .bg").css('height', overlayHeight + 'px').show(100);
		jQuery("#overlayLoading .content").show();
		if (cb && typeof(cb) === 'function') {
			cb();
		}
	},
	hide: function (t, cb) {
		var fT = 200;
		if (t && typeof(t) === 'number') {
			fT = t;
		}
		jQuery("#overlayLoading .content").hide();
		jQuery("#overlayLoading").fadeOut(fT);
		if (cb && typeof(cb) === 'function') {
			cb();
		}
	}
};
