import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

function toFit(
  cb,
  { dismissCondition = () => false, triggerCondition = () => true }
) {
  if (!cb) {
    throw Error('Invalid required arguments')
  }

  let tick = false

  return function(e) {
    if (tick) {
      return
    }

    tick = true
    return requestAnimationFrame(() => {
      if (dismissCondition()) {
        tick = false
        return
      }

      if (triggerCondition()) {
        tick = false
        return cb(e)
      }
    })
  }
}

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
  private lastScrollTop = 0;
  @ViewChild('wrapper', { static: true })
  private wrapperElement: ElementRef;
  @ViewChild('loadingContainer')
  private loadingbar: ElementRef;
  @ViewChild('circle')
  private circleSvgElement: ElementRef;

  private touchStartScreenY = 0;

  private readonly CIRCLE_OFFSET = 187;
  @Input()
  private readonly distanceForRefresh = 40;
  private readonly LOADINGBAR_DISPLAY_STYLE = 'flex';

  scrollPullPercent = 20;
  isPlayingAnimation = false;

  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  refreshCompleteSubject = new Subject();
  @Output() loadMore: EventEmitter<any> = new EventEmitter<any>();

  private ele: Element;

  touchstartEvent = toFit(
    (evt: any) => { this.onTouchStart(evt) },
    {
      dismissCondition: () => { return false },
      triggerCondition: () => { return true },
    })

  touchmoveEvent = toFit(
    (evt: any) => {
      this.onTouchMove(evt);
    },
    {
      dismissCondition: () => { return false },
      triggerCondition: () => { return true },
    });

  scrollEvent = toFit(
    (evt: any) => { this.onScroll(evt); },
    {
      dismissCondition: () => { return false },
      triggerCondition: () => { return true },
    });

  touchendEvent = toFit(
    (evt: any) => { this.onMouseup(evt); },
    {
      dismissCondition: () => { return false },
      triggerCondition: () => { return true },
    });

  constructor() {
  }

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
  }

  ngOnDestroy() {
    this.removeEventListener();
  }

  onTouchMove($event: any): void {
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
    const moveYDistance: number = this.touchStartScreenY - $event.touches[0].screenY;
    const scrollY = this.ele.scrollTop;
    if (scrollY <= 0 && this.lastScrollTop <= 0) {
      this.isScrollTop = true;
    } else {
      this.isScrollTop = false;
    }

    if (this.isScrollTop && moveYDistance <= this.distanceForRefresh * -1) {
      this.isRefresh = true;
    } else {
      this.isRefresh = false;
    }

    this.lastScrollTop = scrollY;

    this.moveWrapper(moveYDistance * -1);

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

    this.isRefresh = false;
    this.touchStartScreenY = $event.touches[0].screenY;
  }

  onMouseup($event: any): void {
    let isContainWrapper = false;

    const path = this.getParentElementList($event.srcElement);
    path?.forEach((item: any) => {
      if (item === this.wrapperElement.nativeElement) {
        isContainWrapper = true;
      }
    });

    if (!isContainWrapper) {
      // this.restoreLoadingbar();
      return;
    } else if (!this._isEnable) {
      // this.restoreLoadingbar();
      return;
    }

    if (this.isRefresh && document.contains(this.wrapperElement.nativeElement)) {
      this.refreshFunction();
    } else {
      // this.restoreWrapper();
      this.restoreLoadingbar();
    }
  }

  moveWrapper(offsetY: number): void {
    const loadingbar: HTMLElement = this.loadingbar.nativeElement;

    let loadingbarY: number = offsetY;
    if (offsetY >= this.distanceForRefresh) {
      loadingbarY = this.distanceForRefresh;
    }


    if (this.isScrollTop && offsetY >= 0) {
      loadingbar.style.display = this.LOADINGBAR_DISPLAY_STYLE;
      loadingbar.style.top = loadingbarY.toString() + 'px';
      this.scrollPullPercent = (loadingbarY / this.distanceForRefresh) * 100;
    }
  }

  restoreWrapper(): void {
    const wrapper: HTMLElement = this.wrapperElement.nativeElement;
    const loadingbar: HTMLElement = this.loadingbar.nativeElement;

    wrapper.style.marginTop = '0px';
    loadingbar.style.display = 'none';
  }

  restoreLoadingbar(): void {
    const loadingbar: HTMLElement = this.loadingbar.nativeElement;
    loadingbar.style.display = 'none';

    this.scrollPullPercent = 0;
    this.drawCircle(this.scrollPullPercent);
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
    this.circleSvgElement.nativeElement.style.strokeDashoffset = offset;
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
    this.ele?.addEventListener('touchstart', this.touchstartEvent, { passive: true });
    this.ele?.addEventListener('touchmove', this.touchmoveEvent, { passive: true });

    let scrollTarget: any;
    if (this.ele?.tagName == 'HTML') {
      scrollTarget = window;
    } else {
      scrollTarget = this.ele;
    }

    scrollTarget?.addEventListener('scroll', this.scrollEvent, { passive: true });
    this.ele?.addEventListener('touchend', this.touchendEvent, { passive: true });


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
