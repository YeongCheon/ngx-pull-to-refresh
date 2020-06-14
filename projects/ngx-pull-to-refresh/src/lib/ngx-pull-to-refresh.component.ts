import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, HostListener, Input } from '@angular/core';

@Component({
  selector: 'ngx-pull-to-refresh',
  templateUrl: './ngx-pull-to-refresh.component.html',
  styleUrls: ['./ngx-pull-to-refresh.component.scss']
})
export class NgxPullToRefreshComponent implements OnInit {
  @Input()
  spinnerColor = 'red';
  spinnerBackgroundColor = '#bdc3c7';

  private isRefresh = false;
  private isScrollTop = false;
  private isOnScrollBottom = false;
  private lastScrollTop = 0;
  @ViewChild('wrapper')
  private wrapperElement: ElementRef;
  @ViewChild('loadingContainer')
  private loadingbar: ElementRef;
  @ViewChild('spinner')
  private spinnerElement: ElementRef;
  @ViewChild('circle')
  private circleSvgElement: ElementRef;

  private touchStartScreenY = 0;

  private readonly CIRCLE_OFFSET = 187;
  private readonly DISTANCE_FOR_REFRESH = 40;
  private readonly LOADINGBAR_DISPLAY_STYLE = 'flex';

  loadingMode = 'determinate'; // indeterminate | determinate
  scrollPullPercent = 20;
  isPlayingAnimation = false;

  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadMore: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove($event): void {
    const moveYDistance: number = this.touchStartScreenY - $event.touches[0].screenY;
    if (window.scrollY <= 0 && this.lastScrollTop <= 0) {
      this.isScrollTop = true;
    } else {
      this.isScrollTop = false;
    }

    if (this.isScrollTop && moveYDistance <= this.DISTANCE_FOR_REFRESH * -1) {
      this.isRefresh = true;
    } else {
      this.isRefresh = false;
    }

    this.lastScrollTop = window.scrollY;

    this.moveWrapper(moveYDistance * -1);

    this.drawCircle(this.scrollPullPercent);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll($event): void {
    this.isOnScrollBottom = window.scrollY >= 0 &&
      (window.scrollY + window.innerHeight) >= document.scrollingElement.scrollHeight * 0.9;


    if (this.isOnScrollBottom &&
      this.loadMoreFunction &&
      document.contains(this.wrapperElement.nativeElement)) {
      this.loadMoreFunction();
    }
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart($event): void {
    this.isRefresh = false;
    this.touchStartScreenY = $event.touches[0].screenY;
  }

  @HostListener('window:touchend', ['$event'])
  onMouseup($event): void {
    if (this.isRefresh && document.contains(this.wrapperElement.nativeElement)) {
      this.refreshFunction();
    } else {
      this.restoreLoadingbar();
    }

    this.restoreWrapper();
  }

  moveWrapper(offsetY: number): void {
    const wrapper: HTMLElement = this.wrapperElement.nativeElement;
    const loadingbar: HTMLElement = this.loadingbar.nativeElement;

    let loadingbarY: number = offsetY;
    if (offsetY >= this.DISTANCE_FOR_REFRESH) {
      loadingbarY = this.DISTANCE_FOR_REFRESH;
    }

    if (this.isScrollTop && offsetY >= 0) {
      loadingbar.style.display = this.LOADINGBAR_DISPLAY_STYLE;
      loadingbar.style.top = loadingbarY.toString() + 'px';
      this.scrollPullPercent = (loadingbarY / this.DISTANCE_FOR_REFRESH) * 100;
    }
  }

  restoreWrapper(): void {
    const wrapper: HTMLElement = this.wrapperElement.nativeElement;
    const loadingbar: HTMLElement = this.loadingbar.nativeElement;

    wrapper.style.marginTop = '0px';
    // loadingbar.style.display = 'none';
  }

  restoreLoadingbar(): void {
    const loadingbar: HTMLElement = this.loadingbar.nativeElement;
    // const loadingIcon: HTMLElement = this.loadingIcon.nativeElement;
    loadingbar.style.display = 'none';
    loadingbar.style.top = '-20px';

    this.loadingMode = 'determinate';
    this.loadingbar.nativeElement.querySelector('.pie-wrapper').classList.remove('rotating');
    this.scrollPullPercent = 0;
    this.drawCircle(this.scrollPullPercent);
  }

  refreshFunction(): void {
    this.isPlayingAnimation = true;

    this.refresh.asObservable().subscribe(() => {
      // this.restoreLoadingbar();
    });

    this.refresh.emit(true);
  }

  loadMoreFunction(): void {
    this.loadMore.emit(true);
  }

  private drawCircle(percentage: number) {
    const offset = this.CIRCLE_OFFSET - (this.CIRCLE_OFFSET * (Math.abs(percentage) / 100));
    this.circleSvgElement.nativeElement.style.strokeDashoffset = offset;
  }
}
