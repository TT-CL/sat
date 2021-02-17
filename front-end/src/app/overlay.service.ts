import { ElementRef, Injectable, Component } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { timer, Subscription } from 'rxjs';
import { DynamicOverlay } from './dynamic-overlay/dynamic-overlay.service';
import { OverlayRef } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class OverlayService {

  constructor(private dynamicOverlay: DynamicOverlay) { }

  public showOverlay(elRef: ElementRef, overlayComponent: any ) {
    if (elRef) {
      const result: ProgressRef = { subscription: null, overlayRef: null };
      result.subscription = timer(500)
        .subscribe(() => {
          this.dynamicOverlay.setContainerElement(elRef.nativeElement);
          const positionStrategy = this.dynamicOverlay.position().global().centerHorizontally().centerVertically();
          result.overlayRef = this.dynamicOverlay.create({
            positionStrategy: positionStrategy,
            hasBackdrop: true
          });
          result.overlayRef.attach(new ComponentPortal(overlayComponent));
        });
      return result;
    } else {
      return null;
    }
  }

  detach(result: ProgressRef) {
    if (result) {
      result.subscription.unsubscribe();
      if (result.overlayRef) {
        result.overlayRef.detach();
      }
    }
  }
}

export declare type ProgressRef = { subscription: Subscription, overlayRef: OverlayRef };
