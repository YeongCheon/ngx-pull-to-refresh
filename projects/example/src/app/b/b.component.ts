import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxPullToRefreshComponent } from '../../../../ngx-pull-to-refresh/src/lib/ngx-pull-to-refresh.component';

@Component({
    selector: 'app-b',
    templateUrl: './b.component.html',
    styleUrls: ['./b.component.scss'],
    imports: [NgxPullToRefreshComponent]
})
export class BComponent implements OnInit {
  isEnable = true;
  title = 'B';
  targetElement?: Element | null;

  ngOnInit(): void {
    this.targetElement = document.querySelector('html');
  }

  alert(msg: string) {
    alert(msg);
  }

  myRefreshEvent(event: Subject<void>, message: string) {
    setTimeout(() => {
      alert(message);
      event.next();
    }, 60000);
  }
}
