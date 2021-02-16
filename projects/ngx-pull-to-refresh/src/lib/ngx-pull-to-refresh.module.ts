import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPullToRefreshComponent } from './ngx-pull-to-refresh.component';

@NgModule({
  declarations: [NgxPullToRefreshComponent],
  imports: [
    CommonModule
  ],
  exports: [NgxPullToRefreshComponent]
})
export class NgxPullToRefreshModule { }
