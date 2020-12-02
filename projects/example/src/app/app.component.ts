import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isEnable = true;
  title = 'example';
  targetElement: Element;

  ngOnInit() {
    this.targetElement = document.querySelector('html');
  }

  myRefreshEvent(event: Subject<any>, message: string) {
    setTimeout(() => {
      alert(message);
      event.next();
    }, 3000);
  }

  alert(message: string) {
    alert(message);
  }
}
