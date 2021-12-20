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
  targetElement?: Element | null;

  ngOnInit(): void {
    this.targetElement = document.querySelector('html');
  }

  alert(msg: string): void {
    alert(msg);
  }

  myRefreshEvent(event: Subject<any>, message: string): void {
    setTimeout(() => {
      alert(message);
      event.next();
    }, 3000);
  }
}
