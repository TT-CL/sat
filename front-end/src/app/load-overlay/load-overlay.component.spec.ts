import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadOverlayComponent } from './load-overlay.component';

describe('LoadOverlayComponent', () => {
  let component: LoadOverlayComponent;
  let fixture: ComponentFixture<LoadOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
