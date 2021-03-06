"use strict";
var infraFirewallApp = soajsApp.components;
infraFirewallApp.controller('infraFirewallCtrl', ['$scope', '$routeParams', '$localStorage', '$timeout', 'injectFiles', 'infraCommonSrv', 'infraFirewallSrv', function ($scope, $routeParams, $localStorage, $timeout, injectFiles, infraCommonSrv, infraFirewallSrv) {
	$scope.$parent.isUserNameLoggedIn();
	$scope.vmlayers = [];
	$scope.access = {};
	constructModulePermissions($scope, $scope.access, infraFirewallConfig.permissions);

	infraCommonSrv.getInfraFromCookie($scope);

	$scope.$parent.$parent.switchInfra = function (oneInfra) {
		infraCommonSrv.switchInfra($scope, oneInfra, ["templates"], () => {
			$scope.currentInfraName = infraCommonSrv.getInfraDriverName($scope);
			if ($scope.getFromParentScope('currentSelectedInfra').groups && (Array.isArray($scope.getFromParentScope('currentSelectedInfra').groups) && $scope.getFromParentScope('currentSelectedInfra').groups.length > 0)) {
				//flag that infra doesn't have any resource groups
				$scope.noResourceGroups = false;
				//flag that this infra is resource group driver (otherwise will be region driven)
				$scope.isResourceGroupDriven = true;

				$scope.infraGroups = $scope.getFromParentScope('currentSelectedInfra').groups;
				if($routeParams.group){
					$scope.infraGroups.forEach((oneInfraGroup) => {
						if(oneInfraGroup.name === $routeParams.group){
							$scope.selectedGroup = oneInfraGroup;
						}
					});
				}
				else{
					$scope.selectedGroup = $scope.infraGroups[0];
				}
				$timeout(() => {
					overlayLoading.show();
					infraCommonSrv.getVMLayers($scope, (error, vmlayers) => {
						$scope.vmlayers = vmlayers;

						infraFirewallSrv.listFirewalls($scope, $scope.selectedGroup);
					});
				}, 500);
			}
			else if ($scope.getFromParentScope('currentSelectedInfra').groups && (Array.isArray($scope.getFromParentScope('currentSelectedInfra').groups) && $scope.getFromParentScope('currentSelectedInfra').groups.length === 0)) {
				$scope.isResourceGroupDriven = true;
				$scope.noResourceGroups = true;
			}
			else if ((!$scope.getFromParentScope('currentSelectedInfra').groups || $scope.getFromParentScope('currentSelectedInfra').groups === "N/A") && $scope.getFromParentScope('currentSelectedInfra').regions) {
				//flag that the infra is not driven by resource group -> by region
				$scope.isResourceGroupDriven = false;

				//set infra regions in scope to be used by modules
				$scope.infraRegions = $scope.getFromParentScope('currentSelectedInfra').regions;

				if($routeParams.region) {
					$scope.infraRegions.forEach((oneRegion) => {
						if (oneRegion.v === $routeParams.region) {
							$scope.selectedRegion = oneRegion.v;
						}
					});
				}
				else {
					$scope.selectedRegion = $scope.infraRegions[0].v;
				}

				$timeout(() => {
					overlayLoading.show();
					infraCommonSrv.getVMLayers($scope, (error, vmlayers) => {
						overlayLoading.hide();
						$scope.vmlayers = vmlayers;

						infraFirewallSrv.listFirewalls($scope, $scope.selectedRegion);
					});
				}, 500);
			}
		});
	};
	
	$scope.$parent.$parent.activateProvider = function (cloud) {
		infraCommonSrv.activateProvider($scope, cloud);
	};

	$scope.getProviders = function () {
		if($localStorage.infraProviders){
			$scope.updateParentScope('infraProviders', angular.copy($localStorage.infraProviders));
			if(!$scope.getFromParentScope('currentSelectedInfra')){
				if($routeParams.infraId){
					$scope.getFromParentScope('infraProviders').forEach((oneProvider) => {
						if(oneProvider._id === $routeParams.infraId){
							$scope.updateParentScope('currentSelectedInfra', oneProvider);
							delete $scope.getFromParentScope('currentSelectedInfra').templates;
							$scope.$parent.$parent.switchInfra($scope.getFromParentScope('currentSelectedInfra'));
						}
					});
				}

				if(!$scope.getFromParentScope('currentSelectedInfra')){
					$scope.go("/infra");
				}
			}
			else{
				delete $scope.getFromParentScope('currentSelectedInfra').templates;
				$scope.$parent.$parent.switchInfra($scope.getFromParentScope('currentSelectedInfra'));
			}
		}
		else{
			//list infras to build sidebar
			infraCommonSrv.getInfra($scope, {
				id: null,
				exclude: ["groups", "regions", "templates"]
			}, (error, infras) => {
				if (error) {
					$scope.displayAlert("danger", error);
				}
				else {
					$scope.infraProviders = infras;
					$localStorage.infraProviders = angular.copy($scope.infraProviders);
					$scope.updateParentScope('infraProviders', angular.copy($scope.infraProviders));
					if(!$scope.getFromParentScope('currentSelectedInfra')){
						if($routeParams.infraId){
							$scope.getFromParentScope('infraProviders').forEach((oneProvider) => {
								if(oneProvider._id === $routeParams.infraId){
									$scope.updateParentScope('currentSelectedInfra', oneProvider);
									delete $scope.getFromParentScope('currentSelectedInfra').templates;
									$scope.$parent.$parent.switchInfra($scope.getFromParentScope('currentSelectedInfra'));
								}
							});
						}

						if(!$scope.getFromParentScope('currentSelectedInfra')){
							$scope.go("/infra");
						}
					}
					else{
						delete $scope.getFromParentScope('currentSelectedInfra').templates;
						$scope.$parent.$parent.switchInfra($scope.getFromParentScope('currentSelectedInfra'));
					}
				}
			});
		}
	};

	$scope.deleteFirewall = function (oneFirewall) {
		infraFirewallSrv.deleteFirewall($scope, oneFirewall);
	};

	$scope.addFirewall = function () {
		infraFirewallSrv.addFirewall($scope);
	};

	$scope.editFirewall = function (oneFirewall) {
		infraFirewallSrv.editFirewall($scope, oneFirewall);
	};

	$scope.listFirewalls = function (oneGroup) {
		overlayLoading.show();
		infraCommonSrv.getVMLayers($scope, (error, vmlayers) => {
			$scope.vmlayers = vmlayers;
			infraFirewallSrv.listFirewalls($scope, oneGroup);
		});
	};

	if ($scope.access.list) {
		$scope.getProviders();
	}
	injectFiles.injectCss("modules/dashboard/infra/infra.css");
}]);
