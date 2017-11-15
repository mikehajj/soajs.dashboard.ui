"use strict";
var serviceProviders = [
	{
		v: 'aws',
		l: 'Amazon Web Services',
		image: 'http://cloudzone.azurewebsites.net/wp-content/uploads/2015/12/amazon-aws-s3-storage-logo.png',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142213183/AWS+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142344246/AWS+Kubernetes'
		}
	},
	{
		v: 'rackspace',
		l: 'Rackspace',
		image: 'https://cdn.saaspass.com/a52e2205866340ea/authenticators/rackspace_128.png',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142442528/Rackspace+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142147626/Rackspace+Kubernetes'
		}
	},
	{
		v: 'google',
		l: 'Google Cloud',
		image: 'https://cloud.google.com/_static/images/cloud/cloud_64dp.png',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142409762/Google+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142344252/Google+Kubernetes'
		}
	},
	{
		v: 'azure',
		l: 'Microsoft Azure',
		image: 'https://dtb5pzswcit1e.cloudfront.net/assets/images/product_logos/icon_azure@2x.png',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142147642/Microsoft+Azure+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142213187/Microsoft+Azure+Kubernetes'
		}
	},
	{
		v: 'joyent',
		l: 'Joyent',
		image: 'https://cdn1.itcentralstation.com/vendors/logos/original/joyent_avatar_reasonably_small.png?1371107403',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142442552/Joyent+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142442556/Joyent+Kubernetes'
		}
	},
	{
		'v': 'liquidweb',
		l: 'Liquid Web',
		image: 'https://www.liquidweb.com/favicon-32x32.png',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142213203/Liquid+Web+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142180385/Liquid+Web+Kubernetes'
		}
	},
	{
		'v': 'digitalocean',
		l: 'Digital Ocean',
		image: 'https://cdn.zapier.com/storage/developer/f1ce9f60f6740b7862d589a7f755ad19.128x128.png',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142376998/Digital+Ocean+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142344256/Digital+Ocean+Kubernetes'
		}
	},
	{
		v: 'other',
		l: 'Ubuntu',
		image: 'https://assets.ubuntu.com/v1/cb22ba5d-favicon-16x16.png',
		help: {
			docker: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142442570/Other+with+Docker',
			kubernetes: 'https://soajsorg.atlassian.net/wiki/spaces/EX/pages/142377002/Other+with+Kubernetes'
		}
	}
];

var environmentsConfig = {
	deployer: {
		kubernetes: {
			"minPort": 0,
			"maxPort": 2767
		},
		certificates: {
			required: ['ca', 'cert', 'key']
		}
	},
	
	customRegistryIncrement: 20,
	
	form: {
		add: {
			step1: {
				'entries': [
					{
						"name": "generalInfo",
						"directive": "modules/dashboard/environments/directives/add-step1.tmpl"
					}
				]
			},
			step2: {
				"entries": [
					{
						"name": "deployment",
						"directive": "modules/dashboard/environments/directives/add-step2.tmpl"
					}
				]
			},
			step21: {
				"entries": [
					{
						"name": "deployment",
						"directive": "modules/dashboard/environments/directives/add-step21.tmpl"
					}
				]
			},
			step3: {
				"entries": [
					{
						"name": "deployment",
						"directive": "modules/dashboard/environments/directives/add-step3.tmpl"
					}
				]
			},
			step31: {
				"entries": [
					{
						"name": "deployment",
						"directive": "modules/dashboard/environments/directives/deploy-service-details.tmpl"
					}
				]
			},
			step4: {
				"entries": [
					{
						"name": "deployment",
						"directive": "modules/dashboard/environments/directives/add-step4.tmpl"
					}
				]
			},
			overview: {
				"entries": [
					{
						"name": "deployment",
						"directive": "modules/dashboard/environments/directives/add-overview.tmpl"
					}
				]
			}
		},
		database: {
			'name': '',
			'label': '',
			'actions': {},
			'entries': [
				{
					'name': 'prefix',
					'label': "Custom Prefix",
					'type': 'text',
					'placeholder': 'soajs_',
					'value': '',
					'tooltip': "Enter a custom prefix for this Database or leave empty to use the global prefix value.",
					'fieldMsg': "Enter a custom prefix for this Database or leave empty to use the global prefix value.",
					'required': false
				},
				{
					'name': 'name',
					'label': translation.databaseName[LANG],
					'type': 'text',
					'placeholder': translation.myDatabase[LANG],
					'value': '',
					'tooltip': translation.enterEnvironmentDatabaseName[LANG],
					'required': true
				},
				{
					'name': 'cluster',
					'label': translation.clusterName[LANG],
					'type': 'select',
					'value': [{'v': '', 'l': ''}],
					'required': true
				},
				{
					'name': 'tenantSpecific',
					'label': translation.tenantSpecific[LANG],
					'type': 'radio',
					'value': [
						{
							'v': false,
							'l': "False"
						},
						{
							'v': true,
							'l': "True"
						}
					],
					'required': false
				}
			]
		},
		session: {
			'name': '',
			'label': '',
			'actions': {},
			'entries': [
				{
					'name': 'prefix',
					'label': "Custom Prefix",
					'type': 'text',
					'placeholder': 'soajs_',
					'value': '',
					'tooltip': "Enter a custom prefix for this Database or leave empty to use the global prefix value.",
					'fieldMsg': "Enter a custom prefix for this Database or leave empty to use the global prefix value.",
					'required': false
				},
				{
					'name': 'name',
					'label': translation.databaseName[LANG],
					'type': 'text',
					'placeholder': translation.myDatabase[LANG],
					'value': '',
					'tooltip': translation.enterEnvironmentDatabaseName[LANG],
					'required': true
				},
				{
					'name': 'cluster',
					'label': translation.clusterName[LANG],
					'type': 'select',
					'value': [{'v': '', 'l': ''}],
					'required': true
				},
				{
					'name': 'collection',
					'label': translation.sessionDatabaseCollection[LANG],
					'type': 'text',
					'placeholder': translation.sessionDots[LANG],
					'value': '',
					'tooltip': translation.provideTheSessionDatabaseCollectionName[LANG],
					'required': true
				},
				{
					'name': 'stringify',
					'label': translation.stringified[LANG],
					'type': 'radio',
					'value': [{'v': false, 'selected': true}, {'v': true}],
					'required': true
				},
				{
					'name': 'expireAfter',
					'label': translation.expiresAfter[LANG],
					'type': 'text',
					'tooltip': translation.enterNumberHoursBeforeSessionExpires[LANG],
					'value': '',
					'placeholder': '300...',
					'required': true
				},
				{
					'name': 'store',
					'label': translation.store[LANG],
					'type': 'jsoneditor',
					'height': '200px',
					'value': {},
					'required': true,
					'tooltip': translation.provideTheSessionDatabaseStore[LANG]
				}
			]
		},
		host: {
			'name': '',
			'label': '',
			'actions': {},
			'entries': [
				{
					'name': 'number',
					'label': 'Host(s) Number',
					'type': 'number',
					'placeholder': '1',
					'value': 1,
					'tooltip': translation.hostNumber[LANG],
					'fieldMsg': translation.enterHowManyHostsAddForService[LANG],
					'required': true
				},
				{
					'name': 'variables',
					"label": translation.environmentVariables[LANG],
					"type": "textarea",
					"required": false,
					"tooltip": translation.provideOptionalEnvironmentVariablesSeparatedComma[LANG],
					"fieldMsg": "ENV_VAR1=val1,ENV_VAR2=val2,..."
				},
				{
					"name": "defaultENVVAR",
					"type": "html",
					"value": "<p>" + translation.defaultEnvironmentVariables[LANG] + "<br /><ul><li>SOAJS_SRV_AUTOREGISTER=true</li><li>NODE_ENV=production</li><li>SOAJS_ENV=%envName%</li><li>SOAJS_PROFILE=%profilePathToUse%</li></ul></p>"
				}
			]
		},
		deploy: {
			'name': '',
			'label': '',
			'actions': {},
			'entries': [
				{
					'name': 'nginx',
					'label': 'Nginx Configuration',
					'type': 'group',
					'description': {
						'type': 'info',
						'content': ""
					},
					'entries': [
						{
							'name': 'nginxDeploymentMode',
							'label': 'Nginx Deployment Mode',
							'type': 'text',
							'value': 'global',
							'disabled': true,
							'required': true,
							'fieldMsg': "Nginx will be deployed as Global/Daemonset mode on each node.<br />This allows nginx to capture the real IP value when requests arrive to the cloud."
						},
						{
							'name': 'nginxMemoryLimit',
							'label': 'Memory Limit Per Instance for Nginx (in MBytes)',
							'type': 'number',
							'value': 500,
							'fieldMsg': 'Set a custom memory limit for Nginx instances',
							'required': false
						},
						{
							'name': 'nginxRecipe',
							'label': 'Nginx Catalog Recipe',
							'type': 'select',
							'value': [],
							'tooltip': 'Specify the catalog recipe to be used when deploying nginx',
							'required': true
						}
					]
				},
				{
					'name': 'controllers',
					'label': 'Controller Configuration',
					'type': 'group',
					'description': {
						'type': 'none',
						'content': ""
					},
					'entries': [
						{
							'name': 'controllerDeploymentMode',
							'label': 'Controller Deployment Mode',
							'type': 'select',
							'value': [
								{l: 'Replicated', v: 'replicated', 'selected': true},
								{l: 'Global', v: 'global'}
							],
							'tooltip': 'Specify the deployment mode',
							'required': true,
							'fieldMsg': "Global/Daemonset mode deploys one replica of the service on each node.<br />Replicated/Deployment mode deploys the specified number of replicas based on the availability of resources."
						},
						{
							'name': 'controllers',
							'label': translation.controller[LANG],
							'type': 'number',
							'value': '',
							'tooltip': translation.chooseHowManyControllersDeploy[LANG],
							'fieldMsg': translation.chooseHowManyControllersDeploy[LANG],
							'required': true
						},
						{
							'name': 'ctrlMemoryLimit',
							'label': 'Memory Limit Per Instance for Controllers (in MBytes)',
							'type': 'number',
							'value': 500,
							'fieldMsg': 'Set a custom memory limit for controller instances',
							'required': false
						},
						{
							'name': 'ctrlRecipe',
							'label': 'Controller Catalog Recipe',
							'type': 'select',
							'value': [],
							'tooltip': 'Specify the catalog recipe to be used when deploying controller',
							'required': true
						}
					]
				}
			]
		},
		uploadCerts: {
			'entries': [
				{
					'name': 'uploadCerts',
					'label': translation.certificates[LANG],
					'type': 'document',
					'tooltip': translation.uploadCertificate[LANG],
					'required': false,
					"limit": 3,
					'fieldMsg': "Upload certificates in .pem format."
				}
			]
		},
		restartHost: {
			'entries': [
				{
					'name': 'branch',
					'label': 'Select branch to be used in order to restart host',
					'type': 'select',
					'tooltip': 'Select Branch',
					'required': true,
					'value': []
				}
			]
		},
		serviceInfo: {
			'entries': [
				{
					'name': 'jsonData',
					'label': '',
					'type': 'jsoneditor',
					'options': {
						'mode': 'view',
						'availableModes': []
					},
					'height': '500px',
					"value": {}
				}
			]
		},
		multiServiceInfo: {
			'entries': [
				{
					'name': 'infoTabs',
					'label': '',
					'type': 'tabset',
					'tabs': []
				}
			]
		},
		node: {
			'entries': [
				{
					'name': 'ip',
					'label': translation.nodeIP[LANG],
					'type': 'text',
					'tooltip': translation.nodeIP[LANG],
					'required': true,
					'value': ''
				},
				{
					'name': 'port',
					'label': translation.nodeDockerPort[LANG],
					'type': 'number',
					'tooltip': translation.nodeDockerPort[LANG],
					'required': true,
					'value': ''
				},
				{
					'name': 'role',
					'label': translation.nodeRole[LANG],
					'type': 'select',
					'value': [
						{l: 'Manager', v: 'manager'},
						{l: 'Worker', v: 'worker', selected: true}
					],
					'tooltip': translation.nodeRole[LANG],
					'required': true
				}
			]
		},
		nodeTag: {
			'entries': [
				{
					'name': 'tag',
					'label': "Service Provider",
					'type': 'uiselect',
					'value': serviceProviders,
					'tooltip': "Select Which Service Provider Hosts this node",
					'required': true,
					"fieldMsg": "Tag your nodes based on which Service Providers they are available at."
				}
			]
		},
		nginxUI: {
			entries: [
				{
					'name': 'content',
					'label': 'Static Content',
					'type': 'select',
					'required': false,
					'value': []
				},
				{
					'name': 'branch',
					'label': 'Branch',
					'type': 'select',
					'required': false,
					'value': []
				},
				{
					'name': 'supportSSL',
					'label': 'Do you want to enable SSL for Nginx?',
					'type': 'radio',
					'value': [{'v': true, 'l': 'Yes'}, {'v': false, 'l': 'No', 'selected': true}],
					'required': false
				},
				{
					'name': 'certType',
					'label': 'Do you want the system to generate self signed certificates?',
					'type': 'radio',
					'value': [{'v': true, 'l': 'Yes', 'selected': true}, {'v': false, 'l': 'No'}],
					'required': false,
					'hidden': true
				},
				{
					'name': 'kubeSecret',
					'label': 'Kubernetes secret',
					'type': 'text',
					'value': null,
					'fieldMsg': 'Provide the kubernetes secret that contains the certificates',
					'required': false,
					'hidden': true
				},
			]
		}
	},
	
	nginxRequiredCerts: {
		certificate: {
			label: 'Chained Certificate',
			extension: '.crt'
		},
		privateKey: {
			label: 'Private Key',
			extension: '.key',
			msg: 'Key from SSL Provider'
		}
	},
	
	jsoneditorConfig: {
		'height': '200px'
	},
	
	permissions: {
		"listEnvironments": ['dashboard', '/environment/list', 'get'],
		"getEnvironment": ['dashboard', '/environment', 'get'],
		"addEnvironment": ['dashboard', '/environment/add', 'post'],
		"deleteEnvironment": ['dashboard', '/environment/delete', 'delete'],
		"editEnvironment": ['dashboard', '/environment/update', 'put'],
		"getEnvironmentProfile": ['dashboard', '/environment/profile', 'get'],
		"listHosts": ['dashboard', '/hosts/list', 'get'],
		"cd": ['dashboard', '/cd', 'post'],
		"dbs": {
			"list": ['dashboard', '/environment/dbs/list', 'get'],
			"add": ['dashboard', '/environment/dbs/add', 'post'],
			"delete": ['dashboard', '/environment/dbs/delete', 'delete'],
			"update": ['dashboard', '/environment/dbs/update', 'put'],
			"updatePrefix": ['dashboard', '/environment/dbs/updatePrefix', 'put']
		},
		"platforms": {
			"list": ['dashboard', '/environment/platforms/list', 'get'],
			"drivers": {
				"changeSelected": ['dashboard', '/environment/platforms/driver/changeSelected', 'put']
			},
			"deployer": {
				"changeDeployerType": ['dashboard', '/environment/platforms/deployer/type/change', 'put']
			},
			"certs": {
				"upload": ['dashboard', '/environment/platforms/cert/upload', 'post'],
				"choose": ['dashboard', '/environment/platforms/cert/choose', 'put'],
				"delete": ['dashboard', '/environment/platforms/cert/delete', 'delete']
			}
		},
		"hacloud": {
			"nodes": {
				"list": ['dashboard', '/cloud/nodes/list', 'get'],
				"add": ['dashboard', '/cloud/nodes/add', 'post'],
				"remove": ['dashboard', '/cloud/nodes/remove', 'delete'],
				"update": ['dashboard', '/cloud/nodes/update', 'put'],
				"metrics": ['dashboard', '/cloud/metrics/nodes', 'get']
			},
			"services": {
				"list": ['dashboard', '/cloud/services/list', 'get'],
				"add": ['dashboard', '/cloud/services/soajs/deploy', 'post'],
				"delete": ['dashboard', '/cloud/services/delete', 'delete'],
				"scale": ['dashboard', '/cloud/services/scale', 'put'],
				"redeploy": ['dashboard', '/cloud/services/redeploy', 'put'],
				"logs": ['dashboard', '/cloud/services/instances/logs', 'get'],
				"operation": ['dashboard', '/cloud/services/maintenance', 'post'],
				"deployPlugin": ['dashboard', '/cloud/plugins/deploy', 'post'],
				"autoScale": ['dashboard', '/cloud/services/autoscale', 'put'],
				"metrics": ['dashboard', '/cloud/metrics/services', 'get']
			}
		},
		"git": {
			"listAccounts": ["dashboard", "/gitAccounts/accounts/list", "get"],
			"listAccountRepos": ["dashboard", "/gitAccounts/getRepos", "get"]
		},
		"customRegistry": {
			"list": ["dashboard", "/customRegistry/list", "get"],
			"add": ["dashboard", "/customRegistry/add", "post"],
			"update": ["dashboard", "/customRegistry/update", "put"],
			"upgrade": ["dashboard", "/customRegistry/upgrade", "put"],
			"delete": ["dashboard", "/customRegistry/delete", "delete"]
		}
	},
	
	providers: serviceProviders,
	
	recipeTypes: {
		soajs: {
			l: "SOAJS",
			'categories': {
				other: {'l': "Other"}
			}
		},
		database: {
			l: "Database",
			'categories': {
				other: {'l': "Other"}
			}
		},
		nginx: {
			l: "Nginx",
			'categories': {
				other: {'l': "Other"}
			}
		},
		service: {
			'l': "Service",
			'categories': {
				soajs: {
					l: 'SOAJS'
				},
				nodejs: {
					l: 'NodeJs'
				},
				php: {
					l: 'PHP'
				},
				java: {
					l: 'Java'
				},
				asp: {
					l: 'ASP'
				},
				other: {
					l: 'Other'
				}
			}
		},
		daemon: {
			'l': "Daemon",
			'categories': {
				soajs: {
					l: 'SOAJS'
				},
				nodejs: {
					l: 'NodeJs'
				},
				php: {
					l: 'PHP'
				},
				java: {
					l: 'Java'
				},
				asp: {
					l: 'ASP'
				},
				other: {
					l: 'Other'
				}
			}
		},
		cluster: {
			'l': "Cluster",
			'categories': {
				mongo: {'l': "Mongo"},
				elasticsearch: {'l': "ElasticSearch"},
				mysql: {'l': "MySQL"},
				oracle: {'l': "Oracle"},
				other: {'l': "Other"}
			}
		},
		server: {
			'l': "Server",
			'categories': {
				nginx: {
					'l': "Nginx"
				},
				apache: {
					'l': "Apache"
				},
				iis: {
					'l': "IIS"
				},
				other: {
					'l': "Other"
				}
			}
		},
		cdn: {
			'l': "CDN",
			'categories': {
				amazons3: {"l": "Amazon S3"},
				rackspace: {"l": "Rackspace"},
				// cloudflare: {"l": "Cloudflare"},
				other: {"l": "Other"}
			}
		},
		system: {
			'l': "System",
			'categories': {
				other: {"l": "Other"}
			}
		},
		other: {
			'l': "Other",
			'categories': {
				other: {'l': "Other"}
			}
		}
	},
	
	portal: {
		mainPackage : {
			'code': "MAIN",
			'name': "Main Package",
			'description': "This is a public package for the portal product that allows users to login to the portal interface.",
			'_TTL': (7 * 24).toString(),
			"acl": {
				"portal": {
					"oauth": {
						"access": false,
						"apisPermission": "restricted",
						"get": {
							"apis": {
								"/authorization": {}
							}
						},
						"post": {
							"apis": {
								"/token": {}
							}
						},
						"delete": {
							"apis": {
								"/accessToken/:token": {
									"access": true
								},
								"/refreshToken/:token": {
									"access": true
								}
							}
						}
					},
					"urac": {
						"access": false,
						"apisPermission": "restricted",
						"get": {
							"apis": {
								"/forgotPassword": {},
								"/changeEmail/validate": {},
								"/checkUsername": {},
								"/account/getUser": {
									"access": true
								},
								"/join/validate": {}
							}
						},
						"post": {
							"apis": {
								"/resetPassword": {},
								"/account/changePassword": {
									"access": true
								},
								"/account/changeEmail": {
									"access": true
								},
								"/account/editProfile": {
									"access": true
								},
								"/join": {}
							}
						}
					}
				}
			}
		},
		userPackage: {
			'code': "USER",
			'name': "User Package",
			'description': "This package offers the minimum ACL needed to execute management operation in the portal interface.",
			'_TTL': (7 * 24).toString(),
			"acl": {
				"portal": {
					"oauth": {
						"access": true
					},
					"urac": {
						"access": true,
						"apisPermission": "restricted",
						"get": {
							"apis": {
								"/account/getUser": {},
								"/changeEmail/validate": {},
								"/checkUsername": {},
								"/forgotPassword": {},
								"/owner/admin/users/count": {},
								"/owner/admin/listUsers": {},
								"/owner/admin/changeUserStatus": {},
								"/owner/admin/getUser": {},
								"/owner/admin/group/list": {},
								"/owner/admin/tokens/list": {},
								"/tenant/getUserAclInfo": {},
								"/tenant/list": {}
							}
						},
						"post": {
							"apis": {
								"/account/changePassword": {},
								"/account/changeEmail": {},
								"/account/editProfile": {},
								"/resetPassword": {},
								"/owner/admin/addUser": {},
								"/owner/admin/editUser": {},
								"/owner/admin/editUserConfig": {},
								"/owner/admin/group/add": {},
								"/owner/admin/group/edit": {},
								"/owner/admin/group/addUsers": {}
							}
						},
						"delete": {
							"apis": {
								"/owner/admin/group/delete": {},
								"/owner/admin/tokens/delete": {}
							}
						}
					}
				}
			}
		},
		tenant: {
			'type': "client",
			'code': "PRTL",
			'name': "Portal Tenant",
			'email': "me@localhost.com",
			'description': "Portal Tenant that uses the portal product and its packages",
			'tag': "portal"
		},
		tenantApplicationKeyConfig : {
			'envCode': 'PORTAL', // updated in code
			'config': {
				"oauth": {
					"loginMode": "urac"
				},
				"commonFields": {
					"mail": {
						"from": "me@localhost.com",
						"transport": {
							"type": "sendmail",
							"options": {}
						}
					}
				},
				"urac": {
					"hashIterations": 1024,
					"seedLength": 32,
					"link": {
						"addUser": "", // updated in code
						"changeEmail": "", // updated in code
						"forgotPassword": "", // updated in code
						"join": "" // updated in code
					},
					"tokenExpiryTTL": 172800000,
					"validateJoin": true,
					"mail": {
						"join": {
							"subject": "Welcome to SOAJS",
							"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
						},
						"forgotPassword": {
							"subject": "Reset Your Password at SOAJS",
							"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
						},
						"addUser": {
							"subject": "Account Created at SOAJS",
							"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
						},
						"changeUserStatus": {
							"subject": "Account Status changed at SOAJS",
							"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
						},
						"changeEmail": {
							"subject": "Change Account Email at SOAJS",
							"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
						}
					}
				}
			}
		},
		nginxRecipe : {
			"deployOptions": {
				"image": {
					"prefix": "", // updated in code
					"name": "", // updated in code
					"tag": "", // updated in code
					"pullPolicy": "IfNotPresent"
				},
				"readinessProbe": {
					"httpGet": {
						"path": "/",
						"port": "http"
					},
					"initialDelaySeconds": 5,
					"timeoutSeconds": 2,
					"periodSeconds": 5,
					"successThreshold": 1,
					"failureThreshold": 3
				},
				"restartPolicy": {
					"condition": "any",
					"maxAttempts": 5
				},
				"container": {
					"network": "soajsnet",
					"workingDir": "/opt/soajs/deployer/"
				},
				"voluming": {
					"volumes": []
				},
				"ports": [
					{
						"name": "http",
						"target": 80,
						"isPublished": true,
						"published": "", // updated in code
						"preserveClientIP": true
					}
				]
			},
			"buildOptions": {
				"env": {
					"SOAJS_ENV": {
						"type": "computed",
						"value": "$SOAJS_ENV"
					},
					"SOAJS_NX_DOMAIN": {
						"type": "computed",
						"value": "$SOAJS_NX_DOMAIN"
					},
					"SOAJS_NX_API_DOMAIN": {
						"type": "computed",
						"value": "$SOAJS_NX_API_DOMAIN"
					},
					"SOAJS_NX_SITE_DOMAIN": {
						"type": "computed",
						"value": "$SOAJS_NX_SITE_DOMAIN"
					},
					"SOAJS_NX_CONTROLLER_NB": {
						"type": "computed",
						"value": "$SOAJS_NX_CONTROLLER_NB"
					},
					"SOAJS_NX_CONTROLLER_IP": {
						"type": "computed",
						"value": "$SOAJS_NX_CONTROLLER_IP_N"
					},
					"SOAJS_NX_CONTROLLER_PORT": {
						"type": "computed",
						"value": "$SOAJS_NX_CONTROLLER_PORT"
					},
					"SOAJS_DEPLOY_HA": {
						"type": "computed",
						"value": "$SOAJS_DEPLOY_HA"
					},
					"SOAJS_HA_NAME": {
						"type": "computed",
						"value": "$SOAJS_HA_NAME"
					}
				},
				"cmd": {
					"deploy": {
						"command": [
							"bash"
						],
						"args": [
							"-c",
							"node index.js -T nginx"
						]
					}
				}
			}
		}
	}
};
