import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        nom: "maximilien",
        password: "71password",
        isAdmin: true
      },
      {
        nom: "livreur1",
        password: "livreur1"
      },
      {
        nom: "livreur2",
        password: "livreur2",
      }
    ])
  }
}
