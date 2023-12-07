/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'hello' }
})

//AuthController
Route.post('/auth/login', 'AuthController.login')
Route.post('/auth/register', 'AuthController.register').middleware('isAdmin')
Route.post('/auth/updatePassword', 'AuthController.updatePassword').middleware('isAdmin')
Route.get('/auth/resetPasswordAdmin', 'AuthController.resetPasswordAdmin').middleware('isAdmin') // todo
//TourneeController
Route.get('/tournees', 'TourneesController.getAll').middleware('auth')
Route.post('/tournees', 'TourneesController.createOne').middleware('isAdmin')
Route.post('/tournees/assignDelivery', 'TourneesController.chooseDelivery').middleware('auth')
Route.put('/tournees/updateState', 'TourneesController.updateDeliveryQuantity').middleware('auth') //todo

// CrecheController
Route.get('/creches', 'CrechesController.getAll').middleware('isAdmin')
Route.post('/creches', 'CrechesController.createOne').middleware('isAdmin')
Route.post('/creches/:idCreche', 'CrechesController.addNurseryCommand').middleware('isAdmin')
Route.delete('/creche/:id', 'CrechesController.deleteOne').middleware('isAdmin')

// UserController
Route.get('/users', 'UsersController.listLivreurs').middleware('isAdmin') // Afficher la liste des livreurs
Route.delete('/users/:id', 'UsersController.deleteOne').middleware('isAdmin') // Suprprime un livreurs