import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { PullToRefreshModule } from '../../../pull-to-refresh/src/lib/pull-to-refresh.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule, PullToRefreshModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
