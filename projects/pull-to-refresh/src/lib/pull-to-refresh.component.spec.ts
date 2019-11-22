import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PullToRefreshComponent } from './pull-to-refresh.component';

describe('PullToRefreshComponent', () => {
  let component: PullToRefreshComponent;
  let fixture: ComponentFixture<PullToRefreshComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PullToRefreshComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PullToRefreshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
