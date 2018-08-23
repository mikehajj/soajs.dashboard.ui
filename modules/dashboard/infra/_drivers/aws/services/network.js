"use strict";
var awsInfraNetworkSrv = soajsApp.components;
awsInfraNetworkSrv.service('awsInfraNetworkSrv', ['ngDataApi', '$localStorage', '$timeout', '$modal', '$window', function (ngDataApi, $localStorage, $timeout, $modal, $window) {

	let infraNetworkConfig = {
		form: {
			addNetwork: [
				{
					'name': 'region',
					'label': 'Region',
					'type': 'readonly',
					'value': "",
					'fieldMsg': 'Region where the network will be located',
					'required': true
				},
				{
					'name': 'address',
					'label': 'Primary Address',
					'type': 'text',
					'value': "",
					"placeholder": "10.0.0.0/16",
					'fieldMsg': 'Enter a primary address for the network. You may later edit the network to add/remove addresses other than the primary address.',
					'required': false
				},
				{
					'name': 'amazonProvidedIpv6CidrBlock',
					'label': 'Request Amazon Provided IPv6 CIDR Block',
					'type': 'buttonSlider',
					'value': false,
					'fieldMsg': 'Turn this slider on to request an Amazon-provided IPv6 CIDR block with a /56 prefix length for the VPC. You cannot specify the range of IP addresses, or the size of the CIDR block.',
					'required': false
				},
				{
					'name': 'instanceTenancy',
					'label': 'Instance Tenancy',
					'type': 'select',
					'value': [{"v": "default", "l": "Default"}, {"v": "dedicated", "l": "Dedicated"}],
					'fieldMsg': 'Selecting "Default" launches instances with shared tenancy by default. Selecting "Dedicated" launches instances as dedicated tenancy by default.',
					'required': false
				}
			],
			editNetwork: [
				{
					'name': 'region',
					'label': 'Region',
					'type': 'readonly',
					'value': "",
					'fieldMsg': 'Region where the network will be located',
					'required': true
				},
				{
					'name': 'primaryAddress',
					'label': 'Primary Address',
					'type': 'readonly',
					'value': "",
					'fieldMsg': "The Network's primary address.",
					'required': false
				},
				{
					'name': 'instanceTenancy',
					'label': 'Instance Tenancy',
					'type': 'readonly',
					'value': "",
					'fieldMsg': '',
					'required': false
				},
				{
					'name': 'networkAddresses',
					'label': 'Network Addresses',
					'type': 'group',
					'entries':[
						{
							'type': 'html',
							'value': "<input type='button' class='btn btn-sm btn-success f-right' value='Add New Address'/>",
							'name': 'addNewAddress'
						}

					]
				}
			],
			addressInput: {
				'name': 'addressGroup',
				'type': 'group',
				'label': 'New Address',
				'entries': [
					{
						'name': 'addressIp',
						'label': 'Address IP',
						'type': 'text',
						'value': '',
						'required': true,
						'fieldMsg': 'Enter an address using CIDR notation.',
						'placeholder': "10.0.0.0/24"
					},
					{
						'type': 'html',
						'name': 'rAddress',
						'value': '<span class="icon icon-cross"></span>'
					}
				]
			}

		},

		grid: {
			recordsPerPageArray: [5, 10, 50, 100],
			'columns': [
				{ 'label': 'Network Name', 'field': 'name' },
				{ 'label': 'Network Address Prefixes', 'field': 'addressPrefixes' },
				{ 'label': 'Network DNS Servers', 'field': 'dnsServers' },
				{ 'label': 'Network Subnets', 'field': 'subnets' }
			],
			'leftActions': [],
			'topActions': [],
			'defaultSortField': 'name',
			'defaultLimit': 10
		},
	};


	function addNetwork(currentScope) {
		let options = {
			timeout: $timeout,
			form: {
				"entries": angular.copy(infraNetworkConfig.form.addNetwork)
			},
			name: 'addNetwork',
			label: 'Add New Network',
			actions: [
				{
					'type': 'submit',
					'label': "Create Network",
					'btn': 'primary',
					'action': function (formData) {
						let data = angular.copy(formData);

						let postOpts = {
							"method": "post",
							"routeName": "/dashboard/infra/extras",
							"params": {
								"infraId": currentScope.currentSelectedInfra._id,
								"technology": "vm"
							},
							"data": {
								"params": {
									"section": "network",
									"region": currentScope.selectedRegion,
									"Ipv6Address": data.amazonProvidedIpv6CidrBlock,
									"InstanceTenancy": data.instanceTenancy
								}
							}
						};


						let addressPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
						if (formData.address && formData.address.length > 0 && !addressPattern.test(formData.address)) {
							return $window.alert("Make sure the address you entered follows the correct CIDR format.");
						}

						if (data.address) {
							postOpts.data.params.address = data.address;
						}

						overlayLoading.show();
						getSendDataFromServer(currentScope, ngDataApi, postOpts, function (error) {
							overlayLoading.hide();
							if (error) {
								currentScope.form.displayAlert('danger', error.message);
							}
							else {
								currentScope.displayAlert('success', "Netowkr created successfully. Changes take a bit of time to be populated and might require you refresh in the list after a few seconds.");
								currentScope.modalInstance.close();
								$timeout(() => {
									listNetworks(currentScope, currentScope.selectedRegion);
								}, 2000);
							}
						});
					}
				},
				{
					'type': 'reset',
					'label': 'Cancel',
					'btn': 'danger',
					'action': function () {
						delete currentScope.form.formData;
						currentScope.modalInstance.close();
					}
				}
			]
		};

		//set value of region to selectedRegion
		options.form.entries[0].value = currentScope.selectedRegion;

		//select first entry by default
		options.form.entries[3].value[0].selected = true;

		buildFormWithModal(currentScope, $modal, options);
	}

	function editNetwork(currentScope, originalNetwork) {
		let oneNetwork = angular.copy(originalNetwork);

		// Make a copy of all addresses -> remove primary address from the array
		let allAddresses = angular.copy(oneNetwork.address);
		allAddresses.splice(oneNetwork.address.indexOf(oneNetwork.primaryAddress), 1);

		let options = {
			timeout: $timeout,
			form: {
				"entries": angular.copy(infraNetworkConfig.form.editNetwork)
			},
			data: oneNetwork,
			name: 'editNetwork',
			label: 'Edit Network',
			actions: [
				{
					'type': 'submit',
					'label': "Update Network",
					'btn': 'primary',
					'action': function (formData) {
						let data = angular.copy(formData);
						let ipAddresses = [];

						let postOpts = {
							"method": "put",
							"routeName": "/dashboard/infra/extras",
							"params": {
								"infraId": currentScope.currentSelectedInfra._id,
								"technology": "vm"
							},
							"data": {
								"params": {
									"section": "network",
									"region": currentScope.selectedRegion,
									"name": originalNetwork.id
								}
							}
						};

						//aggregated primary address and other addresses in one array
						let aggregatedAddresses = [];
						aggregatedAddresses.push(oneNetwork.primaryAddress);

						for (let i=0; i<currentScope.addressCounter; i++) {
							if (data['addressIp'+i]) aggregatedAddresses.push(data['addressIp'+i]);
						}

						postOpts.data.params.addresses = aggregatedAddresses;

						// // TODO: regex the ips to make sure they are in the correct format
						// let addressPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
						// if (formData.address && formData.address.length > 0 && !addressPattern.test(formData.address)) {
						// 	return $window.alert("Make sure the address you entered follows the correct CIDR format.");
						// }
						//
						overlayLoading.show();
						getSendDataFromServer(currentScope, ngDataApi, postOpts, function (error) {
							overlayLoading.hide();
							if (error) {
								currentScope.form.displayAlert('danger', error.message);
							}
							else {
								currentScope.displayAlert('success', "Network Updated successfully. Changes take a bit of time to be populated and might require you to refresh in the list after a few seconds.");
								currentScope.modalInstance.close();
								$timeout(() => {
									listNetworks(currentScope, currentScope.selectedRegion);
								}, 2000);
							}
						});
					}
				},
				{
					'type': 'reset',
					'label': 'Cancel',
					'btn': 'danger',
					'action': function () {
						delete currentScope.form.formData;
						currentScope.modalInstance.close();
					}
				}
			]
		};

		options.form.entries[3].entries[0].onAction = function(id, value, form){
			addNewAddress(form, currentScope);
		};


		buildFormWithModal(currentScope, $modal, options, () => {
			currentScope.form.formData = oneNetwork;

			if (oneNetwork.instanceTenancy && oneNetwork.instanceTenancy === 'default') {
				currentScope.form.entries[2].value = "Default";
			}
			else if (oneNetwork.instanceTenancy && oneNetwork.instanceTenancy === 'dedicated'){
				currentScope.form.entries[2].value = "Dedicated";
			}

			currentScope.addressCounter = 0;
			allAddresses.forEach((oneAddress, index) => {
				addNewAddress(currentScope.form, currentScope);
				currentScope.form.formData['addressIp' + index] = oneAddress;
			});
		});
	}

	function addNewAddress(form, currentScope) {
		let addressCounter = currentScope.addressCounter
		var tmp = angular.copy(infraNetworkConfig.form.addressInput);

		tmp.name += addressCounter;
		tmp.entries[0].name += addressCounter;
		tmp.entries[1].name += addressCounter;

		tmp.entries[1].onAction = function (id, value, form) {
			var count = parseInt(id.replace('rAddress', ''));

			for (let i = form.entries[3].entries.length -1; i >= 0; i--) {
				if (form.entries[3].entries[i].name === 'addressGroup' + count) {
					//remove from formData
					for (var fieldname in form.formData) {
						if (['addressIp' + count].indexOf(fieldname) !== -1) {
							delete form.formData[fieldname];
						}
					}
					//remove from formEntries
					form.entries[3].entries.splice(i, 1);
					break;
				}
			}
		};

		if (form && form.entries) {
			form.entries[3].entries.splice(form.entries[3].entries.length - 1, 0, tmp);
		}
		else {
			form.entries[3].entries.splice(form.entries[3].entries.length - 1, 0, tmp);
		}
		currentScope.addressCounter++;
	}

	function deleteNetwork(currentScope, oneNetwork) {
		let deleteNetworkOpts = {
			method: 'delete',
			routeName: '/dashboard/infra/extras',
			params: {
				'infraId': currentScope.$parent.$parent.currentSelectedInfra._id,
				'technology': 'vm',
				'section': 'network',
				'region': currentScope.selectedRegion,
				'name': oneNetwork.id
			}
		};

		overlayLoading.show();
		getSendDataFromServer(currentScope, ngDataApi, deleteNetworkOpts, (error, response) => {
			overlayLoading.hide();
			if (error) {
				overlayLoading.hide();
				currentScope.displayAlert('danger', error);
			}
			else {
				overlayLoading.hide();
				currentScope.displayAlert('success', `The network has been successfully deleted. Changes take a bit of time to be populated and might require you refresh in the list after a few seconds.`);
				$timeout(() => {
					listNetworks(currentScope, currentScope.selectedRegion);
				}, 2000);
			}
		});
	}

	function listNetworks(currentScope, oneRegion) {
		let oneInfra = currentScope.$parent.$parent.currentSelectedInfra;

		//save selected group in scope to be accessed by other functions
		currentScope.selectedRegion = oneRegion;

		//clean grid from previous list if any
		if (currentScope.grid && currentScope.grid.rows && currentScope.grid.filteredRows && currentScope.grid.original) {
			currentScope.grid.rows = [];
			currentScope.grid.filteredRows = [];
			currentScope.grid.original = [];
		}

		let listOptions = {
			method: 'get',
			routeName: '/dashboard/infra/extras',
			params: {
				'id': oneInfra._id,
				'region': oneRegion,
				'extras[]': ['networks']
			}
		};

		overlayLoading.show();
		getSendDataFromServer(currentScope, ngDataApi, listOptions, (error, response) => {
			overlayLoading.hide();
			if (error) {
				currentScope.displayAlert('danger', error);
			}
			else {
				currentScope.infraNetworks = [];
				if (response.networks && response.networks.length > 0) {
					currentScope.infraNetworks = response.networks;
				}
				if (currentScope.infraNetworks.length > 0) {
					currentScope.infraNetworks[0].open = true;
				}

				if (currentScope.vmlayers) {
					let processedFirewalls = [];
					currentScope.infraNetworks.forEach((oneNetwork) => {
						oneNetwork.subnets.forEach((oneSubnet) => {
							currentScope.vmlayers.forEach((oneVmLayer) => {
								if (oneVmLayer.network && oneVmLayer.network.toLowerCase() === oneNetwork.name.toLowerCase() && oneSubnet.name === oneVmLayer.layer) {

									if (oneVmLayer.labels&& oneVmLayer.labels['soajs.env.code']) {
										let found = false;
										$localStorage.environments.forEach((oneEnv) => {
											if (oneEnv.code.toUpperCase() === oneVmLayer.labels['soajs.env.code'].toUpperCase()) {
												found = true;
											}
										});

										oneSubnet.vm = {
											vmLayer: oneVmLayer.layer,
											envCode: oneVmLayer.labels['soajs.env.code'],
											region: oneVmLayer.labels['soajs.service.vm.location'],
											link: found
										};
									}
									else{
										oneSubnet.vm = {
											vmLayer: oneVmLayer.layer,
											link: false
										};
									}

									if(!oneNetwork.firewall){
										oneNetwork.firewall = [];
									}

									if(processedFirewalls.indexOf(oneVmLayer.securityGroup) === -1){
										processedFirewalls.push(oneVmLayer.securityGroup);
										oneNetwork.firewall.push({
											name: oneVmLayer.securityGroup
										});
									}
								}
							});
						});
					});
				}
			}
		});
	}

	return {
		'addNetwork': addNetwork,
		'editNetwork': editNetwork,
		'deleteNetwork': deleteNetwork,
		'listNetworks': listNetworks
	};
}]);
