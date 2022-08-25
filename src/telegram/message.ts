export const failedTxMessage = (txType: string, token: string, reason: any) => {
    let message = `Failed to broadcast a ${txType}`
    message += `\n\n\ Token: https://etherscan.io/address/${token}`
    message += `\n\n Reason`
    message += `\n ${reason.reason ? reason.reason : reason}`
    message += `\n\n Data`
    message += `\n ${reason.data ? reason.data : null}`

    return message
}