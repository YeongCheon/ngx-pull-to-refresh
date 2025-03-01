import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxPullToRefreshComponent } from 'projects/ngx-pull-to-refresh/src/lib/ngx-pull-to-refresh.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterModule, NgxPullToRefreshComponent]
})
export class AppComponent implements OnInit {
  isEnable = true;
  title = 'example';
  targetElement?: Element | null;

  items = new Array(100);

  ngOnInit(): void {
    this.targetElement = document.querySelector('html');
  }

  myRefreshEvent(event: Subject<void>, message: string): void {
    setTimeout(() => {
      alert(message);
      event.next();
    }, 3000);
  }

  alert(message: string): void {
    alert(message);
  }
}
