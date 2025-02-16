import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPullToRefreshComponent } from './ngx-pull-to-refresh.component';

describe('NgxPullToRefreshComponent', () => {
  let component: NgxPullToRefreshComponent;
  let fixture: ComponentFixture<NgxPullToRefreshComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [NgxPullToRefreshComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxPullToRefreshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
