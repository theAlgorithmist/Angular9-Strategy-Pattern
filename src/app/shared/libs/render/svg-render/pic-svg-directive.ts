/**
 * Copyright 2020 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Render the point-in-circle display into SVG using an alternate strategy from the Canvas renderer.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChange,
  SimpleChanges
} from '@angular/core';

import * as SVG from 'svg.js';

import { TSMT$Circle       } from '../../circle';
import { TSMT$PointInCircle } from '../../circle-util-functions';

import { RandomIntInRange } from '../../random/RandomIntInRange';
import { pointRandomWalk  } from '../../point-random-walk';
import { CircleService    } from '../../../services/circle-service';

@Directive({
  selector: '[pic-svg]'
})
export class PicSvgDirective implements OnInit, OnChanges
{
  /**
   * @type {number} strokeWidth Line stroke width for drawing circles
   */
  @Input()
  public strokeWidth: number;

  /**
   * @type {string} strokeColor Stroke color, i.e. '0xff0000'
   */
  @Input()
  public strokeColor: string;

  @Output()
  public onIntersect: EventEmitter<string>;

  protected _surface: SVG.Doc;                   // SVG Doc that serves as a Canvas

  protected _circleRefs: Array<TSMT$Circle>;
  protected _identified: Array<TSMT$Circle>;     // circles identified as overlapping the test point
  protected _identifiedDO: Array<SVG.Circle>;    // corresponding SVG Circle

  // DOM container dimensions in pixels
  protected _width: number;
  protected _height: number;

  protected _allCircles: SVG.Container;          // Container for all the circles in the simulation
  protected _circleDO: Array<SVG.Circle>;        // individual 'display objects' or SVG Circles
  protected _pointDO: SVG.Container;             // Container for the circle to visualize the current point location

  protected _px: number;                         // x-coordinate of point location
  protected _py: number;                         // y-coordinate of point location

  constructor(protected _elementRef: ElementRef)
  {
    this.strokeWidth = 2;
    this.strokeColor = '#ff0000';

    this._width  = 0;
    this._height = 0;
    this._px     = 0;
    this._py     = 0;

    this._identified   = new Array<TSMT$Circle>();
    this._circleRefs   = new Array<TSMT$Circle>();
    this._circleDO     = new Array<SVG.Circle>();
    this._identifiedDO = new Array<SVG.Circle>();

    this.onIntersect = new EventEmitter<string>();
  }

  public ngOnInit(): void
  {
    // initialize the SVG surface and get prepped for drawing
    this._width  = this._elementRef.nativeElement.clientWidth;
    this._height = this._elementRef.nativeElement.clientHeight;

    this._surface    = SVG(this._elementRef.nativeElement).size('100%', '100%').viewbox(0, 0, this._width, this._height);
    this._pointDO    = this._surface.nested();
    this._allCircles = this._surface.nested();

    this._px = Math.round(0.5*this._width);
    this._py = Math.round(0.5*this._height);

    this.__initCircles();
  }

  public ngOnChanges(changes: SimpleChanges): void
  {
    let prop: string;
    let change: SimpleChange;

    for (prop in changes)
    {
      change = changes[prop];

      // add as much property validation as desired
      switch (prop)
      {
        case 'strokeWidth':
          const w: number  = change.currentValue;
          this.strokeWidth = !isNaN(w) && w > 0 ? w : this.strokeWidth;
          break;

        case 'strokeColor':
          const c: string  = change.currentValue;
          this.strokeColor = c !== undefined ? c : this.strokeColor;
          break;
      }
    }
  }

  /**
   * Advance the simulation a single step
   */
  public next(): void
  {
    let circ: TSMT$Circle;
    let c: SVG.Circle;

    //redraw any circles previously marked as containing the point with the default stroke color
    while (this._identifiedDO.length > 0)
    {
      c    = this._identifiedDO.pop();
      circ = this._identified.pop();

      c.fill({color: '#ffffff', opacity: 0.25}).style({stroke: this.strokeColor, 'stroke-width': this.strokeWidth});
    }

    /*
     random walk the point (realize that it could eventually 'walk' off the visible area; whether or not
     that is something that should be tested and compensated for is up to you
    */
    [this._px, this._py] = pointRandomWalk(this._px, this._px, CircleService.LOW_RADIUS, CircleService.HIGH_RADIUS);

    // draw the point
    this.__drawPoint();

    // A certain (approximate) percentage of the circles are allowed to move
    let i: number;
    let x: number;
    let y: number;

    for (i = 0; i < CircleService.NUM_CIRCLES; ++i)
    {
      if (Math.random() <= 0.2)
      {
        c    = this._circleDO[i];
        circ = this._circleRefs[i];

        // re-use function to random-walk the circle with different bounds
        [x, y] = pointRandomWalk(circ.x, circ.y, CircleService.LOW_R, CircleService.HIGH_R);

        c.center(x, y);
        circ.x = x;
        circ.y = y;
      }
    }

    // check each circle - check is optimized to find false quickly
    for (i = 0; i < CircleService.NUM_CIRCLES; ++i)
    {
      circ = this._circleRefs[i];
      c    = this._circleDO[i];

      if (TSMT$PointInCircle(this._px, this._py, circ.x, circ.y, circ.radius))
      {
        this._identified.push(circ);
        this._identifiedDO.push(c);

        c.fill({color: '#ffffff', opacity: 0.25}).style({stroke: '#ff0000', 'stroke-width': this.strokeWidth});

        this.onIntersect.emit(circ.id);
      }
    }
  }

  protected __initCircles(): void
  {
    // Draw the circles at pseudo-random locations around the drawing area
    const xHigh: number = (this._width - CircleService.MAX_RADIUS) + 0.499;
    const yHigh: number = (this._height - CircleService.MAX_RADIUS) + 0.499;

    let i: number;
    let x: number;
    let y: number;
    let r: number;
    let c: TSMT$Circle;
    let svgCircle: SVG.Circle;

    for (i = 0; i < CircleService.NUM_CIRCLES; ++i)
    {
      x = RandomIntInRange.generateInRange(CircleService.MAX_RADIUS, xHigh);
      y = RandomIntInRange.generateInRange(CircleService.MAX_RADIUS, yHigh);
      r = RandomIntInRange.generateInRange(CircleService.MIN_RADIUS, CircleService.MAX_RADIUS);
      c = new TSMT$Circle();

      svgCircle = this._allCircles.circle(2*r);
      svgCircle.center(x, y).fill({color: '#ffffff', opacity: 0.25}).style({
        stroke: this.strokeColor,
        'stroke-width': this.strokeWidth
      });

      c.x      = x;
      c.y      = y;
      c.radius = r;
      c.id     = i.toString();

      this._circleRefs.push(c);
      this._circleDO.push(svgCircle);
    }

    // Draw the point
    this.__drawPoint();
  }

  protected __drawPoint(): void
  {
    this._pointDO.clear();
    this._pointDO.circle(6).center(this._px, this._py).fill('#ff0000');
  }
}
