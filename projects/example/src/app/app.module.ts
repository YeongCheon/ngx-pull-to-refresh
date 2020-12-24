import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxPullToRefreshModule } from 'projects/ngx-pull-to-refresh/src/lib/ngx-pull-to-refresh.module';
import { AComponent } from './a/a.component';
import { BComponent } from './b/b.component';

const routes: Routes = [
  // { path: '', loadChildren: `./main/main.module#MainModule` },
  { path: 'a', component: AComponent },
  { path: 'b', component: BComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    AComponent,
    BComponent
  ],
  imports: [
    RouterModule.forRoot(routes, {
    }),
    BrowserModule,
    NgxPullToRefreshModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
