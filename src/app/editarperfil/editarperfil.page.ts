import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.page.html',
  styleUrls: ['./editarperfil.page.scss'],
})
export class EditarperfilPage implements OnInit {
  profilePhotoUrl: string = 'assets/default.jpg';
  name: string = '';
  email: string = '';
  phone: string = '';
  comuna: string = '';
  skills: string = ''; // Campo de skills para vincularlo con el input
  comunasDisponibles: string[] = [
    'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
    'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja',
    'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo',
    'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén',
    'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta',
    'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Santiago', 'Vitacura',
  ];

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private NavCtrl: NavController
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        console.error('No hay usuario autenticado');
      }
    });
  }

  loadUserProfile(userId: string) {
    this.db.object(`users/${userId}`).valueChanges().subscribe(
      (userData: any) => {
        if (userData) {
          this.name = userData.name || '';
          this.email = userData.email || '';
          this.phone = userData.phone || '';
          this.profilePhotoUrl = userData.profilePhotoUrl || 'assets/default.jpg';
          this.comuna = userData.comuna || '';
          this.skills = userData.skills || ''; // Cargar las habilidades aquí
        }
      },
      (error) => console.error('Error al cargar los datos del perfil:', error)
    );
  }

  async changeProfilePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      if (image?.dataUrl) {
        this.uploadProfilePicture(image.dataUrl);
      }
    } catch (error) {
      console.error('Error al obtener la foto:', error);
    }
  }

  async uploadProfilePicture(dataUrl: string) {
    const user = await this.afAuth.currentUser;
    const userId = user?.uid;

    if (userId) {
      const filePath = `profilePhotos/${userId}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = fileRef.putString(dataUrl, 'data_url');

      uploadTask.snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.profilePhotoUrl = url;
              this.updateUserProfilePhoto(url);
            });
          })
        )
        .subscribe();
    }
  }

  async updateUserProfilePhoto(url: string) {
    const user = await this.afAuth.currentUser;
    const userId = user?.uid;

    if (userId) {
      await this.db.object(`users/${userId}`).update({ profilePhotoUrl: url });
    }
  }

  async updateUserProfile() {
    const user = await this.afAuth.currentUser;
    const userId = user?.uid;

    if (userId) {
      await this.db.object(`users/${userId}`).update({
        name: this.name,
        email: this.email,
        phone: this.phone,
        profilePhotoUrl: this.profilePhotoUrl,
        comunas: this.comuna,
        skills: this.skills, // Guardar las habilidades editadas
      });
    }
  }
  cambiarComuna(event: any) {
    this.comuna = event.detail.value; // Actualiza la propiedad `comuna` con el valor seleccionado
  }
  

  goBack() {
    this.NavCtrl.back();
  }
}
