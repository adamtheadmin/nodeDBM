/*//====
  Client Script
  (C) 2015
*///====

function tab(name){
  var $scope = $.scope,
    thus = this;
  this.name = name || "Tab #" + ($scope.tabs.length + 1);
  this.sql = "";
  this.data = [];
  $scope.tabs.push(this);
  $scope.tab = this;

  this.run = function(){
    $scope.query($scope.database ? "USE " + $scope.database + ';' + this.sql : this.sql, function(data){
        thus.data = data;
        $scope.update();
        $scope.sendData();
      }, function(data){
        thus.data = data;
        $scope.update();
      });
  }
}
var myApp = angular.module('app',[]);

myApp.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});

myApp.controller('mysql', ['$scope', function($scope) {
  $.scope = $scope;
  $scope.connections = [];
  $scope.selected = null;
  $scope.database = null;
  $scope.tab = null;
  $scope.tabs = [];
  $scope.loading = false;

  $scope.newTab = function(name){
    return new tab(name);
  }

  $scope.sendData = function(){
    var $tabs = [];
    $.each($scope.tabs, function(nuh, tab){
        $tabs.push({
          name : tab.name,
          sql : tab.sql
          })
      })
    $.api("update", {
      selected : $scope.selected,
      database : $scope.database,
      tab : $scope.tabs.indexOf($scope.tab),
      tabs : $tabs
      })
  };

  $scope.terminate = function(){
    $.siteDialog({
        title : "Terminate Session",
        text : "Are you sure you want to terminate? This will disconnect all database sessions.",
        buttons : {
          Yes : function(){
            $.api("terminate", {}, function(){
                $.siteDialog('close');
                $scope.init();
              });
          }, 
          No : 0
        }
      })
  }

  $scope.select = function(id, done){
    done = done || function(){};
    if(!(id in $scope.connections))
      return;
    $scope.selected = id;
    $scope.connections[id].databases = [];
    $scope.query("SHOW DATABASES", function(data){
      $scope.connections[id].databases = data;
      $scope.update();
      done();
      });
    $scope.update();
    $scope.sendData();
  }

  $scope.selectDB = function(db){
    if($scope.database == db.Database){
      delete db.tables;
      $scope.database = null;
      $scope.update();
      return;
    }
    $scope.database = db.Database;
    $scope.query("USE " + db.Database + "; SHOW TABLES", function(data){
      db.tables = data;
      $scope.update();
      });
    $scope.update();
    $scope.sendData();
  }

  $scope.selectTable = function($table){
    var $tab = $scope.newTab($table);
    $tab.sql = "SELECT * FROM `" + $scope.database + "`.`" + $table + '` LIMIT 250';
    $tab.run();
  }

  $scope.selectTab = function($tab){
    $scope.tab = $tab;
    $scope.update();
    $scope.sendData();
  }

  $scope.query = function($sql, $done, $partial){
    $partial = $partial || function(){};
    $.query($scope.selected, $sql, $partial, $done)
  }

  $scope.closeTab = function($tab){
  if($scope.tabs.length < 2) return;
    $scope.tabs.splice($scope.tabs.indexOf($tab), 1);
    $scope.tab = $scope.tabs[$scope.tabs.length - 1];
    $scope.update()
    $scope.sendData();
  }

  $scope.newConnection = function(){
      var $btns = $.requestData("New Connection", [
            {title : "Name", name : "name", type : 'text'},
            {title : "Username", name : "user", type : 'text'},
            {title : "Password", name : "password", type : 'password'},
            {title : "host", name : "host", type : 'text', value : '127.0.0.1'},
            {title : "port", name : "port", type : 'text', value : '3306'}
            ], function($data){
              $green.html("Testing...");

              $.api("connect", {
                  db : $data
                }, function(data){
                  if(!data.status){
                    $green.html(data.reason);
                    return;
                  }
                  $.siteDialog('close');

                  new tab();
                  $scope.sendData();
                  $scope.init();
                })
            });

      var $green = $btns.Update.html("Connect");
  }

  $scope.update = function(){
    if (!$scope.$$phase) {
      $scope.$apply();
    }
  }

  $scope.init = function(){
    $.api('update', {}, function(data){
        $scope.connections = data.connections;

        if('selected' in data)
          $scope.select(data.selected, function(){
            if('database' in data)
              $scope.selectDB({Database : data.database})

            if('tabs' in data){
              $.each(data.tabs, function(nuh, theTab){
                var $tab = new tab()
                $tab.name = theTab.name;
                $tab.sql = theTab.sql;
                $tab.run();
                })
            }
            });

        if('tab' in data)
          $scope.tab = $scope.tabs[data.tab];


        $scope.update();
      })
  }

  $scope.init();

  $(function(){
    $(window).keypress(function(e){
      if(e.keyCode == 120) //F9
        $.scope.tab.run();
      })
    })


}]);