import { walletNonce } from "../../../utils/common"
import { getContract } from "../utils/common"
import constants from "../utils/constants.json"

const approveAmount = "115792089237316195423570985008687907853269984665640564039457584007913129639935"

export const approve = async (tokenAddress: string, spender: string) => {

    const tokenContract = getContract(tokenAddress)!

    try {
        const nonce = await walletNonce()

        const overLoads = {
            nonce
        }
        const txn = await tokenContract.approve(spender, approveAmount, overLoads)

        console.log("Successful approve Txn : ", txn);

    } catch (error) {
        console.log("Error approving token : ", error);

    }
}
