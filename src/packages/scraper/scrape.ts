import axios from "axios";
import * as cheerio from 'cheerio';

export const getContractDeployer = async (contractAddress: string) => {
    try {
        const contractUrl = `https://rinkeby.etherscan.io/address/${contractAddress}`
        const { data } = await axios.get(contractUrl);

        const $ = cheerio.load(data);

        // Get the address from the scrapped html
        const owner = $('#ContentPlaceHolder1_trContract div div a').text().split('0x')[1]
        console.log("\n\nSCRAPPED OWNER > ", `0x${owner}`);

        return `0x${owner}`

    } catch (error) {
        console.log("Error scrapping contract deployer: ", error);
    }
}