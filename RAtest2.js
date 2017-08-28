"use strict";


var ellieChart = ellieChart || angular.module("ellie-chart",[]);


ellieChart.directive('areaChart', function($timeout) {
	return {
		restrict: 'EA',
		scope: {
			title: '@title',
			width: '@width',
			height: '@height',
			data: '=data',
			selectFn: '&select'
		},
		link: function($scope, $elm, $attr) {

			// Create the data table and instantiate the chart
			var data = new google.visualization.arrayToDataTable([]);

			data.addColumn('string', 'Label');
			data.addColumn('number', 'water');
			data.addColumn('number', 'coffee');

			var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));

			draw();

			// Watches, to refresh the chart when its data, title or dimensions change
			$scope.$watch('data', function() {
				draw();
			}, true); // true is for deep object equality checking
			$scope.$watch('title', function() {
				draw();
			});
			$scope.$watch('width', function() {
				draw();
			});
			$scope.$watch('height', function() {
				draw();
			});

			// Chart selection handler
			google.visualization.events.addListener(chart, 'select', function() {
				var selectedItem = chart.getSelection()[0];
				if (selectedItem) {
					$scope.$apply(function() {
						$scope.selectFn({
							selectedRowIndex: selectedItem.row
						});
					});
				}
			});

			function draw() {
				if (!draw.triggered) {
					draw.triggered = true;
					$timeout(function() {
						draw.triggered = false;
						var label, water, coffee;
						data.removeRows(0, data.getNumberOfRows());
						angular.forEach($scope.data, function(row) {
							label = row[0];
							water = parseFloat(row[1], 10);
							coffee = parseFloat(row[2], 10);
							if (!isNaN(water) || !isNaN(coffee)) {

								data.addRow([row[0], parseFloat(row[1], 10), parseFloat(row[2], 10) ]);
							}
						});
						var options = {

							hAxis: {title: 'Name',  titleTextStyle: {color: '#333'}},
						    vAxis: {minValue: 0},
						    'title': $scope.title,
				            'width': $scope.width,
				            'height': $scope.height,
						};
						chart.draw(data, options);
						// No raw selected
						$scope.selectFn({
							selectedRowIndex: undefined
						});
					}, 0, true);
				}
			}
		}
	};
});



google.setOnLoadCallback(function () {    
		angular.bootstrap(document.body, ['ellie-app']);
});
google.load('visualization', '1', {packages: ['corechart']});

var myApp = myApp || angular.module("ellie-app",["ellie-chart"]);


myApp.controller('Ctrl', function($scope) {
	// Initial chart data
	$scope.chartTitle = "Coffee or Water";
	$scope.chartWidth = 500;
	$scope.chartHeight = 320;
	$scope.chartData = [
					['Dan',  1000,  400],
					['Jeff',  1170,  460],
					['Kirk',  660,   1120],
					['Raff',  1030,  540]
				];

	$scope.deleteRow = function(index) {
		$scope.chartData.splice(index, 1);
	};
	$scope.addRow = function() {
		$scope.chartData.push([]);
	};
	$scope.selectRow = function(index) {
		$scope.selected = index;
	};
	$scope.rowClass = function(index) {
		return ($scope.selected === index) ? "selected" : "";
	};
});

