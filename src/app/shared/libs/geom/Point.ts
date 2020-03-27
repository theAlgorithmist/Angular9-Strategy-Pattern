/* copyright (c) 2012, Jim Armstrong.  All Rights Reserved.
 * 
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * This software may be modified for commercial use as long as the above copyright notice remains intact.
 */

/**
 * A simple Point class that can be used in a variety of applications requiring 2D (x,y) coordinates
 * (no computations are modified to handle potential overflow or underflow).  Lazy validation is used
 * so that l-2 norm, for example, is only recomputed when one of the coordinates changes.  This may also
 * be used as a vector class.
 * 
 * @author Jim Armstrong (www.algorithmist.net)
 * 
 * @version 1.0
 */

 export class TSMT$Point
 {
   protected _x: number;
   protected _y: number;
   protected _invalidated: boolean;
   protected _norm: number;

   constructor(x: number=0, y: number=0)
   {
     this._x           = x;
     this._y           = y;
     this._invalidated = true;
     this._norm        = this.length();
   }

  /**
   * Return a copy of the current Point
   */
   public clone(): TSMT$Point
   {
     return new TSMT$Point(this._x, this._y);
   }
  
  /**
   * Access the current x-coordinate
   */
   public get x(): number
   {
     return this._x;
   }
  
  /**
   * Set the current x-coordinate
   * 
   * @param {number} value x-coordinate value
   */
   public set x(value: number)
   {
     this._x = this.__assign(value);
     this._invalidated = true;  
   }
    
   // just in case   
   private __assign(value: any): number
   {
     switch (typeof value)
     {
       case "number":
         return !isNaN(value) && isFinite(value) ? value : 0;
          
       case "string":
         let t: number = parseFloat(value);
         return !isNaN(t) ? t : 0;
          
       case "boolean":
         return value ? 0 : 1;
     }
        
     return value as number;
   }
  
  /**
   * Access the current y-coordinate
   */
   public get y(): number
   {
     return this._y;
   }
  
  /**
   * Assign the current y-coordinate
   * 
   * @param {number} y y-coordinate value
   */
   public set y(value: number)
   {
     this._y = this.__assign(value);
     this._invalidated = true;
   }

  /**
   * Return the Euclidean length or l-2 norm of the Point
   */
   public length(): number
   {
     if (this._invalidated)
 	   {
	     this._norm        = Math.sqrt(this._x*this._x + this._y*this._y);
	     this._invalidated = false;
	   }
	
	   return this._norm;
   }

  /**
   * Return the l-1 norm of the Point (interpreted as a vector in 2D space)
   */
   public l1Norm(): number
   {
     return Math.abs(this._x) + Math.abs(this._y);
   }

  /**
   * Return the l-infinity norm of the Point (interpreted as a vector in 2D space)
   */
   public lInfNorm(): number
   {
     const absX = Math.abs(this._x);
     const absY = Math.abs(this._y);
	
     return Math.max( absX, absY );
   }

  /**
   * Return the Euclidean distance between the current Point and an input Point
   * 
   * @param {TSMT$Point} point Input Point
   * 
   * @returns {number} Euclidean distance between the current and input Point
   */
   public distance(point: TSMT$Point): number
   {
     const dx = point.x - this._x;
     const dy = point.y - this._y;

     return Math.sqrt(dx*dx + dy*dy); 
   }

  /**
   * Compute dot or inner product of the current Point and another Point (both Points interpreted as vectors with
   * the origin as initial points)
   * 
   * @param {TSMT$Point} point Input Point
   */
   public dot(point: TSMT$Point): number
   {
     return this._x*point.x + this._y*point.y;
   }

  /**
   * Cross or outer product of the current Point and another Point (both Points interpreted as vectors with the origin
   * as initial points); mathematically, the output is a vector that is normal to the two input vectors whose direction
   * is computed via the right-hand rule.  This method returns the magnitude of that vector.
   * 
   * @param {TSMT$Point} point Input Point
   */
   public cross(point: TSMT$Point): number
   {
     return this._x*point.y - this._y*point.x;
   }

  /**
   * Return a {string} representation of the current Point, "(x, y)" where 'x' and 'y' are replaced by the
   * x- and y-coordinates (at full precision)
   */
   public toString(): string
   {
     const s1: string = this._x.toString();
     const s2: string = this._y.toString();

     return "(" + s1 + " , " + s2 + ")";
   }
 }
