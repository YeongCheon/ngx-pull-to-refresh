import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';
import { provideRouter, Routes } from '@angular/router';
import { AComponent } from './app/a/a.component';
import { BComponent } from './app/b/b.component';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

const routes: Routes = [
  // { path: '', loadChildren: `./main/main.module#MainModule` },
  { path: 'a', component: AComponent },
  { path: 'b', component: BComponent },
];

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule),
        provideRouter(routes)
    ]
})
  .catch(err => console.error(err));
