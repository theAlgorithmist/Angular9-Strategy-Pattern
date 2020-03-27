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
 * Main app component for the point-in-circles simulation.  Two different algorithms and different render
 * targets (Canvas and SVG) are used by two components that implement a specific interface.  Selection of
 * which Component to target is made at runtime.  The chosen component is lazy-loaded.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import {
  Component, ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  Injector,
  OnInit,
  OnDestroy,
  SimpleChange,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { ALGORITHM_ID } from './tokens';

import { IPointInCircle } from './shared/interfaces/pic-component';

import {
  Subject,
  timer
} from 'rxjs';

import {
  map,
  takeUntil
} from 'rxjs/operators';

enum RenderTargetEnum
{
  CANVAS = 'Canvas',
  SVG    = 'SVG',
  NONE   = 'None'
}

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',

  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy
{
  public render: string;               // what strategy is being rendered?

  public intersections: number;        // how many total intersections?

  private destroy$ = new Subject();    // subscription cleanup

  // Reference to view container for lazy-loaded component
  @ViewChild('picContainer', {static: true, read: ViewContainerRef})
  private picContainer: ViewContainerRef;

  // Reference to point-in-circle component instance
  private ComponentInstance: ComponentRef<IPointInCircle>;

  // Termination criteria for a simulation - number of time steps - and delta between steps (in msec)
  private _duration: number;
  private _delta: number;
  private _currentStep: number;

  constructor(@Inject(ALGORITHM_ID) public algorithm: number,
              private _compFactoryResolver: ComponentFactoryResolver,
              private _injector: Injector)
  {
    this.render = RenderTargetEnum.CANVAS;

    this.ComponentInstance = null;

    this._duration     = 1000;
    this._delta        = 500;
    this._currentStep  = 0;
    this.intersections = 0;
  }

  public ngOnInit(): void
  {
    this.__initSimulation();
  }

  public ngOnDestroy(): void
  {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async __initSimulation(): Promise<any>
  {
    await this.__loadComponent();

    if (this.ComponentInstance)
    {
      // on every intersection
      this.ComponentInstance.instance.intersect$.subscribe( (id: string) => this.__updateIntersection(id) );

      // begin simulation
      timer(100, this._delta)
        .pipe(
          map( (msec: number): void => {
            this._currentStep++;

            if (this._currentStep > this._duration) {
              this.destroy$.next();
              this.destroy$.complete();
            }
          }),
          takeUntil(this.destroy$)
        )
      .subscribe( () => {
        this.ComponentInstance.instance.ngOnChanges({
          step: new SimpleChange(this._currentStep-1, this._currentStep, this._currentStep === 1)
        });

        // run the next simulation step
        this.ComponentInstance.instance.next();
      });
    }
  }

  private async __loadComponent(): Promise<any>
  {
    let factory: ComponentFactory<IPointInCircle>;

    if (this.picContainer) {
      this.picContainer.clear();
    }

    // lazy-load the required component based on the algorithm id
    switch (this.algorithm)
    {
      case 1:
        const {Pic1Component}  = await import('./components/point-in-circle-1/pic-1.component');
        factory                = this._compFactoryResolver.resolveComponentFactory(Pic1Component);
        this.ComponentInstance = this.picContainer.createComponent(factory, null, this._injector);

        this.render = RenderTargetEnum.CANVAS;
        break;

      case 2:
        const {Pic2Component}  = await import('./components/point-in-circle-2/pic-2.component');
        factory                = this._compFactoryResolver.resolveComponentFactory(Pic2Component);
        this.ComponentInstance = this.picContainer.createComponent(factory, null, this._injector);

        this.render = RenderTargetEnum.SVG;
        break;
    }
  }

  private __updateIntersection(id: string): void
  {
    // id may be used in the future; for now, update the count
    this.intersections++;
  }
}
