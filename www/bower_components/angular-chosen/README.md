angular-chosen
==============

AngularJS Chosen directive

This directive brings the [Chosen](http://harvesthq.github.com/chosen/) jQuery plugin
into AngularJS with ngModel and ngOptions integration.

To use, include "angular-chosen" as a dependency in your Angular module.  You can now
use the "chosen" directive as an attribute on any select element.

# Attribution

All the initial ideas and source code are based on [localytics](https://github.com/localytics/angular-chosen) ones.
I've converted to coffeescript a [pull request](https://github.com/localytics/angular-chosen/pull/2) from
[lmbrt](https://github.com/lmbrt/angular-chosen) to listen to the model.

# Features

  * Works with 'ngModel' and 'ngOptions'
  * Supports usage of promises in 'ngOptions'
  * Provides a 'loading' animation when 'ngOptions' collection is a promise backed by a remote source
  * Pass options to Chosen via attributes or by passing an object to the Chosen directive

# Usage

### Simple example

Similar to `$("#states").chosen()`

    <select chosen multiple id="states">
      <option value="AK">Alaska</option>
      <option value="AZ">Arizona</option>
      <option value="AR">Arkansas</option>    
      <option value="CA">California</option>    
    </select>

### Pass any chosen options as attributes

    <select chosen
            data-placeholder="Pick one of these"
            disable-search="true"
            allow-single-deselect="true">
      <option value=""></option>
      <option>This is fun</option>
      <option>I like Chosen so much</option>
      <option>I also like bunny rabbits</option>
    </select>

### Integration with `ngModel` and `ngOptions`

    <select multiple
            chosen
            ng-model="state" 
            ng-options="s for s in states">
    </select>

### Loading from a remote data source

Include chosen-spinner.css and spinner.gif to show an Ajax spinner icon while your data is loading.  If the collection
comes back empty, the directive will disable the element and show a default "No values available" message.
You can customize this message by passing in noResultsText in your options.

##### app.js

    angular.module('App', ['ngResource', 'angular-chosen'])
    .controller('BeerCtrl', function($scope) {
      $scope.beers = $resource('api/beers').query()
    });

##### index.html

    <div ng-controller="BeerCtrl">
      <select chosen
              data-placeholder="Choose a beer"
              no-results-text="'Could not find any beers :('"
              ng-model="beer" 
              ng-options="b for b in beers">
      </select>
    </div>

Image of select defined above in loading state:
<img src="https://raw.github.com/iiome/angular-chosen/master/example/choose-a-beer.png">


See the example directory for more detailed usage.

# Compile

`cd src` and `coffee -o ../ -c angular-chosen.coffee`

Usage of Grunt is planned.

