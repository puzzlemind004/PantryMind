import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { TranslatePipe } from '../../shared/i18n/translate';

/** API BarcodeDetector (Chrome/Edge Android — cible principale du projet). */
declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
  static getSupportedFormats(): Promise<string[]>;
}

/**
 * Scanner de code-barres via caméra (spec §8.10). Utilise l'API native
 * BarcodeDetector ; affiche un message d'indisponibilité sinon
 * (un repli zxing pourra être ajouté pour iOS).
 */
@Component({
  selector: 'app-barcode-scanner',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      @if (unsupported()) {
        <p class="rounded-xl bg-surface p-4 text-center text-sm text-muted">
          {{ 'scan.notSupported' | t }}
        </p>
      } @else if (cameraError()) {
        <p class="error-text text-center">{{ 'scan.cameraError' | t }}</p>
      } @else {
        <div class="overflow-hidden rounded-xl bg-black">
          <video #video class="aspect-[4/3] w-full object-cover" playsinline muted></video>
        </div>
        <p class="text-center text-sm text-muted">{{ 'scan.instructions' | t }}</p>
      }
    </div>
  `,
})
export class BarcodeScanner implements OnInit, OnDestroy {
  readonly detected = output<string>();

  protected readonly unsupported = signal(false);
  protected readonly cameraError = signal(false);

  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  private stream: MediaStream | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private hasEmitted = false;

  async ngOnInit(): Promise<void> {
    if (typeof BarcodeDetector === 'undefined') {
      this.unsupported.set(true);
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
    } catch {
      this.cameraError.set(true);
      return;
    }

    const videoElement = this.video()?.nativeElement;
    if (!videoElement) {
      return;
    }
    videoElement.srcObject = this.stream;
    await videoElement.play();

    const detector = new BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
    });

    this.pollTimer = setInterval(async () => {
      if (this.hasEmitted || videoElement.readyState < 2) {
        return;
      }
      try {
        const barcodes = await detector.detect(videoElement);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          this.hasEmitted = true;
          this.detected.emit(barcodes[0].rawValue);
        }
      } catch {
        // Frame non exploitable : on retente au tick suivant.
      }
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    this.stream?.getTracks().forEach((track) => track.stop());
  }
}
