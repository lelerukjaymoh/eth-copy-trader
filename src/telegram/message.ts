export const failedTxMessage = (txType: string, token: string, reason: string) => {
    let message = `Failed to broadcast a ${txType}`
    message += `\n\n\ Token: https://etherscan.io/address/${token}`
    message += `\n\n Reason`
    message += `\n ${reason}`

    return message
}