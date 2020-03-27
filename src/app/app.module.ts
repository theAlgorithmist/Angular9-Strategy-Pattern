import { BrowserModule } from '@angular/platform-browser';
import { NgModule      } from '@angular/core';

import { AppComponent  } from './app.component';
import { CircleService } from './shared/services/circle-service';

// Injectable constants
import { ALGORITHM_ID    } from './tokens';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    CircleService,
    { provide: ALGORITHM_ID, useValue: 1 },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
