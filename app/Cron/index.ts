import Creche from "App/Models/Creche";
import Tournee from "App/Models/Tournee";

var cron = require('node-cron');

cron.schedule('* 40 12 * * *', async function () {
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
        for (const prop in sumAttributes) {
            sumAttributes[prop] += Math.round(sumAttributes[prop] * percentageFactor);
        }

        tournee.$attributes.nombreCaisseGantRestante = sumAttributes.nombreCaisseGantSum
        tournee.$attributes.nombreCaisseLingeSRestante = sumAttributes.nombreCaisseLingeSSum
        tournee.$attributes.nombreCaisseLingeMRestante = sumAttributes.nombreCaisseLingeMSum
        tournee.$attributes.nombreCaisseLingeLRestante = sumAttributes.nombreCaisseLingeLSum
        tournee.$attributes.nombreCaisseInsertRestante = sumAttributes.nombreCaisseInsertSum
        tournee.$attributes.nombreCaisseSacPoubelleRestante = sumAttributes.nombreCaisseSacPoubelleSum
        // Save the updated tournee
        await tournee.save();
        console.log(`Quantity to transport for ${tournee.$attributes.id} updated`)
    }

})