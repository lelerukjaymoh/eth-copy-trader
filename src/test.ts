import "./db/connect"
import { BoughtTokens } from "./db/models";

const main = async () => {
    const bought = new BoughtTokens({
        tokenAddress: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9".toLowerCase(),
    });

    await bought
        .save()
        .then(() => {
            console.log("Successfully saved token in DB");
        })
        .catch((error: any) => {
            console.log("Error saving token ", "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", error);
        });
}


main()