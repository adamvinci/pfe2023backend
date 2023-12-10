import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Tournee from 'App/Models/Tournee'

export default class extends BaseSeeder {
  public async run() {
    await Tournee.createMany([
      {
        nom: "Tournee charleroi",
      },
      {
        nom: "Tournee mons",
        pourcentageSupplementaire: 20
      }
    ])
  }
}
