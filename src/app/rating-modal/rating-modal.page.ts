import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ModalController, NavParams } from '@ionic/angular';
import { take } from 'rxjs';

@Component({
  selector: 'app-rating-modal',
  templateUrl: './rating-modal.page.html',
  styleUrls: ['./rating-modal.page.scss'],
})
export class RatingModalPage {
  selectedRating: number = 0;
  workerId: string;

  constructor(
    private db: AngularFireDatabase,
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) {
    this.workerId = this.navParams.get('workerId'); // Obtener el ID del trabajador
  }

  selectRating(star: number) {
    this.selectedRating = star;
  }

  submitRating() {
    if (this.selectedRating > 0) {
      const workerRef = this.db.object(`users/${this.workerId}`);
      workerRef.valueChanges().pipe(take(1)).subscribe((worker: any) => {
        if (worker) {
          const newRatingCount = (worker.ratingCount || 0) + 1;
          const newRating = ((worker.rating || 0) * (worker.ratingCount || 0) + this.selectedRating) / newRatingCount;

          workerRef.update({
            rating: newRating,
            ratingCount: newRatingCount
          }).then(() => {
            console.log('Valoración guardada');
            this.closeModal();
          });
        }
      });
    }
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
}
