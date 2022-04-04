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
import { BoughtTokens } from "../db/models";
import "../db/connect";
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
          const txnStatus = await getTxnStatus(dbTokens[i].txHash);

          if (txnStatus && txnStatus == 1) {
            await BoughtTokens.findByIdAndUpdate(dbTokens[i]._id, {
              bought: true,
            })
              .then(() => {
                console.log("Document updated successfully", dbTokens[i]._id);
              })
              .catch((error) =>
                console.log("Error updating token bought status ", error)
              );
          }
        }
      }
    } catch (error) {
      console.log("Error on checkToken : ", error);
    }
  });
};

main();
