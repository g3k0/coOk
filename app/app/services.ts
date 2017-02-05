import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Device} from 'ionic-native';
import {SQLite} from 'ionic-native';
import {Recipe} from './interfaces';
import 'rxjs/Rx';

@Injectable()
export class DataService {

  private http: any;
  private deviceData: any;

  constructor(
    http: Http
  ) {
    this.http = http;
    this.deviceData = {
      token: '',
      available: false,
      platform: '',
      version: '',
      uuid: '',
      cordova: '',
      model: '',
      manufacturer: '',
      isVirtual: false, 
      serial: ''
    };
  }

  /*--------------------------------------------------------------------------------------------------------------*/

  /**
   * Get the configuration file 
   * @param {Function} cb configuration callback function
   */
  retrieveConfig(cb) {
    this.http.get('./config.development.json')
    .subscribe(data => {
      return cb(data.json());
    });
  }

  /**
   * Get the access_token needed for authenticated calls to the back end services
   */
  retrieveAccessToken() {
    return new Promise((resolve, reject) => {
      let db = new SQLite();
      let access_token = '';
      db.openDatabase({
          name: 'data.db',
          location: 'default'
      }).then(() => {
        db.executeSql(`SELECT key, value FROM system WHERE key = 'access_token'`
          , []).then((data) => {
            if (!data.rows.length) {
              return reject('data not found');
            }
            for(var i = 0; i < data.rows.length; i++) {
                access_token = data.rows.item(i).value;
            }
            db.close().then(() => {
              return resolve(access_token);
            });
          });
      })
      .catch((error) => {
        console.error(`[retrieveAccessToken] Error: ${JSON.stringify(error)}`);
        return reject(error);
      });
    });
  }

  /*--------------------------------------------------------------------------------------------------------------*/

  /**
   * Register the app to the back end services 
   */
  register() {
    return new Promise((resolve, reject) =>{
      /*this.retrieveConfig((config) => {
        this.deviceData = Device.device;
        this.deviceData.token = config.token;
        this.http.post(config.authAPI.register, this.deviceData)
        .map((res) => {
          if (res.result === 'ok') {
            return resolve();
          }
          let err = new Error();
          err.statusCode = 500;
          err.message = 'There was an error on registering the app';
          log.error('Unable to register the application',err);
          return reject(err);
        })
        .catch((err) => {
          log.error('Unable to register the application',err);
          return reject(err);
        });
      });*/
      return resolve();
    });
  }

  /**
   * Log in the app to the back end services
   */
  login() {
    return new Promise((resolve, reject) => {
      /*this.retrieveConfig((config) => {
        this.http.post(config.authAPI.register, {uuid: Device.device.uuid})
        .map((res) => {
          if (res.access_token) {
            return resolve(res.access_token);
          }
          let err = new Error();
          err.statusCode = 500;
          err.message = 'There was an error on logging the app';
          log.error('Unable to log in the application',err);
          return reject(err);
        })
        .catch((err) => {
          log.error('Unable to log in the application',err);
          return reject(err);
        });
      });*/
      return resolve('mocktoken')
    });
  }

  /*--------------------------------------------------------------------------------------------------------------*/

  /**
   * App authentication
   */
  authentication() {
    return new Promise((resolve, reject) => {
      let db = new SQLite();
      db.openDatabase({
          name: 'data.db',
          location: 'default'
      })
      .then(() => {
        db.executeSql(`CREATE TABLE IF NOT EXISTS system (id INTEGER PRIMARY KEY AUTOINCREMENT, key VARCHAR(255), value VARCHAR(255))`, {})
        .then((system) => {
          console.log('TABLE CREATED: ', system);

          /*first app init, I call registration method, insert the record, then login*/
          if (!system.rows.length) {
            this.register()
              .then(() => {
                //Now I create the other SQLite tables I need
                db.executeSql(`
                  CREATE TABLE IF NOT EXISTS favorites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    name VARCHAR(255), 
                    type VARCHAR(255), 
                    mainIngredient VARCHAR(255), 
                    persons INTEGER, 
                    notes VARCHAR(255), 
                    ingredients VARCHAR(255), 
                    preparation VARCHAR(255),
                    CONSTRAINT constraint_name UNIQUE (name)
                  )`
                , {})
                .then(() => {
                  db.executeSql(`
                    CREATE TABLE IF NOT EXISTS calendar (
                      id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      day CHARACTER(20), 
                      meals BLOB
                    )`
                  , {})
                  .then(() => {
                    let meals = '[{"name":"pranzo","recipes": []},{"name": "cena","recipes": []}]'
                    db.executeSql(`
                      INSERT INTO calendar
                      (day,meals)
                      VALUES
                      ('lunedi', '${meals}'),
                      ('martedi', '${meals}'),
                      ('mercoledi', '${meals}'),
                      ('giovedi', '${meals}'),
                      ('venerdi', '${meals}'),
                      ('sabato', '${meals}'),
                      ('domenica', '${meals}')
                    `, []).then(() => {
                      //tables created, now log in the application and store of the token
                      this.login()
                      .then((access_token) =>{
                        db.executeSql(`
                          INSERT INTO system 
                          (key, value) 
                          VALUES ('access_token', '${access_token}')
                        `, [])
                        .then(() => {
                          db.close().then(() => {
                            return resolve();
                          });
                        });
                      });
                    });
                  });
                });
              });
            /*app is already registered, only login here*/                  
            } else {
              this.login()
              .then((access_token) =>{
                db.executeSql(`
                  UPDATE system 
                  SET value = '${access_token}' 
                  WHERE key = 'access_token'
                `, [])
                .then(() => {
                  db.close().then(() => {
                    return resolve();
                  });
                });
              });
            }
        });
      })
      .catch((error) => {
        console.error(`[authentication] Error: ${JSON.stringify(error)}`);
        return reject(error);
      });
    });
  }

  /*--------------------------------------------------------------------------------------------------------------*/
  
  /**
   * Get the recipes returned from a call to the recipes back end service
   * @param {string[]} ingredients array pushed by the user
   * @param {Object} filters objet setted by the user
   */
  getRecipes(ingredients:string[]=[''],filters:any={}) {
    return new Promise((resolve,reject) => {
      let self = this;
      this.retrieveConfig((config) => {
        let url = config.authAPI.recipes;

        self.retrieveAccessToken()
        .then((access_token) => {
          url += `?access_token=${access_token}`

          if (ingredients && ingredients.length) {
            url += `&filter[where][ingredients][regexp]=/`;

            for (let ingredient of ingredients) {
              url += `(?=.*?${ingredient})`;
            }

            url += `/i`;
          }

          if (filters && filters.recipeName) {
            url += `&filter[where][name]=${filters.recipeName}`;
          }

          if (filters && filters.mainIngredient) {
            url += `&filter[where][mainIngredient]=${filters.mainIngredient}`;
          }

          if (filters && filters.recipeType && filters.recipeType.length) {
            for (let type of filters.recipeType) {
              url += `&filter[where][type]=${type}`;
            }
          }
          
          //this.http.get(uri)
          self.http.get('./mock.json')
          .subscribe(data => {
            return resolve(data.json());
          });
        })
        .catch((error) => {
          console.error(`[getRecipes] Error: ${JSON.stringify(error)}`);
          return reject(error);
        });
      });
    });
  }
}