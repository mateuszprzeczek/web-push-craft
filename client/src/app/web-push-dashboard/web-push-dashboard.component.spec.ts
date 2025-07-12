import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebPushDashboardComponent } from './web-push-dashboard.component';

describe('WebPushDashboardComponent', () => {
  let component: WebPushDashboardComponent;
  let fixture: ComponentFixture<WebPushDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebPushDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WebPushDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
