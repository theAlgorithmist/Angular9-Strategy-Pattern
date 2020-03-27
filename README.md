# Lazy-Loading Components in Angular Version 9

This is the code distribution for the Medium Article, _Implementing The Strategy Pattern Using Lazy-Loaded Components_ .

Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

Angular: 9.0.0

Angular CLI: 9.0.1

Typescript: 3.7.5

## Point-In-Circles Simulation

This application illustrates the practical application of lazy-loaded Components in Angular Version 9.  The sample application is a simulation of two algorithms for solving the point-in-circle problem, i.e. does a given point lie strictly inside a circle?  There are an arbitrary number of circles in each simulation.  Not only does the algorithm vary, the simulation results are rendered in real-time, but to two different environments (Canvas and SVG).  If the simulation display were exactly the same, the run-time Strategy could be resolved by lazy-loading a computational library (two different libraries, one for each algorithm).  Instead, an entire Component (and its dependencies) are lazy-loaded to implement one of two different simulations.
 
As a bonus, the Typescript Math Toolkit circle utility libraries are included in the code distribution.  Only a small number of these utilities are used in the simulation(s).  The remaining functions may be used in other production applications that require mathematical operations involving circles.
  
These files are located in the _/src/app/shared/libs/circle-util-functions.ts_ file.  This is a collection of pure functions.

```
TSMT$CircleArea
TSMT$CircleCircumference
TSMT$CircleArcLength
TSMT$CircleChordParams
TSMT$CircleSectorParams
TSMT$CircleGetCoords
TSMT$CircleInscribedRectProps
TSMT$CircleInscribedTriangleProps
TSMT$TriangleCircumcircle
TSMT$TriangleIncircle
TSMT$CircleToCircleIntersection
TSMT$CircleCircleIntersection
TSMT$CircleSegmentIntersection
TSMT$CircleGaps
TSMT$CircleTangentsFromPoint
TSMT$PointInCircle
```

To run the application, change the algorithm id in the _app.module.ts_ file (see _providers_) to 1 (Canvas Render) or 2 (SVG Render).

When viewing a simulation, it may appear that an intersection occurs that is not recorded.  This is because a small circle is used to represent a single point and part of the circle may appear to lie inside another circle, when the point itself does not.  Also understand that the intersection tests for strict interior.  If the point lies exactly on the circle boundary, the intersection test returns false.

```
iimport { BrowserModule } from '@angular/platform-browser';
 import { NgModule      } from '@angular/core';
 
 import { AppComponent  } from './app.component';
 import { CircleService } from './shared/services/circle-service';
 
 // Injectable constants
 import { ALGORITHM_ID    } from './tokens';
 
 @NgModule({
   declarations: [
     AppComponent,
   ],
   imports: [
     BrowserModule
   ],
   providers: [
     CircleService,
     { provide: ALGORITHM_ID, useValue: 2 },
   ],
   bootstrap: [AppComponent]
 })
 export class AppModule { }
```

The two algorithms are relatively simple since this is more of an Angular 9 demo than an advanced algorithms treatment.  The Canvas algorithm is intended for an arbitrary number of circles that do no move, while the point may be anywhere in the display space.  It uses a simple quad-map, obtained by dividing the display space into quadrants.  Four structures are used to provide quick lookup of only the subset of circles in a given quadrant.  This subset is tested for intersection as soon as the quadrant in which the point currently lies is computed.  The intersection test is optimized to return false quickly since it is expected that most of the full intersection tests will be false. This reduces the overall amount of computation.

The SVG algorithm is designed for a a modest number of circles (hundreds) where both the point and some subset of the circles move at each simulation step.  This uses the straight intersection test for all circles.  A false result has an even higher level of expecation, so optimizing the test to return false as fast as possible is beneficial.

Other, more sophisticated, algorithms exist for solving this problem, and you now have a complete testbed for comparing their performance, should you wish to engage in such an exercise :)

Have fun!!


## Sample Simulation

Here is a screen shot of the Canvas simulation (algorithm id: 1).

!['Canvas Simulation'](https://github.com/theAlgorithmist/Angular9-Strategy-Pattern/tree/master/images/canvas.png)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.


## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


License
----

Apache 2.0

**Free Software? Yeah, Homey plays that**

[//]: # (kudos http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[The Algorithmist]: <https://www.linkedin.com/in/jimarmstrong/>
