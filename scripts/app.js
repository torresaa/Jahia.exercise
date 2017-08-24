var myHost = 'http://localhost:9200';
var myDocumentIndex = 'devices';
var myDocumentType = 'data';

var MyApp = angular.module('MyApp', ['elasticsearch']);

MyApp.service('client', function (esFactory) {
	return esFactory({
		host: myHost,
        log: 'trace'
    });
});

MyApp.controller('myServerHealthController', function ($scope, client, esFactory) {		
	client.cluster.state({
		metric: [
			'cluster_name',
			'nodes',
			'master_node',
			'version'
        ]
	})
    .then(function (resp) {
		$scope.clusterState = resp;
        $scope.error = null;
    })
    .catch(function (err) {
        $scope.clusterState = null;
        $scope.error = err;
        if (err instanceof esFactory.errors.NoConnections) {
          $scope.error = new Error('Unable to connect to elasticsearch. ' +
            'Make sure that it is running and listening at http://localhost:9200');
        }
	});
})

MyApp.controller('myActionController', function($scope, client){
	$scope.addEvent = function () {
		$scope.actionResult = '';
		var aDate = new Date(); 
		client.create ({
			index: myDocumentIndex,
			type: myDocumentType,
			id: aDate.getTime(),
			body: {
				date: aDate.toUTCString(),
				agent: navigator.userAgent 
			}
		}, function (error, response) {
			if (error) {
				$scope.actionResult = "Imposible to create event.";
				console.error('Imposible to create event. The Error:' + error);
			} else {
				$scope.actionResult = 'Created';
				console.log('Response:' + response.result + ', id=' + response._id);
			}
		});
	};
	
	$scope.searchEvent = function () {
		$scope.actionResult = '';
		client.search({
			index: myDocumentIndex,
			q: 'agent:' + $scope.aSearchString
		}, function (error, response) {
			if (error) {
				$scope.actionResult= 'Imposible to fetch data.';
				console.error('Imposible to fetch data. The Error:' + error);
			} else {
				$scope.actionResult = 'Results found:' + response.hits.total;
				$scope.hits = response.hits.hits;
			}
		});
	};
});