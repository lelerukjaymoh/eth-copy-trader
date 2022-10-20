export const failedTxMessage = (txType: string, token: string, reason: any) => {

    console.log("CHECK ", reason)

    let message = `Failed to broadcast a ${txType}`
    message += `\n\n\ Token: https://etherscan.io/address/${token}`
    message += `\n\n Reason`
    message += `\n ${JSON.parse(reason).reason ? reason.reason : reason}`
    message += `\n\n Data`
    message += `\n ${JSON.parse(reason).data ? reason.data : null}`

    return message
}