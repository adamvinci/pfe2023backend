import Creche from "App/Models/Creche";
import Tournee from "App/Models/Tournee";

var cron = require('node-cron');

cron.schedule('59 10 5 * * *', async function () {
    const tournees = await Tournee.all();
    for (const tournee of tournees) {
        const creches = await Creche.query().where('tourneeId', tournee.$attributes.id);
        const percentageFactor = (tournee.$attributes.pourcentageSupplementaire / 100);

        const sumAttributes = creches.reduce((acc, creche) => {
            acc.nombreCaisseLingeSSum += creche.$attributes.nombreCaisseLingeS;
            acc.nombreCaisseLingeMSum += creche.$attributes.nombreCaisseLingeM;
            acc.nombreCaisseLingeLSum += creche.$attributes.nombreCaisseLingeL;
            acc.nombreCaisseInsertSum += creche.$attributes.nombreCaisseInsert;
            acc.nombreCaisseSacPoubelleSum += creche.$attributes.nombreCaisseSacPoubelle;
            acc.nombreCaisseGantSum += creche.$attributes.nombreCaisseGant;
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
        // Save the updated delivery
        await tournee.save();

        for (const creche of creches) {
            creche.isDelivered = false;
            await creche.save();
        }
        console.log(` ${tournee.$attributes.nom} updated for today`)
    }

})