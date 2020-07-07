import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, HostListener, Input } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'ngx-pull-to-refresh',
    templateUrl: './ngx-pull-to-refresh.component.html',
    styleUrls: ['./ngx-pull-to-refresh.component.scss']
})
export class NgxPullToRefreshComponent implements OnInit {
    @Input()
    spinnerColor = '#F7C223';
    @Input()
    spinnerSize = '50px';

    @Input()
    targetElement: Element;

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
    private readonly DISTANCE_FOR_REFRESH = 40;
    private readonly LOADINGBAR_DISPLAY_STYLE = 'flex';

    scrollPullPercent = 20;
    isPlayingAnimation = false;

    @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
    refreshCompleteSubject = new Subject();
    @Output() loadMore: EventEmitter<any> = new EventEmitter<any>();

    private ele: Element;

    constructor() {
    }

    ngOnInit() {
        this.refreshCompleteSubject.subscribe(() => {
            this.isPlayingAnimation = false;
            this.restoreWrapper();
            this.restoreLoadingbar();
        });

        this.ele = this.targetElement ?? this.wrapperElement.nativeElement;

        this.ele.addEventListener('touchstart', (evt: any) => {
            this.onTouchStart(evt);
        });
        this.ele.addEventListener('touchmove', (evt: any) => {
            this.onTouchMove(evt);
        });
        this.ele.addEventListener('scroll', (evt: any) => {
            this.onScroll(evt);
        });
        this.ele.addEventListener('touchend', (evt: any) => {
            this.onMouseup(evt);
        });
    }

    onTouchMove($event: any): void {
        const moveYDistance: number = this.touchStartScreenY - $event.touches[0].screenY;
        const scrollY = this.ele.scrollTop;
        if (scrollY <= 0 && this.lastScrollTop <= 0) {
            this.isScrollTop = true;
        } else {
            this.isScrollTop = false;
        }

        if (this.isScrollTop && moveYDistance <= this.DISTANCE_FOR_REFRESH * -1) {
            this.isRefresh = true;
        } else {
            this.isRefresh = false;
        }

        this.lastScrollTop = scrollY;

        this.moveWrapper(moveYDistance * -1);

        this.drawCircle(this.scrollPullPercent);
    }

    onScroll($event: any): void {
        const scrollY = this.ele.scrollTop;
        this.isOnScrollBottom = scrollY >= 0 &&
            this.ele.clientHeight + this.ele.scrollTop >= this.ele.scrollHeight;

        if (this.isOnScrollBottom &&
            this.loadMoreFunction &&
            document.contains(this.wrapperElement.nativeElement)) {
            this.loadMoreFunction();
        }
    }

    onTouchStart($event: any): void {
        this.isRefresh = false;
        this.touchStartScreenY = $event.touches[0].screenY;
    }

    onMouseup($event: any): void {
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
}
