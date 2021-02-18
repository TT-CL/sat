import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavAuthWidgetComponent } from './nav-auth-widget.component';

describe('NavAuthWidgetComponent', () => {
  let component: NavAuthWidgetComponent;
  let fixture: ComponentFixture<NavAuthWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavAuthWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavAuthWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
