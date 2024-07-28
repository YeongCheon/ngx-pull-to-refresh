import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  effect,
  input,
  output,
  viewChild,
  PLATFORM_ID,
  ElementRef
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'ngx-pull-to-refresh',
  templateUrl: './ngx-pull-to-refresh.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./ngx-pull-to-refresh.component.scss']
})
export class NgxPullToRefreshComponent implements OnInit, OnDestroy {
  static touchstartEventList: any[] = [];
  static touchmoveEventList: any[] = [];
  static scrollEventList: any[] = [];
  static touchendEventList: any[] = [];

  private isServer: boolean;

  private distance = 0;
  private startScreenY = 0;
  private previousX = 0;
  private previousY = 0;

  spinnerColor = input('#F7C223');

  isHorizontal = input(false);

  customClass = input('');

  targetElement = input<Element|null|undefined>(null);
  isEnable = input(true);

  private isRefresh = false;
  private isScrollTop = false;
  private isOnScrollBottom = false;
  private wrapperElement = viewChild.required('wrapper', {read: ElementRef});
  private contentContainer = viewChild.required('contentContainer', {read:ElementRef});
  private loadingbar = viewChild.required('loadingContainer', {read:ElementRef});
  private circleSvgElement = viewChild.required('circle', {read: ElementRef});

  private readonly CIRCLE_OFFSET = 187;
  distanceForRefresh = input(40);
  spinnerSize = input(300);

  scrollPullPercent = 20;
  isPlayingAnimation = false;

  refresh = output<any>();
  refreshCompleteSubject = new Subject();
  loadMore = output<any>();

  private ele!: Element;
  private isContainWrapper = false;

  touchstartEvent = (evt: TouchEvent): void => {
    this.onTouchStart(evt);
  }

  touchmoveEvent = (evt: TouchEvent): void => {
    this.onTouchMove(evt);
  }

  scrollEvent = (evt: Event): void => {
    this.onScroll(evt);
  }

  touchendEvent = (evt: TouchEvent): void => {
    this.onTouchEnd(evt);
  }

  constructor(
    private readonly chagneDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: string
  ) {
    this.isServer = isPlatformServer(this.platformId);

    effect(()=>{
      if (!this.isServer) {
        this.removeEventListener();

        // this._targetElement = value;
        this.ele = this.targetElement() ?? this.wrapperElement().nativeElement;

        if (this.isEnable()) {
        this.addEventListener();
      } else {
        this.removeEventListener();
      }
    }
    });
  }

  ngOnInit(): void {
    if (!this.isServer) {
      this.refreshCompleteSubject.subscribe(() => {
        this.isPlayingAnimation = false;
        this.restoreWrapper();
        this.restoreLoadingbar();
      });

      this.ele = this.targetElement() ?? this.contentContainer().nativeElement;

      if (this.isEnable()) {
        this.addEventListener();
      } else {
        this.removeEventListener();
      }
    }
  }

  ngOnDestroy(): void {
    this.removeEventListener();
    this.refreshCompleteSubject?.complete();
  }

  onTouchMove($event: TouchEvent): void {
    if (this.isPlayingAnimation) {
      return;
    } else if (!this.isEnable()) {
      return;
    } else if (!this.isContainWrapper) {
      return;
    } else if (this.isHorizontal()) {
      return;
    }

    const currentScreenY = $event.touches[0].screenY;

    if (this.ele.scrollTop <= 0 && this.distance > 0) {
      this.isScrollTop = true;
    } else {
      this.isScrollTop = false;
    }

    const loadingbar = this.loadingbar().nativeElement;

    if (this.startScreenY > currentScreenY) {
      this.distance = 0;
    } else {
      this.distance = Math.abs(currentScreenY - this.startScreenY);
    }

    if (this.distance > this.distanceForRefresh()) {
      this.distance = this.distanceForRefresh();
    }
    this.isRefresh = this.isScrollTop && this.distance >= this.distanceForRefresh();

    const contentContainerElement = this.contentContainer().nativeElement;

    if (this.isScrollTop && this.distance >= 0) {
      contentContainerElement.style.transform = `translateY(${this.distance}px)`;

      loadingbar.style.visibility = 'visible';
    } else {
      this.restoreWrapper();
      loadingbar.style.visibility = 'hidden';
    }

    this.scrollPullPercent = (this.distance / this.distanceForRefresh()) * 100;
    this.isRefresh = this.scrollPullPercent >= 100 && this.isScrollTop;

    if (this.scrollPullPercent < 0) {
      this.scrollPullPercent = 0;
    }

    this.drawCircle(this.scrollPullPercent);
  }

  onScroll($event: Event): void {
    if (!this.isEnable()) {
      return;
    }

    const scrollX = this.ele.scrollLeft;
    const scrollY = this.ele.scrollTop;
    if (this.isHorizontal()) {
      this.isOnScrollBottom = scrollX >= 0 &&
        scrollX > this.previousX &&
        this.ele.clientWidth + this.ele.scrollLeft >= this.ele.scrollWidth * 0.85;
    } else {
      this.isOnScrollBottom = scrollY >= 0 &&
        scrollY > this.previousY &&
        this.ele.clientHeight + this.ele.scrollTop >= this.ele.scrollHeight * 0.85;
    }
    this.previousX = scrollX;
    this.previousY = scrollY;

    if (this.isOnScrollBottom &&
      this.loadMoreFunction &&
      document.contains(this.wrapperElement().nativeElement)) {
      this.loadMoreFunction();
    }
  }

  onTouchStart($event: TouchEvent): void {
    this.chagneDetectorRef.detectChanges();
    if (this.isPlayingAnimation) {
      return;
    } else if (this.isHorizontal()) {
      return;
    }
    const path = this.getParentElementList($event.target as HTMLElement); // FIXME 'as'

    this.isContainWrapper = false;
    for (const item of path) {
      if (item === this.wrapperElement().nativeElement) {
        this.isContainWrapper = true;
        break;
      }
    }

    if (!this.isContainWrapper) {
      return;
    } else if (!this.isEnable()) {
      return;
    }

    this.restoreWrapper();
    this.restoreLoadingbar();
    this.isRefresh = false;
    this.startScreenY = $event.touches[0].screenY;
    this.distance = 0;
  }

  onTouchEnd($event: Event): void {
    if (this.isPlayingAnimation) {
      return;
    } else if (!this.isContainWrapper) {
      return;
    } else if (this.isHorizontal()) {
      return;
    }

    if (this.isRefresh && document.contains(this.wrapperElement().nativeElement)) {
      this.refreshFunction();
    } else {
      this.restoreWrapper();
      this.restoreLoadingbar();
    }
  }

  restoreWrapper(): void {
    this.contentContainer().nativeElement.style.position = 'relative';
    this.contentContainer().nativeElement.style.transform = `translateY(0)`;
    // this.loadingbar.nativeElement.style.transform = `translateY(0px)`;
    this.hiddenLoadingbar();
  }

  private hiddenLoadingbar() {
    this.loadingbar().nativeElement.style.visibility = 'hidden';
  }

  restoreLoadingbar(): void {
    this.scrollPullPercent = 0;
    this.drawCircle(0);
    this.loadingbar().nativeElement.style.transform = `translateY(0)`;
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
    this.circleSvgElement().nativeElement.style.strokeDashoffset = `${offset}px`;
  }

  private getParentElementList(srcElement: HTMLElement): HTMLElement[] {
    const parents: HTMLElement[] = [];
    let elem = srcElement;

    while (elem?.parentElement && elem?.parentNode?.nodeName?.toLowerCase() !== 'body') {
      elem = elem.parentElement;
      parents.push(elem);
    }

    return parents;
  }

  private addEventListener(): void {
    this.ele?.addEventListener(
      'touchstart' as (keyof ElementEventMap),
      this.touchstartEvent as any,
      false
    );
    this.ele?.addEventListener(
      'touchmove' as (keyof ElementEventMap),
      this.touchmoveEvent as any,
      false
    );
    this.ele?.addEventListener(
      'touchend' as (keyof ElementEventMap),
      this.touchendEvent as any,
      false
    );

    let scrollTarget: Element | Window;
    if (this.ele?.tagName === 'HTML') {
      scrollTarget = window;
    } else {
      scrollTarget = this.ele;
    }

    scrollTarget?.addEventListener('scroll', this.scrollEvent, false);


    NgxPullToRefreshComponent.touchstartEventList.push(this.touchstartEvent as any);
    NgxPullToRefreshComponent.touchmoveEventList.push(this.touchmoveEvent as any);
    NgxPullToRefreshComponent.scrollEventList.push(this.scrollEvent as any);
    NgxPullToRefreshComponent.touchendEventList.push(this.touchendEvent as any);
  }

  private removeEventListener(): void {
    this.ele?.removeEventListener(
      'touchstart' as (keyof ElementEventMap),
      this.touchstartEvent as any
    );
    this.ele?.removeEventListener(
      'touchmove' as (keyof ElementEventMap),
      this.touchmoveEvent as any
    );
    this.ele?.removeEventListener(
      'scroll' as (keyof ElementEventMap),
      this.scrollEvent as any
    );
    this.ele?.removeEventListener(
      'touchend' as (keyof ElementEventMap),
      this.touchendEvent as any
    );
  }

  private clearAllEvent(): void {
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
