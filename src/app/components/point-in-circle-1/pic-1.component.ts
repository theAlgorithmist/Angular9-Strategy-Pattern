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
 * Implement one Strategy for the point-in-circles problem (using a simple quad-map). This component renders
 * into a Canvas.  In this simulation, there can be any number of circles, but they are in fixed positions
 * for the duration of the simulation.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
import {
  Component,
  Input,
  NgModule,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { IPointInCircle } from '../../shared/interfaces/pic-component';

import { PicCanvasDirective } from '../../shared/libs/render/canvas-render/pic-canvas.directive';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-pic-1',

  templateUrl: './pic-1.component.html',

  styleUrls: ['./pic-1.component.scss']
})
export class Pic1Component implements IPointInCircle, OnChanges
{
  public intersect$: Subject<string>;

  // Step number of the simulation (controlled by the parent - could run forward/backward/restart/etc)
  @Input()
  public step: number;

  // This directive handles all point-in-circle computations and rendering
  @ViewChild(PicCanvasDirective, {static: true})
  protected _picContainer: PicCanvasDirective;

  constructor()
  {
    this.intersect$ = new Subject<string>();
  }

  public ngOnChanges(changes: SimpleChanges): void
  {
    let prop: string;
    let change: SimpleChange;

    for (prop in changes)
    {
      change = changes[prop];

      if (prop === 'step')
      {
        this.step = +change.currentValue;
      }
    }
  }

  /**
   * Run the next step in the simulation
   */
  public next(): void
  {
    if (this._picContainer) {
      this._picContainer.next();
    }
  }

  /**
   * Execute when the point intersects one of the circles during the simulation
   *
   * @param id Circle id
   */
  public onIntersection(id: string): void
  {
    this.intersect$.next(id);
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [
    Pic1Component,
    PicCanvasDirective
  ]
})
class PicCanvasModule {}
