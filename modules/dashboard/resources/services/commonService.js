"use strict";
var commonService = soajsApp.components;
commonService.service('commonService', ['ngDataApi', function (ngDataApi) {

	function listResourcesApi($scope, apiParams, cb) {
		overlayLoading.show();
		getSendDataFromServer($scope, ngDataApi, {
			method: 'get',
			routeName: '/dashboard/resources',
			params: apiParams
		}, function (error, response) {
			overlayLoading.hide();
			if (error) {
				$scope.displayAlert('danger', error.message);
			}
			else {
			    return cb(response);
			}
		});
	}

	function deleteResourceApi($scope, apiParams, cb) {
        overlayLoading.show();
        getSendDataFromServer($scope, ngDataApi, {
            method: 'delete',
            routeName: '/dashboard/resources',
            params: apiParams
        }, function (error) {
            overlayLoading.hide();
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            else {
               return cb();
            }
        });
	}

    function togglePlugResourceApi ($scope, apiParams, cb) {
        overlayLoading.show();
        getSendDataFromServer($scope, ngDataApi, {
            method: 'put',
            routeName: '/dashboard/resources/update',
            params: {
                id: apiParams.resourceId,
                env: $scope.context.envCode.toUpperCase(),
            },
            data: { resource: apiParams.resourceRecord }
        }, function (error) {
            overlayLoading.hide();
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            else {
            	return cb();
            }
        });
    }

    function listVmsApi ($scope, apiParams, cb) {
        getSendDataFromServer($scope, ngDataApi, {
            "method": "get",
            "routeName": "/dashboard/cloud/vm/list",
            "params": {
                "env": $scope.context.envCode
            }
        }, function (error, response) {
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            else {
                return cb(response)
            }
        });
    }
    
    function addEditResourceApi($scope, apiParams, cb) {

		let id = 'new';
	    if ($scope.options.formAction !== 'add') { // on edit
	    	id = apiParams.id;
	    }
	    
	    var options = {
		    method: 'post',
		    routeName: `/dashboard/resources/${id}`,
		    data: {
			    env: apiParams.envCode,             // add/edit resource    + deploy + rebuild
			    resource: apiParams.saveOptions,    // add/edit resource    + cicd
                deployType : apiParams.deployType,  // deploy / rebuild
			    config: {                           // cicd
				    deploy: apiParams.canBeDeployed || false,
				    options: apiParams.options
			    }
		    }
	    };
	    
	    if(apiParams.deployType === 'saveAndDeploy'){
	    	options.data["recipe"] = apiParams.deployOptions.recipe;
	    	options.data["custom"] = apiParams.deployOptions.custom;
		
	    }
	    if(apiParams.deployType === 'saveAndRebuild'){
	    	options.data["serviceId"] = apiParams.serviceId;
	    	options.data["mode"] = apiParams.mode;
	    	options.data["action"] = "rebuild";
	    	options.data["custom"] = apiParams.rebuildOptions;
	    }

        overlayLoading.show();
	    getSendDataFromServer($scope, ngDataApi, options, function (error, result) {
            overlayLoading.hide();
	        if (error) {
			    $scope.displayAlert('danger', error.message);
		    }
		    else {
			    return cb(result);
		    }
	    });
		
	    // var options = {};
	    // if ($scope.options.formAction === 'add') {
		 //    options = {
			//     method: 'post',
			//     routeName: '/dashboard/resources/add',
			//     data: {
			// 	    env: apiParams.envCode,
			// 	    resource: apiParams.saveOptions
         //            //add input for cd records apiParams.options
         //            // add input for deploy apiParams.deployOptions
			//     }
		 //    };
	    // }
	    // else {
		 //    options = {
			//     method: 'put',
			//     routeName: '/dashboard/resources/update',
			//     params: {
			// 	    env: apiParams.envCode,
			// 	    id: apiParams.id
         //            // add inputs for cd records apiParams.options
         //            // add input for rebuild apiParmas.rebuildOptions
			//     },
			//     data: {
			// 	    resource: apiParams.saveOptions
         //            //add input for cd records [apiParams.deployOptions]
			//     }
		 //    };
	    // }
	    //
	    // getSendDataFromServer($scope, ngDataApi, options, function (error, result) {
		 //    if (error) {
			//     overlayLoading.hide();
			//     $scope.displayAlert('danger', error.message);
		 //    }
		 //    else {
			//     return cb(result);
		 //    }
	    // });
    }

    function getCatalogRecipes ($scope, apiParams, cb) {
        overlayLoading.show();
        getSendDataFromServer($scope, ngDataApi, {
            method: 'get',
            routeName: '/dashboard/catalog/recipes/list'
        }, function (error, recipes) {
            overlayLoading.hide();
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            return cb(recipes);
        });
    }

    function getSecrets ($scope, apiParams, cb) {
        overlayLoading.show();
        getSendDataFromServer($scope, ngDataApi, {
            method: 'get',
            routeName: '/dashboard/secrets/list',
            params: apiParams
        }, function (error, secrets) {
            overlayLoading.hide();
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            return cb(secrets);
        });
    }

    function fetchBranches ($scope, apiParams, cb) {
        getSendDataFromServer($scope, ngDataApi, {
            'method': 'get',
            'routeName': '/dashboard/gitAccounts/getBranches',
            params: {
                id: apiParams.accountId,
                name: apiParams.name,
                type: apiParams.type,
                provider: apiParams.provider
            }
        }, function (error, response) {
            if (error) {
                $scope.mainData.configReposBranchesStatus[apiParams.name] = 'failed';
                $scope.displayAlert('danger', error.message);
            } else {
                return cb(response);
            }
        })
    }

    function listAccounts ($scope, apiParams, cb) {
        getSendDataFromServer($scope, ngDataApi, {
            'method': 'get',
            'routeName': '/dashboard/gitAccounts/accounts/list',
            'params': apiParams
        }, function (error, response) {
            if (error) {
                $scope.displayAlert('danger', error.message);
            }else {
                return cb(response)
            }
        });
    }

    function getEnvs ($scope, apiParams, cb) {
        overlayLoading.show();
        getSendDataFromServer($scope, ngDataApi, {
            method: 'get',
            routeName: '/dashboard/environment/list'
        }, function (error, envs) {
            overlayLoading.hide();
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            else {
                return cb(envs);
            }
        });
    }

    function getInfraProviders ($scope, apiParams, cb) {
        getSendDataFromServer($scope, ngDataApi, {
            "method": "get",
            "routeName": "/dashboard/infra"
        }, function (error, providers) {
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            else {
                return cb(providers)
            }
        });
    }

    function deployResource ($scope, apiParams, cb) {
        overlayLoading.show();
        getSendDataFromServer($scope, ngDataApi, {
            method: 'post',
            routeName: '/dashboard/cloud/services/soajs/deploy',
            data: apiParams.deployOptions
        }, function (error) {
            overlayLoading.hide();
            if (error) {
                $scope.displayAlert('danger', error.message);
            }
            else {
                return cb();
            }
        });
    }

	return {
		listResourcesApi,
        deleteResourceApi,
        togglePlugResourceApi,
		listVmsApi,
		addEditResourceApi,
        getCatalogRecipes,
        getSecrets,
        fetchBranches,
        listAccounts,
        getEnvs,
        getInfraProviders,
        deployResource
	};
	
}]);