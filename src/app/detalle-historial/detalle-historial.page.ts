import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-historial',
  templateUrl: './detalle-historial.page.html',
  styleUrls: ['./detalle-historial.page.scss'],
})
export class DetalleHistorialPage implements OnInit {
  trabajoId: string = ''; // ID único del trabajo
  trabajo: any = {
    descripcionTrabajo: '',
    requerimientos: '',
    pago: '',  // Se guarda como string con formato CLP
    imageUrl: 'assets/default.jpg', // Imagen predeterminada
  };

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private router: Router
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const trabajo = navigation.extras.state['misTrabajos'];
      if (trabajo) {
        this.trabajoId = trabajo.id; // Extraemos el ID
        this.trabajo = trabajo; // Cargamos los datos del trabajo
      } else {
        console.error('No se encontraron datos del trabajo');
      }
    } else {
      console.error('No se encontraron datos en el estado de navegación');
    }
  }

  // Método para formatear el pago como CLP (Pesos Chilenos)
  getFormattedPago(): string {
    if (this.trabajo.pago) {
      return this.trabajo.pago; // Ya está formateado como "$12.364"
    }
    return 'No disponible';
  }

  // Validar el pago para asegurar que sea numérico y formatear como CLP
  validatePago() {
    // Asegura que solo se mantengan números en el campo de pago
    let numericValue = this.trabajo.pago.replace(/[^0-9]/g, '');  // Eliminar caracteres no numéricos
    if (numericValue) {
      // Formatear el valor a CLP
      this.trabajo.pago = '$' + numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Ejemplo: "$12.364"
    }
  }

  // Actualizar el trabajo en Firebase
  async updateTrabajo() {
    if (this.trabajoId) {
      const pago = this.trabajo.pago;
      if (pago) {
        await this.db.object(`trabajosPosteados/${this.trabajoId}`).update({
          descripcionTrabajo: this.trabajo.descripcionTrabajo,
          requerimientos: this.trabajo.requerimientos,
          pago: this.trabajo.pago,  // Asegúrate de que el campo 'pago' se actualice correctamente
          imageUrl: this.trabajo.imageUrl
        })
        .then(() => {
          console.log('Trabajo actualizado con éxito');
        })
        .catch((error) => {
          console.error('Error al actualizar el trabajo:', error);
        });
      } else {
        console.error('El pago debe ser un número válido');
      }
    } else {
      console.error('No se encontró el ID del trabajo para actualizar');
    }
  }

  // Cambiar la imagen del trabajo
  async changeImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      if (image?.dataUrl) {
        const filePath = `trabajosPosteados/${this.trabajoId}`; // Asegúrate de que la ruta de Firebase sea correcta
        const fileRef = this.storage.ref(filePath);
        const uploadTask = fileRef.putString(image.dataUrl, 'data_url');

        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.trabajo.imageUrl = url; // Actualiza el campo imageUrl
              console.log('Imagen actualizada:', url);
              this.updateTrabajo(); // Actualiza el trabajo con la nueva imagen
            });
          })
        ).subscribe();
      }
    } catch (error) {
      console.error("Error al cambiar la imagen:", error);
    }
  }

  // Volver a la página anterior
  goBack() {
    this.router.navigate(['/historial']);
  }
}
