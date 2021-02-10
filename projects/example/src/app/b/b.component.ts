import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-b',
  templateUrl: './b.component.html',
  styleUrls: ['./b.component.scss']
})
export class BComponent implements OnInit {
  isEnable = true;
  title = 'B';
  targetElement: Element;

  constructor() { }

  ngOnInit(): void {
    this.targetElement = document.querySelector('html');
  }

  alert(msg: string) {
    alert(msg);
  }

  myRefreshEvent(event: Subject<any>, message: string) {
    setTimeout(() => {
      alert(message);
      event.next();
    }, 60000);
  }
}
