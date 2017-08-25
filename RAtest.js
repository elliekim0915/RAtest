"use strict";


var ellieChart = ellieChart || angular.module("ellie-chart",[]);


ellieChart.directive('pieChart', function($timeout) {
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
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Label');
      data.addColumn('number', 'Value');
      var chart = new google.visualization.PieChart($elm[0]);

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
            var label, value;
            data.removeRows(0, data.getNumberOfRows());
            angular.forEach($scope.data, function(row) {
              label = row[0];
              value = parseFloat(row[1], 10);
              if (!isNaN(value)) {
                data.addRow([row[0], value]);
              }
            });
            var options = {
              'title': $scope.title,
              'width': $scope.width,
              'height': $scope.height,
              is3D: true
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
  $scope.chartTitle = "Monthly Coffee Consumption Rate in R.A.";
  $scope.chartWidth = 500;
  $scope.chartHeight = 320;
  $scope.chartData = [
    ['Jeff', 80],
    ['Dan', 46],
    ['Kirk', 74],
    ['Mike', 27],
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

