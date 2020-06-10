import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxPullToRefreshModule } from 'projects/ngx-pull-to-refresh/src/lib/ngx-pull-to-refresh.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxPullToRefreshModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
