import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-premium',
  templateUrl: './premium.page.html',
  styleUrls: ['./premium.page.scss'],
})
export class PremiumPage implements OnInit {

  constructor(
    private NavCtrl : NavController,
  ) { }

  ngOnInit() {
  }

  goBack() {
    this.NavCtrl.back();
  }

}
