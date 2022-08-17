/**
 * 1. Run a cron job that keeps on checking new transaction that are submitted to see if the transaction
 *      was confirmed successfully
 *
 * 2. If it was update the value of db to bought
 *
 * 3. Before a token is bought first check if the bought field is true (to be implemented in the index page.)
 *
 */

import cron from "node-cron";
import "../db/connect";
import { BoughtTokens } from "../db/models";
import { getTxnStatus } from "../utils/common";
import { TOKEN_CHECK_TIME_INTERVAL } from "../config/setup";

const main = async () => {
  cron.schedule(`*/${TOKEN_CHECK_TIME_INTERVAL} * * * * *`, async () => {
    console.log("\n\n Running a cron job");
    try {
      const dbTokens = await BoughtTokens.find({ bought: false });

      console.log(dbTokens);

      if (dbTokens) {
        for (let i = 0; i < dbTokens.length; i++) {
          const txn = await getTxnStatus(dbTokens[i].txHash);

          if (txn) {
            if (txn.status && txn.status == 1) {
              await BoughtTokens.findByIdAndUpdate(dbTokens[i]._id, {
                bought: true,
              })
                .then(() => {
                  console.log("Document updated successfully", dbTokens[i]._id);
                })
                .catch((error) =>
                  console.log("Error updating token bought status ", error)
                );
            } else {

              /* Delete the transaction from the database if it failed. 
              * Mark the transactions as failed if its status fail and the
              * transaction has more than 12 confirmations
              */
              if (txn.confirmations && txn?.confirmations > 12) {
                await BoughtTokens.findByIdAndDelete(dbTokens[i]._id)
                  .then(() => {
                    console.log("Failed Txn deleted successfully", dbTokens[i]._id);
                  })
                  .catch((error) => {
                    console.log("Error deleting failed Txn ", error)

                  })
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("Error on checkToken : ", error);
    }
  });
};

main();
