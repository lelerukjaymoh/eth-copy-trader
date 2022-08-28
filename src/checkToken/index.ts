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
import { getTokenBalance, getTxnStatus } from "../packages/utils/common";
import { botParameters, TOKEN_CHECK_TIME_INTERVAL } from "../config/setup";

const main = async () => {
  console.log("\n\n Running a cron job");

  cron.schedule(`*/${TOKEN_CHECK_TIME_INTERVAL} * * * * *`, async () => {
    try {
      const dbTokens = await BoughtTokens.find();

      // console.log("All transactions ", dbTokens);

      if (dbTokens) {
        for (let i = 0; i < dbTokens.length; i++) {
          const token = dbTokens[i];

          console.log("\n\n Checking token ", token.tokenAddress);

          // Check if transaction has already been marked as bought
          if (token.bought) {
            // Check if token has already been sold by checking the token balance
            // If token has already been sold then mark it as sold in the db
            let tokenBalance = await getTokenBalance(token.tokenAddress, botParameters.swapperAddress);
            tokenBalance = parseFloat(tokenBalance);

            console.log("Token balance ", tokenBalance);

            if (tokenBalance < 1 && token.sold === false) {
              console.log("\n Token has already been sold, updating status ...");

              await BoughtTokens.findByIdAndUpdate(token._id, {
                sold: true,
              })
                .then(() => {
                  console.log("Document updated successfully", token._id);
                })
                .catch((error) =>
                  console.log("Error updating token sold status ", error)
                );
            }
          } else {

            // If the transaction has not been marked aas bought yet, check the status of the transaction
            // If it was successfully bought mark the token as bought, if it wasn't, delete the transaction from the db
            const txn = await getTxnStatus(token.txHash);

            if (txn) {
              if (txn.status && txn.status == 1) {
                await BoughtTokens.findByIdAndUpdate(token._id, {
                  bought: true,
                })
                  .then(() => {
                    console.log("Document updated successfully", token._id);
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
                  await BoughtTokens.findByIdAndDelete(token._id)
                    .then(() => {
                      console.log("Failed Txn deleted successfully", token._id);
                    })
                    .catch((error) => {
                      console.log("Error deleting failed Txn ", error)

                    })
                }
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
