import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Creche from 'App/Models/Creche';
import Tournee from 'App/Models/Tournee'
import CreateValidator from 'App/Validators/Tournee/CreateValidator';
import UpdateCommandValidator from 'App/Validators/Tournee/UpdateCommandValidator';
import UpdateOneValidator from 'App/Validators/Tournee/UpdateOneValidator';



export default class TourneesController {

    // Send All the delivery
    public async getAll({ response }: HttpContextContract) {
        const tournees = await Tournee.query().preload('user').preload('creches')
        return response.ok(tournees)
    }
    public async getOne({ params, response, }: HttpContextContract) {
        const idTournee = params.id
        if (isNaN(Number(idTournee))) {
            return response.status(400).json({ error: 'Invalid ID format. Must be a number.' });
        }
        const tournee = await Tournee.query().where("id", idTournee).preload('creches');
        if (tournee == null) return response.notFound();
        return response.ok({ tournee });
    }


    // create a tournee and assign the tournee to the nursery
    public async createOne({ request, response }: HttpContextContract) {

        const payload = await request.validate(CreateValidator);

        if (payload.creches) {
            let invalidCreches = '';
            for (const crecheId of payload.creches) {
                const creche = await Creche.findOrFail(crecheId);
                if (creche.nombreCaisseGant === null) {
                    invalidCreches += (creche.nom) + ", "
                }
            }
            if (invalidCreches !== '') {
                return response.badRequest({ message: `These nursery dont have quantity of box intialized: ${invalidCreches}` })
            }
        }
        //create tournee without delivery man
        let tournee = new Tournee();
        await Database.transaction(async (trx) => {
            tournee.pourcentageSupplementaire = payload.pourcentageSupplementaire;
            tournee.nom = payload.nom
            await tournee.useTransaction(trx).save();
            const tourneeId = tournee.id
            //assign tourneesid to nursery
            const { creches } = payload;
            for (const id of creches) {
                const creche = await Creche.findOrFail(id);
                creche.tourneeId = tourneeId;
                await creche.useTransaction(trx).save();
            }

            await this._createQuantity(tournee, payload.creches, trx)
        })

        const createdTournee = await Tournee.query().where('id', tournee.id).preload('user').preload('creches')
        return response.ok({ createdTournee })
    }



    // update isDelivered to true and calcul the remaining quantity in the delivery man car
    public async updateDeliveryQuantity({ request, response, auth }: HttpContextContract) {

        const userId = auth.user!

        const payload = await request.validate(UpdateCommandValidator)
        const { nurseryId } = payload
        // Check if this delivery is assigned to this user
        const allDeliveries = await Tournee.query()
            .where('user_id', userId.id)


        if (allDeliveries == null) {
            return response.notFound({ message: 'You cannot update this delivery' });
        }

        const creche = await Creche.findOrFail(nurseryId)
        let liv = 0;
        for (let i = 0; i < allDeliveries.length; i++) {
            if (creche.tourneeId == allDeliveries[i].id) {
                liv++;
            }
        }
        if (liv == 0) {
            return response.badRequest({ message: 'This nursery is not assigned to those deliveries' })
        }


        //si y'a une erreur d'encodage?
        if (creche.isDelivered) {
            return response.badRequest({ message: 'Tournee has already been delivered' })
        }



        // Objets pour stocker les quantités supplémentaires de chaque type de caisse
        let stockSupplementaire = {
            nombreCaisseGant: 0,
            nombreCaisseSacPoubelle: 0,
            nombreCaisseInsert: 0,
            nombreCaisseLingeL: 0,
            nombreCaisseLingeM: 0,
            nombreCaisseLingeS: 0,
        };

        // Récupération des données validées du payload
        const {
            nombreCaisseGantLivre,
            nombreCaisseSacPoubelleLivre,
            nombreCaisseInsertLivre,
            nombreCaisseLingeLLivre,
            nombreCaisseLingeMLivre,
            nombreCaisseLingeSLivre,
        } = payload;

        let diffNombreCaisseGant = nombreCaisseGantLivre - creche.nombreCaisseGant;
        let diffNombreCaisseSacPoubelle = nombreCaisseSacPoubelleLivre - creche.nombreCaisseSacPoubelle;
        let diffNombreCaisseInsert = nombreCaisseInsertLivre - creche.nombreCaisseInsert;
        let diffNombreCaisseLingeL = nombreCaisseLingeLLivre - creche.nombreCaisseLingeL;
        let diffNombreCaisseLingeM = nombreCaisseLingeMLivre - creche.nombreCaisseLingeM;
        let diffNombreCaisseLingeS = nombreCaisseLingeSLivre - creche.nombreCaisseLingeS;

        // Calcul de la somme totale des caisses supplémentaires de toutes les tournées
        for (let i = 0; i < allDeliveries.length; i++) {
            stockSupplementaire.nombreCaisseGant += allDeliveries[i].nombreCaisseGantSupplementaire;
            stockSupplementaire.nombreCaisseSacPoubelle += allDeliveries[i].nombreCaisseSacPoubelleSupplementaire;
            stockSupplementaire.nombreCaisseInsert += allDeliveries[i].nombreCaisseInsertSupplementaire;
            stockSupplementaire.nombreCaisseLingeL += allDeliveries[i].nombreCaisseLingeLSupplementaire;
            stockSupplementaire.nombreCaisseLingeM += allDeliveries[i].nombreCaisseLingeMSupplementaire;
            stockSupplementaire.nombreCaisseLingeS += allDeliveries[i].nombreCaisseLingeSSupplementaire;

            if (diffNombreCaisseGant != 0) {
                if (allDeliveries[i].nombreCaisseGantSupplementaire > diffNombreCaisseGant) {
                    allDeliveries[i].nombreCaisseGantSupplementaire += -diffNombreCaisseGant;
                    diffNombreCaisseGant = 0;
                } else {
                    diffNombreCaisseGant -= allDeliveries[i].nombreCaisseGantSupplementaire;
                    allDeliveries[i].nombreCaisseGantSupplementaire = 0;
                }
            } else if (diffNombreCaisseSacPoubelle != 0) {
                if (allDeliveries[i].nombreCaisseSacPoubelleSupplementaire > diffNombreCaisseSacPoubelle) {
                    allDeliveries[i].nombreCaisseSacPoubelleSupplementaire += -diffNombreCaisseSacPoubelle;
                    diffNombreCaisseSacPoubelle = 0;
                } else {
                    diffNombreCaisseSacPoubelle -= allDeliveries[i].nombreCaisseSacPoubelleSupplementaire;
                    allDeliveries[i].nombreCaisseSacPoubelleSupplementaire = 0;
                }
            } else if (diffNombreCaisseInsert != 0) {
                if (allDeliveries[i].nombreCaisseInsertSupplementaire > diffNombreCaisseInsert) {
                    allDeliveries[i].nombreCaisseInsertSupplementaire += -diffNombreCaisseInsert;
                    diffNombreCaisseInsert = 0;
                } else {
                    diffNombreCaisseInsert -= allDeliveries[i].nombreCaisseInsertSupplementaire;
                    allDeliveries[i].nombreCaisseInsertSupplementaire = 0;
                }
            } else if (diffNombreCaisseLingeL != 0) {
                if (allDeliveries[i].nombreCaisseLingeLSupplementaire > diffNombreCaisseLingeL) {
                    allDeliveries[i].nombreCaisseLingeLSupplementaire += -diffNombreCaisseLingeL;
                    diffNombreCaisseLingeL = 0;
                } else {
                    diffNombreCaisseLingeL -= allDeliveries[i].nombreCaisseLingeLSupplementaire;
                    allDeliveries[i].nombreCaisseLingeLSupplementaire = 0;
                }

            } else if (diffNombreCaisseLingeM != 0) {
                if (allDeliveries[i].nombreCaisseLingeMSupplementaire > diffNombreCaisseLingeM) {
                    allDeliveries[i].nombreCaisseLingeMSupplementaire += -diffNombreCaisseLingeM;
                    diffNombreCaisseLingeM = 0;
                } else {
                    diffNombreCaisseLingeM -= allDeliveries[i].nombreCaisseLingeMSupplementaire;
                    allDeliveries[i].nombreCaisseLingeMSupplementaire = 0;
                }

            } else if (diffNombreCaisseLingeS != 0) {
                if (allDeliveries[i].nombreCaisseLingeSSupplementaire > diffNombreCaisseLingeS) {
                    allDeliveries[i].nombreCaisseLingeSSupplementaire += -diffNombreCaisseLingeS;
                    diffNombreCaisseLingeS = 0;
                } else {
                    diffNombreCaisseLingeS -= allDeliveries[i].nombreCaisseLingeSSupplementaire;
                    allDeliveries[i].nombreCaisseLingeSSupplementaire = 0;
                }
            }

        }

        //verification si la demande a completement abouti
        if (diffNombreCaisseGant > 0) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseGantSupplementaire' });
        } else if (diffNombreCaisseSacPoubelle > 0) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseSacPoubelleSupplementaire' });
        } else if (diffNombreCaisseInsert > 0) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseInsertSupplementaire' });
        } else if (diffNombreCaisseLingeL > 0) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseLingeLSupplementaire' });
        } else if (diffNombreCaisseLingeM > 0) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseLingeMSupplementaire' });
        } else if (diffNombreCaisseLingeS > 0) {
            return response.badRequest({ message: 'Not enough extra quantity in stock for: nombreCaisseLingeSSupplementaire' });
        }


        await Database.transaction(async (trx) => {
            for (const updatedDelivery of allDeliveries) {
                await Tournee.query(trx)
                    .where('id', updatedDelivery.id)
                    .update({
                        nombreCaisseGantSupplementaire: updatedDelivery.nombreCaisseGantSupplementaire,
                        nombreCaisseSacPoubelleSupplementaire: updatedDelivery.nombreCaisseSacPoubelleSupplementaire,
                        nombreCaisseLingeSSupplementaire: updatedDelivery.nombreCaisseLingeSSupplementaire,
                        nombreCaisseLingeMSupplementaire: updatedDelivery.nombreCaisseLingeMSupplementaire,
                        nombreCaisseLingeLSupplementaire: updatedDelivery.nombreCaisseLingeLSupplementaire,
                        nombreCaisseInsertSupplementaire: updatedDelivery.nombreCaisseInsertSupplementaire
                    });
            }

            creche.isDelivered = true;
            await creche.useTransaction(trx).save();
        });

        return response.ok({ allDeliveries })
    }



    public async deleteOne({ response, params }: HttpContextContract) {
        const idDelivery = params.id
        if (isNaN(Number(idDelivery))) {
            return response.status(400).json({ error: 'Invalid ID format. Must be a number.' });
        }
        const tournee = await Tournee.find(idDelivery)
        if (tournee == null) return response.notFound();
        const creches = await Creche.query().where('tourneeId', tournee.id);
        await Database.transaction(async (trx) => {
            if (creches) {
                for (const creche of creches) {
                    creche.$attributes.tourneeId = null;
                    await creche.useTransaction(trx).save();
                }

            }
            await tournee.useTransaction(trx).delete()
        })

        return response.ok({ message: "Delivery deleted" });
    }

    public async updateOne({ response, request }: HttpContextContract) {
        const payload = await request.validate(UpdateOneValidator);
        if (payload.creches) {
            let invalidCreches = '';
            for (const crecheId of payload.creches) {
                const creche = await Creche.findOrFail(crecheId);
                if (creche.nombreCaisseGant === null) {
                    invalidCreches += (creche.nom) + ", "
                }
            }
            if (invalidCreches !== '') {
                return response.badRequest({ message: `These nursery dont have quantity of box intialized: ${invalidCreches}` })
            }
        }
        if (payload.nom) {
            const tournee = await Tournee.findBy("nom", payload.nom);
            if (tournee && (tournee.id !== payload.deliveryId)) {
                return response.conflict({ message: "This name is already taken" })
            }
        }
        const tournee = await Tournee.findOrFail(payload.deliveryId);
        tournee.nom = payload.nom ?? tournee.nom;
        tournee.$attributes.userId = payload.deliveryMan ?? tournee.userId
        tournee.pourcentageSupplementaire = payload.pourcentageSupplementaire ?? tournee.pourcentageSupplementaire;
        await Database.transaction(async (trx) => {
            if (payload.creches) {
                await Creche.query().useTransaction(trx).where('tourneeId', tournee.id).whereNotIn('id', payload.creches)
                    .update({ tourneeId: null });
                await Creche.query().useTransaction(trx).whereIn('id', payload.creches)
                    .update({ tourneeId: payload.deliveryId });

            }
            await tournee.useTransaction(trx).save();
        })
        return response.ok({ message: "Delivery has been succesfully updated" })
    }

    async _createQuantity(tournee: Tournee, arrayOfCrecheId, trx) {
        const creches = await Creche.query().whereIn('id', arrayOfCrecheId);
        const percentageFactor = (tournee.pourcentageSupplementaire / 100);
        const sumAttributes = creches.reduce((acc, creche) => {
            acc.nombreCaisseLingeSSum += creche.nombreCaisseLingeS;
            acc.nombreCaisseLingeMSum += creche.nombreCaisseLingeM;
            acc.nombreCaisseLingeLSum += creche.nombreCaisseLingeL;
            acc.nombreCaisseInsertSum += creche.nombreCaisseInsert;
            acc.nombreCaisseSacPoubelleSum += creche.nombreCaisseSacPoubelle;
            acc.nombreCaisseGantSum += creche.nombreCaisseGant;
            return acc;
        }, {
            nombreCaisseLingeSSum: 0,
            nombreCaisseLingeMSum: 0,
            nombreCaisseLingeLSum: 0,
            nombreCaisseInsertSum: 0,
            nombreCaisseSacPoubelleSum: 0,
            nombreCaisseGantSum: 0,
        });

        // Calcul the total amount of box to take
        tournee.$attributes.userId = null
        tournee.nombreCaisseGantAPrendre = sumAttributes.nombreCaisseGantSum
        tournee.nombreCaisseLingeSAprendre = sumAttributes.nombreCaisseLingeSSum
        tournee.nombreCaisseLingeMAprendre = sumAttributes.nombreCaisseLingeMSum
        tournee.nombreCaisseLingeLAprendre = sumAttributes.nombreCaisseLingeLSum
        tournee.nombreCaisseInsertAPrendre = sumAttributes.nombreCaisseInsertSum
        tournee.nombreCaisseSacPoubelleAPrendre = sumAttributes.nombreCaisseSacPoubelleSum
        // Calcul the extra box to take
        tournee.nombreCaisseGantSupplementaire = Math.round(sumAttributes.nombreCaisseGantSum * percentageFactor);
        tournee.nombreCaisseLingeSSupplementaire = Math.round(sumAttributes.nombreCaisseLingeSSum * percentageFactor);
        tournee.nombreCaisseLingeMSupplementaire = Math.round(sumAttributes.nombreCaisseLingeMSum * percentageFactor);
        tournee.nombreCaisseLingeLSupplementaire = Math.round(sumAttributes.nombreCaisseLingeLSum * percentageFactor);
        tournee.nombreCaisseInsertSupplementaire = Math.round(sumAttributes.nombreCaisseInsertSum * percentageFactor);
        tournee.nombreCaisseSacPoubelleSupplementaire = Math.round(sumAttributes.nombreCaisseSacPoubelleSum * percentageFactor);
        await tournee.useTransaction(trx).save();
    }

}



