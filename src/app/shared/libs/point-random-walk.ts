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
 * An approximate (pseudo-random) walk for a given point inside a given rectangular boundary
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */
export function pointRandomWalk(px: number, py: number, low: number, high: number): [number, number]
{
  // compensate for bias at endpoints
  const lowRange: number  = low - 0.499;
  const highRange: number = high + 0.499;

  // random (integer) radius in [low, high]
  const r: number = Math.round( lowRange + Math.random()*(highRange - lowRange) );

  // 'randomly' move x- or y-coordinate inside the circular boundary
  const t: number = Math.random();

  let x: number = px;
  let y: number = py;

  if (t < 0.25)
    x += r;
  else if (t < 0.5)
    x -= r;
  else if (t < 0.75)
    y += r;
  else
    y -= r;

  // note that it is possible for the point to 'walk' outside observable boundaries, so add clipping as an exercise
  return [x, y];
};
