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
 * Attribute directive to imbue a container such as a DIV with a Canvas into which circles and
 * a point are rendered for one strategy in the point-in-circle demonstration.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import * as PIXI from 'pixi.js/dist/pixi.js';

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';

import { TSMT$Circle } from '../../circle';

import { CircleService } from '../../../services/circle-service';

import { canvasRenderCircle } from '../render-circle-canvas';
import { pointRandomWalk    } from '../../point-random-walk';
import { TSMT$PointInCircle } from '../../circle-util-functions';
import { TSMT$getQuadrant   } from '../../geom-util-functions';
import { RandomIntInRange   } from '../../random/RandomIntInRange';

@Directive({
  selector: '[pic-canvas]'
})
export class PicCanvasDirective implements OnInit, OnChanges
{
  /**
   * @type {number} strokeWidth Line stroke width for drawing circles
   */
  @Input()
  public strokeWidth: number;

  /**
   * @type {number} strokeColor Line stroke color for drawing circles
   */
  @Input()
  public strokeColor: string | number;

  /**
   * @type {number} gridColor Line stroke color for drawing quadrants or primitive grid
   */
  @Input()
  public gridColor: string | number;

  @Output()
  public onIntersect: EventEmitter<string>;

  // static PIXI options
  protected static OPTIONS: Object = {
    backgroundColor: 0xeeeeee,
    antialias: true
  };

  protected _domContainer: HTMLDivElement;        // DOM container for freehand strokes (DIV)
  protected _rect: ClientRect | DOMRect;

  // container of all circles (display objects)
  protected _circles: PIXI.Container;

  // corresponding list of all TSMT Circle references and display objects (graphic contexts)
  protected _circleRefs: Array<TSMT$Circle>;
  protected _circleDO: Array<PIXI.Graphics>;

  // draw quadrant boundaries
  protected _quadrants: PIXI.Graphics;

  // PIXI app and stage references
  protected _app: PIXI.Application;
  protected _stage: PIXI.Container;
  protected _width: number;
  protected _height: number;

  // Simulation
  protected _identified: Array<TSMT$Circle>;     // circles identified as overlapping the test point
  protected _identifiedDO: Array<PIXI.Graphics>; // corresponding graphics contexts
  protected _pointDO: PIXI.Graphics;             // graphics context for point
  protected _px: number;                         // x-coordinate of point location
  protected _py: number;                         // y-coordinate of point location
  protected _curQuad: number;                    // current quadrant number (zero for no quadrant assigned)
  protected _prevQuad: number;                   // previous quadrant number
  protected _check: Array<string>                // circle id's in a quad to check

  // Map circles to quadrants - a very primitive quad-map for the space
  protected _quad1: Record<string, boolean>;
  protected _quad2: Record<string, boolean>;
  protected _quad3: Record<string, boolean>;
  protected _quad4: Record<string, boolean>;

  constructor(protected _elRef: ElementRef)
  {
    this.strokeColor   = '0x000ff';
    this.gridColor     = '0x00ff00';
    this.strokeWidth   = 2;
    this._curQuad      = 0;
    this._prevQuad     = -1;

    this._domContainer = <HTMLDivElement> this._elRef.nativeElement;
    this._rect         = this._domContainer.getBoundingClientRect();

    this._circles      = new Array<PIXI.Graphics>();
    this._circleDO     = new Array<PIXI.Graphics>();
    this._identifiedDO = new Array<PIXI.Graphics>();
    this._identified   = new Array<TSMT$Circle>();
    this._circleRefs   = new Array<TSMT$Circle>();

    this._quad1 = {};
    this._quad2 = {};
    this._quad3 = {};
    this._quad4 = {};

    this.onIntersect = new EventEmitter<string>();
  }

  public ngOnInit(): void
  {
    this._width  = this._elRef.nativeElement.clientWidth;
    this._height = this._elRef.nativeElement.clientHeight;

    this.__pixiSetup();

    this._px = Math.round(0.5*this._width);
    this._py = Math.round(0.5*this._height);

    // now, we can draw the quadrant lines and initialize the circles
    this.__drawQuadrants();

    this.__initCircles();
  }

  /**
   * Advance the simulation one step
   */
  public next(): void
  {
    let circ: TSMT$Circle;
    let g: PIXI.Graphics;

    // first, redraw any circles previously marked as containing the point with the default stroke color
    while (this._identifiedDO.length > 0)
    {
      g    = this._identifiedDO.pop();
      circ = this._identified.pop();

      canvasRenderCircle(g, circ, this.strokeWidth, this.strokeColor.toString());
    }

    /*
      random walk the point (realize that it could eventually 'walk' off the visible area; whether or not
      that is something that should be tested and compensated for is up to you
     */
    [this._px, this._py] = pointRandomWalk(this._px, this._py, CircleService.LOW_RADIUS, CircleService.HIGH_RADIUS);

    // draw the point and update the quadrant
    this.__drawPoint();

    this._curQuad = TSMT$getQuadrant(this._px, this._py, 0, 0, this._width, this._height);
    this.__drawQuadrants();

    // Only check circles in the quad in which the point is located
    if (this._curQuad > 0 && this._curQuad < 5)
    {
      // only update the id list if the quadrant changed
      if (this._curQuad != this._prevQuad)
      {
        this._prevQuad = this._curQuad;
        this._check    = Object.keys(this[`_quad${this._curQuad}`]);
      }

      this._check.forEach( (id: string): void =>
      {
        circ = this._circleRefs[+id];
        g    = this._circleDO[+id];

        if (TSMT$PointInCircle(this._px, this._py, circ.x, circ.y, circ.radius))
        {
          this._identified.push(circ);
          this._identifiedDO.push(g);

          g.clear();
          g.lineStyle(this.strokeWidth, '0xff0000');
          g.drawCircle(circ.x, circ.y, circ.radius);

          this.onIntersect.emit(id);
        }
      });
    }
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
          const c: number  = +change.currentValue;
          this.strokeColor = c !== undefined && !isNaN(c) ? c : this.strokeColor;
          break;

        case 'gridColor':
          const color: number = +change.currentValue;
          this.gridColor      = color !== undefined && !isNaN(color) ? color : this.gridColor;
          break;
      }
    }
  }

  protected __pixiSetup(): void
  {
    const options = Object.assign({width: this._width, height: this._height}, PicCanvasDirective.OPTIONS);

    this._app = new PIXI.Application(options);

    this._domContainer.appendChild(this._app.view);

    this._stage   = this._app.stage;
    this._circles = new PIXI.Container();

    this._pointDO = new PIXI.Graphics();
    this._circles.addChild(this._pointDO);

    this._stage.addChild(this._circles);

    this._quadrants = new PIXI.Graphics();
    this._stage.addChild(this._quadrants);
  }

  // highlight the point's current quadrant in green
  protected __drawQuadrants(): void
  {
    this._quadrants.clear();

    const hx: number = Math.round(0.5*this._width);
    const hy: number = Math.round(0.5*this._height);

    switch (this._curQuad)
    {
      case 0:
        this._quadrants.lineStyle(2, 0xff0000, 1);
        this._quadrants.moveTo(hx, 0);
        this._quadrants.lineTo(hx, this._height);

        this._quadrants.moveTo(0, hy);
        this._quadrants.lineTo(this._width, hy);
        break;

      case 1:
        this._quadrants.lineStyle(2, 0x009d00, 1);
        this._quadrants.moveTo(hx, 0);
        this._quadrants.lineTo(hx, hy);
        this._quadrants.lineTo(this._width,hy);

        this._quadrants.lineStyle(2, 0xff0000, 1);
        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(0, hy);

        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(hx, this._height);
        break;

      case 2:
        this._quadrants.lineStyle(2, 0xff0000, 1);
        this._quadrants.moveTo(hx, 0);
        this._quadrants.lineTo(hx, hy);
        this._quadrants.lineTo(0, hy);

        this._quadrants.lineStyle(2, 0x009d00, 1);
        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(this._width, hy);

        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(hx, this._height);
        break;

      case 3:
        this._quadrants.lineStyle(2, 0xff0000, 1);
        this._quadrants.moveTo(hx, 0);
        this._quadrants.lineTo(hx, hy);
        this._quadrants.lineTo(this._width, hy);

        this._quadrants.lineStyle(2, 0x009d00, 1);
        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(hx, this._height);

        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(0, hy);
        break;

      case 4:
        this._quadrants.lineStyle(2, 0xff0000, 1);
        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(this._width, hy);

        this._quadrants.moveTo(hx, hy);
        this._quadrants.lineTo(hx, this._height);

        this._quadrants.lineStyle(2, 0x009d00, 1);
        this._quadrants.moveTo(hx, 0);
        this._quadrants.lineTo(hx, hy);
        this._quadrants.lineTo(0, hy);
        break;
    }
  }

  protected __initCircles(): void
  {
    // Draw the point
    this.__drawPoint();

    // Draw the circles at pseudo-random locations around the drawing area
    const xHigh: number = (this._width - CircleService.MAX_RADIUS) + 0.499;
    const yHigh: number = (this._height - CircleService.MAX_RADIUS) + 0.499;

    let i: number;
    let x: number;
    let y: number;
    let r: number;
    let g: PIXI.Graphics;
    let c: TSMT$Circle;

    for (i = 0; i < CircleService.NUM_CIRCLES; ++i)
    {
      x = RandomIntInRange.generateInRange(CircleService.MAX_RADIUS, xHigh);
      y = RandomIntInRange.generateInRange(CircleService.MAX_RADIUS, yHigh);
      r = RandomIntInRange.generateInRange(CircleService.MIN_RADIUS, CircleService.MAX_RADIUS);
      g = new PIXI.Graphics();
      c = new TSMT$Circle();

      c.x      = x;
      c.y      = y;
      c.radius = r;
      c.id     = i.toString();   // id needs to double as the index into the master array of circle references

      // update quadrant(s) for the circle; this requires bounds to be set
      c.setBounds(0, 0, this._width, this._height);

      // the keys are what matter here ...
      if (c.inQuadrant(1)) {
        this._quad1[c.id] = true;
      }

      if (c.inQuadrant(2)) {
        this._quad2[c.id] = true;
      }

      if (c.inQuadrant(3)) {
        this._quad3[c.id] = true;
      }

      if (c.inQuadrant(4)) {
        this._quad4[c.id] = true;
      }

      this._circleRefs.push(c);
      this._circleDO.push(g);
      this._circles.addChild(g);

      g.lineStyle(this.strokeWidth, this.strokeColor);
      g.drawCircle(x, y, r);
    }
  }

  protected __drawPoint(): void
  {
    this._pointDO.clear();

    this._pointDO.lineStyle(2, '0x013220');
    this._pointDO.beginFill('0x00aa00');
    this._pointDO.drawCircle(this._px, this._py, 3);
    this._pointDO.endFill();
  }
}
