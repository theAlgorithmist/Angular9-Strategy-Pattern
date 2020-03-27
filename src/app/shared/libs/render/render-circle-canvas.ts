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
 * Render a single circle into the supplied (Canvas)graphics context.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 *
 * @version 1.0
 */

import { IGraphics   } from '../../interfaces/graphics';
import { TSMT$Circle } from '../circle';

export function canvasRenderCircle(g: IGraphics, circle: TSMT$Circle, strokeWidth: number, color: string): void
{
  g.clear();
  g.lineStyle(strokeWidth, color);

  g.moveTo(circle.x, circle.y);

  g.drawCircle(circle.x, circle.y, circle.radius);
}
