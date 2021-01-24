import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-pull-to-refresh',
  templateUrl: './ngx-pull-to-refresh.component.html',
  styleUrls: ['./ngx-pull-to-refresh.component.scss']
})
export class NgxPullToRefreshComponent implements OnInit, OnDestroy {
  static touchstartEventList = [];
  static touchmoveEventList = [];
  static scrollEventList = [];
  static touchendEventList = [];

  @Input()
  spinnerColor = '#F7C223';
  @Input()
  spinnerSize = '50px';

  _targetElement: Element;
  @Input()
  set targetElement(value: Element) {
    this.removeEventListener();

    this._targetElement = value;
    this.ele = this._targetElement ?? this.wrapperElement.nativeElement;

    if (this._isEnable) {
      this.addEventListener();
    } else {
      this.removeEventListener();
    }
  }
  _isEnable = true;

  @Input()
  set isEnable(value: boolean) {
    this._isEnable = value;

    if (this._isEnable) {
      this.addEventListener();
    } else {
      this.removeEventListener();
    }
  }

  private isRefresh = false;
  private isScrollTop = false;
  private isOnScrollBottom = false;
  @ViewChild('wrapper', { static: true })
  private wrapperElement: ElementRef;
  @ViewChild('loadingContainer')
  private loadingbar: ElementRef<HTMLDivElement>;
  @ViewChild('circle')
  private circleSvgElement: ElementRef<SVGCircleElement>;

  private readonly CIRCLE_OFFSET = 187;
  @Input()
  distanceForRefresh: number = 40;

  scrollPullPercent = 20;
  isPlayingAnimation = false;

  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  refreshCompleteSubject = new Subject();
  @Output() loadMore: EventEmitter<any> = new EventEmitter<any>();

  private ele: Element;

  touchstartEvent = (evt)=>{
    this.onTouchStart(evt);
  }

  touchmoveEvent = (evt: TouchEvent)=>{
    this.onTouchMove(evt);
  };

  scrollEvent = (evt)=>{
    this.onScroll(evt);
  };

  touchendEvent = (evt)=>{
    this.onMouseup(evt);
  }

  constructor() {}

  ngOnInit() {
    this.refreshCompleteSubject.subscribe(() => {
      this.isPlayingAnimation = false;
      this.restoreWrapper();
      this.restoreLoadingbar();
    });

    this.ele = this._targetElement ?? this.wrapperElement.nativeElement;
    if (this._isEnable) {
      this.addEventListener();
    } else {
      this.removeEventListener();
    }

    this.distanceForRefresh = +this.distanceForRefresh;
  }

  ngOnDestroy() {
    this.removeEventListener();
  }

  lastScreenY: number = 0;
  sum: number = 0;
  onTouchMove($event: TouchEvent): void {
    if($event.cancelable) {
      $event.stopPropagation();
      $event.preventDefault();
    }

    if (!this._isEnable) {
      return;
    }

    const currentScreenY = $event.touches[0].screenY;

    // const moveYDistance: number = this.touchStartScreenY - $event.touches[0].screenY;
    const moveYDistance = (this.lastScreenY - currentScreenY) * -1;
    this.lastScreenY = currentScreenY;
    if (scrollY <= 0 && this.sum > 0) {
      this.isScrollTop = true;
    } else {
      this.isScrollTop = false;
    }

    if(!isNaN(moveYDistance)) {
      this.sum += moveYDistance;
    }

    if (this.isScrollTop && this.sum >= this.distanceForRefresh) {
      this.isRefresh = true;
    } else {
      this.isRefresh = false;
    }

    const loadingbar = this.loadingbar.nativeElement;

    if (this.sum >= this.distanceForRefresh && moveYDistance > 0) {
      this.sum = this.distanceForRefresh;
    }

    if (this.isScrollTop && this.sum >= 0) {
      loadingbar.style.visibility = "visible";
      loadingbar.style.transform = `translateY(${this.sum}px)`;
      // loadingbar.style.display = this.LOADINGBAR_DISPLAY_STYLE;
      // loadingbar.style.top = loadingbarY.toString() + 'px';
    } else {
      loadingbar.style.visibility = "hidden";
      // loadingbar.style.display = "none";
    }

    this.scrollPullPercent = (this.sum / this.distanceForRefresh) * 100;
    if(this.scrollPullPercent < 0) {
      this.scrollPullPercent = 0;
    }

    this.drawCircle(this.scrollPullPercent);
  }

  onScroll($event: any): void {
    if (!this._isEnable) {
      return;
    }

    const scrollY = this.ele.scrollTop;
    this.isOnScrollBottom = scrollY >= 0 &&
      this.ele.clientHeight + this.ele.scrollTop >= this.ele.scrollHeight * 0.85;

    if (this.isOnScrollBottom &&
      this.loadMoreFunction &&
      document.contains(this.wrapperElement.nativeElement)) {
      this.loadMoreFunction();
    }
  }

  onTouchStart($event: any): void {
    let isContainWrapper = false;
    const path = this.getParentElementList($event.srcElement);
    path?.forEach((item: any) => {
      if (item === this.wrapperElement.nativeElement) {
        isContainWrapper = true;
      }
    });

    if (!isContainWrapper) {
      return;
    } else if (!this._isEnable) {
      return;
    }

    this.restoreWrapper();
    this.restoreLoadingbar();
    this.isRefresh = false;
    this.lastScreenY = $event.touches[0].screenY;
    this.sum = 0;
  }

  onMouseup($event: Event): void {
    if($event.cancelable) {
      $event.stopPropagation();
      $event.preventDefault();
    }

    if (this.isRefresh && document.contains(this.wrapperElement.nativeElement)) {
      this.refreshFunction();
    } else {
      this.restoreWrapper();
      this.restoreLoadingbar();
    }
  }

  restoreWrapper(): void {
    this.loadingbar.nativeElement.style.transform = `translateY(0px)`;
    this.hiddenLoadingbar();
  }

  private hiddenLoadingbar() {
    this.loadingbar.nativeElement.style.visibility = "hidden";
  }

  restoreLoadingbar(): void {
    this.scrollPullPercent = 0;
    this.drawCircle(0);
    this.hiddenLoadingbar();
  }

  refreshFunction(): void {
    this.isPlayingAnimation = true;
    this.refresh.emit(this.refreshCompleteSubject);
  }

  loadMoreFunction(): void {
    this.loadMore.emit(true);
  }

  private drawCircle(percentage: number) {
    const offset = this.CIRCLE_OFFSET - (this.CIRCLE_OFFSET * (Math.abs(percentage) / 100));
    this.circleSvgElement.nativeElement.style.strokeDashoffset = offset+"px";
  }

  private getParentElementList(srcElement: any): any[] {
    const parents = [];
    let elem = srcElement;

    while (elem?.parentElement && elem.parentNode.nodeName.toLowerCase() != 'body') {
      elem = elem.parentElement;
      parents.push(elem);
    }

    return parents;
  }

  private addEventListener() {
    this.ele?.addEventListener('touchstart', this.touchstartEvent, false);
    this.ele?.addEventListener('touchmove', this.touchmoveEvent, false);

    let scrollTarget: any;
    if (this.ele?.tagName == 'HTML') {
      scrollTarget = window;
    } else {
      scrollTarget = this.ele;
    }

    scrollTarget?.addEventListener('scroll', this.scrollEvent, false);
    this.ele?.addEventListener('touchend', this.touchendEvent, false);

    NgxPullToRefreshComponent.touchstartEventList.push(this.touchstartEvent);
    NgxPullToRefreshComponent.touchmoveEventList.push(this.touchmoveEvent);
    NgxPullToRefreshComponent.scrollEventList.push(this.scrollEvent);
    NgxPullToRefreshComponent.touchendEventList.push(this.touchendEvent);
  }

  private removeEventListener() {
    this.ele?.removeEventListener('touchstart', this.touchstartEvent);
    this.ele?.removeEventListener('touchmove', this.touchmoveEvent);
    this.ele?.removeEventListener('scroll', this.scrollEvent);
    this.ele?.removeEventListener('touchend', this.touchendEvent);
  }

  private clearAllEvent() {
    NgxPullToRefreshComponent.touchstartEventList.forEach((evt) => {
      this.ele?.removeEventListener('touchstart', evt);
    });
    NgxPullToRefreshComponent.touchmoveEventList.forEach((evt) => {
      this.ele?.removeEventListener('touchmove', evt);
    });
    NgxPullToRefreshComponent.scrollEventList.forEach((evt) => {
      this.ele?.removeEventListener('scroll', evt);
    });
    NgxPullToRefreshComponent.touchendEventList.forEach((evt) => {
      this.ele?.removeEventListener('touchend', evt);
    });
  }
}
