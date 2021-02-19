import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatchLoginComponent } from './catch-login.component';

describe('CatchLoginComponent', () => {
  let component: CatchLoginComponent;
  let fixture: ComponentFixture<CatchLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CatchLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CatchLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
