import { OnChanges } from '@angular/core';
import { Subject   } from 'rxjs';

/**
 * Minimal API that must be exposed for a point-in-circle simulation
 *
 * @author Jim Armstrong(www.algorithmist.net)
 *
 * @version 1.0
 */
export interface IPointInCircle extends OnChanges
{
  intersect$: Subject<string>;

  next: () => void;

  step: number;
}
