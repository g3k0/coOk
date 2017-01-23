import {Component} from '@angular/core';
import { AlertController, ToastController } from 'ionic-angular';
import {DataService} from '../../services';


@Component({
	templateUrl: 'build/pages/search/search.html'
})

export class SearchPage {

	ingredients: any[];
	config: any;

	filters: {
		recipeName:string,
		mainIngredient:string,
		recipeType: any[]
	}

	constructor(
		public alertCtrl: AlertController,
		public toastCtrl: ToastController,
		public data: DataService
	) {
		this.ingredients = [];
		this.filters = {
			recipeName: null,
			mainIngredient: null,
			recipeType: []
		}

		/**
		 * Loading configuration
		 */
		let self = this;
		data.retrieveConfig(function(data) {
			self.config = data; //use this.config in class methods!
		});
	}

	/**
	 * ingredients form input
	 */
	pushIngredient(ingredient:string) {
		if (!ingredient) return;
		return this.ingredients.push(ingredient);
	}

	/**
	 * method that pop an ingredient from the ingredients array, 
	 * called in the ingredient x html button
	 */
	deleteIngredient(ingredient:string) {
		let index = this.ingredients.indexOf(ingredient);

		if (index > -1) {
		    this.ingredients.splice(index, 1);
		}

		return;
	}

	/**
	 * Filters alerts
	 */
	recipeName() {
	    let prompt = this.alertCtrl.create({
	    	title: 'Nome ricetta',
	    	message: 'Inserisci il nome della ricetta',
	    	inputs: [
	    		{
	          		name: 'recipeName',
	          		placeholder: 'nome ricetta'
	        	}
	      	],
	      	buttons: [
	        	{
	          		text: 'Cancella',
	          		handler: data => {
	            		return;
	          		}
	        	},
	        	{
	          		text: 'Salva',
	          		handler: data => {
	            		this.filters.recipeName = data.recipeName;
	          		}
	        	}
	      	]
	    });
	    prompt.present();
  	}

  	mainIngredient() {
	    let prompt = this.alertCtrl.create({
	    	title: 'Ingrediente principale',
	    	message: "Inserisci l'ingrediente principale",
	    	inputs: [
	    		{
	          		name: 'mainIngredient',
	          		placeholder: 'ingrediente principale'
	        	}
	      	],
	      	buttons: [
	        	{
	          		text: 'Cancella',
	          		handler: data => {
	            		return;
	          		}
	        	},
	        	{
	          		text: 'Salva',
	          		handler: data => {
	            		this.filters.mainIngredient = data.mainIngredient;
	          		}
	        	}
	      	]
	    });
	    prompt.present();
  	}

	recipeType() {
	    let alert = this.alertCtrl.create();
	    alert.setTitle('Tipo di piatto');

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Bevande',
	    	value: 'Bevande'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Antipasti',
	     	value: 'Antipasti'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Primi',
	     	value: 'Primi'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Carni',
	     	value: 'Carni'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Pollame',
	     	value: 'Pollame'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Pesce',
	     	value: 'Pesce'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Contorni',
	     	value: 'Contorni'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Salse',
	     	value: 'Salse'
	    });

	    alert.addInput({
	    	type: 'checkbox',
	    	label: 'Dolci',
	     	value: 'Dolci'
	    });

	    alert.addButton('Cancella');

	    alert.addButton({
	    	text: 'Salva',
	    	handler: data => {
	        	this.filters.recipeType = data;
	      	}
	    });
	    alert.present();
  	}
  	/*
  	persons() {
	    let alert = this.alertCtrl.create();
    	alert.setTitle('Numero di persone');

    	let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    	for (let num of numbers) {
    		alert.addInput({
	      		type: 'radio',
	      		label: num,
	      		value: num
	    	});
    	}

    	alert.addButton('Cancella');
    	alert.addButton({
      		text: 'Salva',
      		handler: data => {
      		}
    	});
    	alert.present();
  	}
  	*/

  	/**
  	 * Init filters method in clear filter html button
   	 */
  	clearFilters() {
  		this.filters = {
			recipeName: null,
			mainIngredient: null,
			recipeType: []
		};
		return;
  	}

  	/**
  	 * toast message method when clear filter button is pressed
  	 */
  	presentToast(position:string) {
	    let toast = this.toastCtrl.create({
	      message: 'Filtri resettati con successo!',
	      duration: 2000,
	      position: position
	    });
	    toast.present();
	}

    /**
     * Search method, called by the search html button
     */
    search() {

	  	if (!this.ingredients.length && 
	  		!this.filters.recipeName &&
	  		!this.filters.mainIngredient &&
	  		!this.filters.recipeType.length
	  	) {
	  		console.log('no data');
	  		return;
	  	}

	  	console.log(this.ingredients);
	  	console.log(this.filters);
	  	return;
    } 
}