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
 * A very simple service for point-in-circle simulations to load parameter values
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
import {
  Injectable
} from '@angular/core';

@Injectable()
export class CircleService
{
  // circle generation
  public static readonly NUM_CIRCLES: number = 100;
  public static readonly MIN_RADIUS: number  = 8;
  public static readonly MAX_RADIUS: number  = 20;

  // point random walk
  public static readonly LOW_RADIUS: number  = 3;
  public static readonly HIGH_RADIUS: number = 15;

  // circle random walk
  public static readonly LOW_R: number  = 5;
  public static readonly HIGH_R: number = 10;

  constructor()
  {
    // class currently has only readonly properties, but could be expanded to expose an API, so left as-is for
    // demonstration purposes
  }
}
