import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashToolbarComponent } from './dash-toolbar.component';

describe('DashToolbarComponent', () => {
  let component: DashToolbarComponent;
  let fixture: ComponentFixture<DashToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
