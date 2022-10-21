import { sendNotification } from "../telegram";

const sellingNotification = async (token: any, target: any, tx: string) => {
  let message = "Target is selling";
  message += `\n\n Target: ${target}`
  message += `\n\n Token: ${token}`;
  message += "\n\n===============================";
  message += `\n\n Tx: https://etherscan.io/tx/${tx}`;

  await sendNotification(message);
};

export const failedToExitScamNotification = async (token: string) => {
  let message = `\n\n Failed to exit scam`;
  message += `\n\nToken: `;
  message += `${token}`;

  await sendNotification(message);
}

const sendTgNotification = async (
  target: string,
  targetTxhash: string,
  ourTxHash: string,
  txType: string,
  token: string
) => {
  let message = `\n\n Target Transaction:`;
  message += `\n\n Txn Type: ${txType}`;
  message += "\n--------------------";
  message += `\n\nTarget:`;
  message += `\nhttps://etherscan.io/address/${target}`;
  message += `\n\nTarget Txn Link: `;
  message += `\nhttps://etherscan.io/tx/${targetTxhash}`;
  message += "\n\n-------------";
  message += `\n\n Our Txn Link: `;
  message += `\nhttps://etherscan.io/tx/${ourTxHash}`;
  message += `\n\nToken: `;
  message += `${token.toLowerCase()}`;

  await sendNotification(message);
};

export { sellingNotification, sendTgNotification };
