/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

module.exports = {
  inputs: {
    transporter: {
      type: 'ref',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
    subject: {
      type: 'string',
      required: true,
    },
    html: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    try {
      const info = await inputs.transporter.sendMail(inputs);

      sails.log.info(`Email sent: ${info.messageId}`);
    } catch (error) {
      sails.log.error(`Error sending email: ${error}`);
    }
  },
};
