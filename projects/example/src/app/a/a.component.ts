import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxPullToRefreshComponent } from '../../../../ngx-pull-to-refresh/src/lib/ngx-pull-to-refresh.component';

@Component({
    selector: 'app-a',
    templateUrl: './a.component.html',
    styleUrls: ['./a.component.scss'],
    imports: [NgxPullToRefreshComponent]
})
export class AComponent implements OnInit {
  isEnable = true;
  title = 'A';
  targetElement?: Element | null;

  ngOnInit(): void {
    this.targetElement = document.querySelector('html');
  }

  alert(msg: string): void {
    alert(msg);
  }

  myRefreshEvent(event: Subject<void>, message: string): void {
    setTimeout(() => {
      alert(message);
      event.next();
    }, 3000);
  }
}
