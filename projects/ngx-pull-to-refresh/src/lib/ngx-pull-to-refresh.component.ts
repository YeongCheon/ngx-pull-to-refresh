import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'ngx-pull-to-refresh',
    templateUrl: './ngx-pull-to-refresh.component.html',
    styleUrls: ['./ngx-pull-to-refresh.component.scss']
})
export class NgxPullToRefreshComponent implements OnInit {
    private isRefresh = false;
    private isScrollTop = false;
    private isOnScrollBottom = false;
    private lastScrollTop = 0;
    @ViewChild('wrapper')
    private ele: ElementRef;
    @ViewChild('loadingbar')
    private loadingbar: ElementRef;
    @ViewChild('loadingIcon')
    private loadingIcon: ElementRef;
    private touchStartScreenY = 0;

    private readonly DISTANCE_FOR_REFRESH = 40;
    private readonly LOADINGBAR_DISPLAY_STYLE = 'flex';

    loadingMode = 'determinate'; // indeterminate | determinate
    scrollPullPercent = 20;

    @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
    @Output() loadMore: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit() {
    }

    private get scrollTop() { return this.ele.nativeElement.scrollTop || 0; }

    onTouchMove(event): void {
        const wrapper: HTMLElement = this.ele.nativeElement;
        // const wrapper: HTMLElement = document.documentElement;

        const moveYDistance: number = this.touchStartScreenY - event.touches[0].screenY;

        if (wrapper.scrollTop <= 0 && this.lastScrollTop <= 0) {
            this.isScrollTop = true;
        } else {
            this.isScrollTop = false;
        }

        if (this.isScrollTop && moveYDistance <= this.DISTANCE_FOR_REFRESH * -1) {
            this.isRefresh = true;
        } else {
            this.isRefresh = false;
        }

        this.lastScrollTop = wrapper.scrollTop;

        this.moveWrapper(moveYDistance * -1);

        this.isOnScrollBottom = wrapper.scrollTop >= 0 &&
            wrapper.scrollHeight - wrapper.scrollTop === wrapper.clientHeight;

        this.drawCircle(this.scrollPullPercent);
    }

    onTouchStart(event): void {
        this.isRefresh = false;
        this.touchStartScreenY = event.touches[0].screenY;
    }

    onMouseup(event): void {
        if (this.isRefresh) {
            this.refreshFunction();
        } else {
            this.restoreLoadingbar();
        }

        if (this.isOnScrollBottom && this.loadMoreFunction) {
            this.loadMoreFunction();
        }

        this.restoreWrapper();
    }

    moveWrapper(offsetY: number): void {
        const wrapper: HTMLElement = this.ele.nativeElement;
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
        const wrapper: HTMLElement = this.ele.nativeElement;
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


    rotateLoadingIcon(): void {
        this.drawCircle(95);
        this.loadingbar.nativeElement.querySelector('.pie-wrapper').classList.add('rotating');
    }

    refreshFunction(): void {
        this.rotateLoadingIcon();

        this.refresh.asObservable().subscribe(() => {
            this.restoreLoadingbar();
        });

        this.refresh.emit(true);
    }

    loadMoreFunction(): void {
        this.loadMore.emit(true);
    }

    private drawCircle(percentage: number) {
        const leftSideElement: HTMLElement = this.loadingbar.nativeElement.querySelector('.left-side');
        const rightSideElement: HTMLElement = this.loadingbar.nativeElement.querySelector('.right-side');

        if (percentage <= 50) {
            leftSideElement.style.borderColor = '#bdc3c7';

            const rotateValue = (100 - (50 - percentage)) / 100 * 360;
            leftSideElement.style.transform = `rotate(${rotateValue}deg)`;
        } else {
            leftSideElement.style.borderColor = '#e74c3c';

            leftSideElement.style.transform = `rotate(${percentage * 3.6}deg)`;
        }
    }
}
