import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-a',
  templateUrl: './a.component.html',
  styleUrls: ['./a.component.scss']
})
export class AComponent implements OnInit {
  isEnable = true;
  title = 'A';
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
    }, 3000);
  }
}
