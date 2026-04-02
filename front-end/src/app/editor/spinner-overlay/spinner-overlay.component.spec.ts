import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinnerOverlayComponent } from './load-overlay.component';

describe('SpinnerOverlayComponent', () => {
  let component: SpinnerOverlayComponent;
  let fixture: ComponentFixture<SpinnerOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SpinnerOverlayComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
