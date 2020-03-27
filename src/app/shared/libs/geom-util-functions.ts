/**
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
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
 * Subset of Typescript Math Toolkit (pure) geometry utility functions
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

/**
 * Return the quadrant number (1, 2, 3, 4) of a point relative to a supplied (rectangular) test region.  Return zero if
 * quadrant can not be determined.
 *
 * @param {number} px x-coordinate of test point
 *
 * @param {number} py y-coordinate of test point
 *
 * @param {number} left x-coordinate of (left,top) corner of test region
 *
 * @param {number} top y-coordinate of (left,top) corner of test region
 *
 * @param {number} right x-coordinate of (right,bottom) corner of test region
 *
 * @param {number} bottom y-coordinate of (right,bottom) corner of test region
 */
export function TSMT$getQuadrant(px: number, py: number, left: number, top: number, right: number, bottom: number): number
{
  const xc: number     = 0.5 * (left + right);
  const yc: number     = 0.5 * (bottom + top);
  const yDown: boolean = top <= bottom;

  const xgt: boolean = px >= xc && px <= right;
  const xlt: boolean = px <= xc && px >= left;

  let yhigh: boolean;
  let ylow: boolean;

  if (yDown)
  {
    yhigh = py <= yc && py >= top;
    ylow  = py >= yc && py <= bottom;
  }
  else
  {
    yhigh = py >= yc && py <= top;
    ylow  = py <= yc && py >= bottom;
  }

  if (xgt && yhigh) {
    return 1;
  }

  if (xgt && ylow) {
    return 2;
  }

  if (xlt && ylow) {
    return 3;
  }

  if (xlt && yhigh) {
    return 4;
  }

  return 0;
}
