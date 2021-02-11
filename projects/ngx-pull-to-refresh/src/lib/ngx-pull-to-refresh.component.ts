import { Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, Input, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
	selector: 'ngx-pull-to-refresh',
	templateUrl: './ngx-pull-to-refresh.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
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
  isHorizontal = false;

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
	@ViewChild('contentContainer')
	private contentContainer: ElementRef<HTMLDivElement>;
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
	private isContainWrapper: boolean = false;

	touchstartEvent = (evt: any) => {
		this.onTouchStart(evt);
	}

	touchmoveEvent = (evt: TouchEvent) => {
		this.onTouchMove(evt);
	};

  scrollEvent = (evt: any) => {
	this.onScroll(evt);
  };

	touchendEvent = (evt: any) => {
		this.onTouchEnd(evt);
	}

	private distance: number = 0;
	private startScreenY = 0;

	constructor(
		private readonly chagneDetectorRef: ChangeDetectorRef
	) { }

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

	onTouchMove($event: TouchEvent): void {
		if (this.isPlayingAnimation) {
			return;
		} else if (!this._isEnable) {
			return;
		} else if (!this.isContainWrapper) {
			return;
		} else if(this.isHorizontal){
		  return;
		}

		const currentScreenY = $event.touches[0].screenY;

		if (scrollY <= 0 && this.distance > 0) {
			this.isScrollTop = true;
		} else {
			this.isScrollTop = false;
		}

		const loadingbar = this.loadingbar.nativeElement;

		if (this.startScreenY > currentScreenY) {
			this.distance = 0;
		} else {
			this.distance = Math.abs(currentScreenY - this.startScreenY);
		}

		if (this.distance > this.distanceForRefresh) {
			this.distance = this.distanceForRefresh;
		}
		this.isRefresh = this.isScrollTop && this.distance >= this.distanceForRefresh;

		const contentContainerElement = this.contentContainer.nativeElement;

		if (this.isScrollTop && this.distance >= 0) {
			contentContainerElement.style.transform = `translateY(${this.distance}px)`;

			loadingbar.style.visibility = "visible";
		} else {
			this.restoreWrapper();
			loadingbar.style.visibility = "hidden";
		}

		this.scrollPullPercent = (this.distance / this.distanceForRefresh) * 100;
		this.isRefresh = this.scrollPullPercent >= 100 && this.isScrollTop;

		if (this.scrollPullPercent < 0) {
			this.scrollPullPercent = 0;
		}

		this.drawCircle(this.scrollPullPercent);
	}

  onScroll($event: any): void {
		if (!this._isEnable) {
			return;
		}

		if (this.isHorizontal) {
			const scrollX = this.ele.scrollLeft;
			this.isOnScrollBottom = scrollX >= 0 &&
				this.ele.clientWidth + this.ele.scrollLeft >= this.ele.scrollWidth * 0.85;

		} else {
			const scrollY = this.ele.scrollTop;
			this.isOnScrollBottom = scrollY >= 0 &&
				this.ele.clientHeight + this.ele.scrollTop >= this.ele.scrollHeight * 0.85;
		}

		if (this.isOnScrollBottom &&
			this.loadMoreFunction &&
		  document.contains(this.wrapperElement.nativeElement)) {
			this.loadMoreFunction();
		}
	}

	onTouchStart($event: any): void {
		this.chagneDetectorRef.detectChanges();
		if (this.isPlayingAnimation) {
			return;
		} else if(this.isHorizontal) {
		  return;
		}
		const path = this.getParentElementList($event.srcElement);

		this.isContainWrapper = false;
		for (let i = 0; i < path.length; i++) {
			const item: HTMLElement = path[i];
			if (item === this.wrapperElement.nativeElement) {
				this.isContainWrapper = true;
				break;
			}
		}

		if (!this.isContainWrapper) {
			return;
		} else if (!this._isEnable) {
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
		} else if(this.isHorizontal) {
		  return;
		}

		if (this.isRefresh && document.contains(this.wrapperElement.nativeElement)) {
			this.refreshFunction();
		} else {
			this.restoreWrapper();
			this.restoreLoadingbar();
		}
	}

	restoreWrapper(): void {
		this.contentContainer.nativeElement.style.position = "relative";
		this.contentContainer.nativeElement.style.transform = `translateY(0)`;
		// this.loadingbar.nativeElement.style.transform = `translateY(0px)`;
		this.hiddenLoadingbar();
	}

	private hiddenLoadingbar() {
		this.loadingbar.nativeElement.style.visibility = "hidden";
	}

	restoreLoadingbar(): void {
		this.scrollPullPercent = 0;
		this.drawCircle(0);
		this.loadingbar.nativeElement.style.transform = `translateY(0)`;
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
		this.circleSvgElement.nativeElement.style.strokeDashoffset = offset + "px";
	}

	private getParentElementList(srcElement: any): HTMLElement[] {
		const parents: HTMLElement[] = [];
		let elem = srcElement;

		while (elem?.parentElement && elem.parentNode.nodeName.toLowerCase() != 'body') {
			elem = elem.parentElement;
			parents.push(elem);
		}

		return parents;
	}

	private addEventListener(): void {
		this.ele?.addEventListener('touchstart', this.touchstartEvent, false);
		this.ele?.addEventListener('touchmove', this.touchmoveEvent, false);
		this.ele?.addEventListener('touchend', this.touchendEvent, false);

		let scrollTarget: Element | Window;
		if (this.ele?.tagName == 'HTML') {
			scrollTarget = window;
		} else {
			scrollTarget = this.ele;
		}

		scrollTarget?.addEventListener('scroll', this.scrollEvent, false);


		NgxPullToRefreshComponent.touchstartEventList.push(this.touchstartEvent);
		NgxPullToRefreshComponent.touchmoveEventList.push(this.touchmoveEvent);
		NgxPullToRefreshComponent.scrollEventList.push(this.scrollEvent);
		NgxPullToRefreshComponent.touchendEventList.push(this.touchendEvent);
	}

	private removeEventListener(): void {
		this.ele?.removeEventListener('touchstart', this.touchstartEvent);
		this.ele?.removeEventListener('touchmove', this.touchmoveEvent);
		this.ele?.removeEventListener('scroll', this.scrollEvent);
		this.ele?.removeEventListener('touchend', this.touchendEvent);
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
