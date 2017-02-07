import {Component, ViewChild} from '@angular/core';
import {ModalController, AlertController, ToastController, ActionSheetController} from 'ionic-angular';
import {SocialSharing} from 'ionic-native';
import {RecipePage} from '../recipe/recipe';
import {FavoritesService} from './favorites.service';
import {Recipe} from '../../interfaces';

@Component({
  templateUrl: 'build/pages/favorites/favorites.html',
  directives: [RecipePage],
  providers: [FavoritesService]
})

export class FavoritesPage {

  @ViewChild(RecipePage) RecipePage: RecipePage;

	items: any;
  initialItems: any;
  message: string;

	constructor (
        private modalCtrl: ModalController,
        private favoritesData: FavoritesService,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private actionSheetCtrl: ActionSheetController
    ) {

    }

  /**
   * Component life cycle methods
   */
  ngOnInit() {
    this.favoritesData.retrieveFavorites()
    .then((recipes) => {
      let res = <any[]>recipes;
      if (!res.length) {
        this.message = 'Nessuna ricetta nei favoriti. Effettua una ricerca e salva le ricette';
        this.items = [];
        this.initialItems = [];
      } else {
        this.message = '';
        this.items = recipes;
        this.initialItems = recipes;
        return;
      }
    })
    .catch((err) => {
      return;
    });
  }

  /**
   * Called by a button to update the favorites items list
   */
  getFavorites() {
    this.favoritesData.retrieveFavorites()
    .then((recipes) => {
      let res = <any[]>recipes;
      if (!res.length) {
        this.message = 'Nessuna ricetta nei favoriti. Effettua una ricerca e salva le ricette';
        this.items = [];
        this.initialItems = [];
      } else {
        this.message = '';
        this.items = recipes;
        this.initialItems = recipes;
        return;
      }
    })
    .catch((err) => {
      return;
    });
  }

  /**
   * toast message method when a recipe is deleted from favorites
   * @param {string} where to show the toast in the web page: top | middle | bottom
   */
  presentToast(position:string='top') {
    let toast = this.toastCtrl.create({
      message: 'Ricetta cancellata con successo!',
      duration: 2000,
      position: position
    });
    toast.present();
  }

  /**
   * Called by show delete confirm method below if yes is pressed by the user
   * param {string} the recipe name to delete
   */
  deleteFavorite(name:string) {
    this.favoritesData.deleteFavorite(name)
    .then(() => {
      this.presentToast();
      return
    })
    .catch((err) => {
      return;
    });
  }
    
  /** 
   * Search bar filter method
   * @param {any} the event on the input element
   */
	getItems(ev:any) {
  	
  	// set val to the value of the searchbar
  	let val = ev.target.value;

  	// if the value is an empty string don't filter the items
  	if (val && val.trim() != '') {
    	this.items = this.items.filter((item) => {
    		return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
    	})
  	} else {
  		this.items = this.initialItems;
      return;
  	}
	}

  /**
   * Modal page loading method
   * @param {Recipe} a recipe object defined in the interfaces file
   */
  presentModal(item:Recipe) {
    if (!item) return;
    let modal = this.modalCtrl.create(RecipePage, {recipe:item});
    modal.present();
    return;
  }

  /**
   * Delete recipe confirmation alert
   * @param {string} the name of the recipe
   */
  showDeleteConfirm(name:string) {
    let confirm = this.alertCtrl.create({
      title: 'Cancella ricetta',
      message: `sei sicuro di voler cancellare la ricetta ${name}?`,
      buttons: [
        {
          text: 'No',
          handler: () => {
            return;
          }
        },
        {
          text: 'Si',
          handler: () => {
            this.deleteFavorite(name);
            return;
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * Social sharing methods
   * @param {Recipe} the recipe to share
   */
  facebookShare(recipe:Recipe) {
    let recipeText:string = `
      NOME: ${recipe.name}\n
      TIPO: ${recipe.type}\n
      INGREDIENTE PRINCIPALE: ${recipe.mainIngredient}\n
      PERSONE: ${recipe.persons}\n
      INGREDIENTI: ${recipe.ingredients.toString()}\n
      PREPARAZIONE: ${recipe.preparation}\n
      NOTE: ${recipe.notes}
    `;
    SocialSharing.shareViaFacebook(recipeText, null /*Image*/, null)
    .then(()=>{
      return;
    },
    ()=>{
      return;
    });
  }

  whatsappShare(recipe:Recipe) {
    let recipeText:string = `
      \nNOME: ${recipe.name}\n
      TIPO: ${recipe.type}\n
      INGREDIENTE PRINCIPALE: ${recipe.mainIngredient}\n
      PERSONE: ${recipe.persons}\n
      INGREDIENTI: ${recipe.ingredients.toString()}\n
      PREPARAZIONE: ${recipe.preparation}\n
      NOTE: ${recipe.notes}
    `;
    SocialSharing.shareViaWhatsApp(recipeText, null /*Image*/,  null /* url */)
      .then(()=>{
        return
      },
      ()=>{
        return;
    });
  }

  otherShare(recipe:Recipe) {
    let recipeText:string = `
      \nNOME: ${recipe.name}\n
      TIPO: ${recipe.type}\n
      INGREDIENTE PRINCIPALE: ${recipe.mainIngredient}\n
      PERSONE: ${recipe.persons}\n
      INGREDIENTI: ${recipe.ingredients.toString()}\n
      PREPARAZIONE: ${recipe.preparation}\n
      NOTE: ${recipe.notes}
    `;
    SocialSharing.share(recipeText, recipe.name, null,  null)
      .then(()=>{
        return
      },
      ()=>{
        return;
    });
  }

  /**
   * Open a modal with socials button to share recipe
   * @param {Recipe} the rrecipe to share
   */
  share(recipe:Recipe) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Condividi',
      buttons: [
         {
           text: 'Facebook',
           role: 'destructive',
           handler: () => {
             console.log('Facebook clicked');
             this.facebookShare(recipe);
           }
         },
         {
           text: 'WhatsApp',
           handler: () => {
             console.log('WhatsApp clicked');
             this.whatsappShare(recipe);
           }
         },
         {
           text: 'Altro',
           handler: () => {
             console.log('WhatsApp clicked');
             this.otherShare(recipe);
           }
         }
      ]
    });
    return actionSheet.present();
  }
}
