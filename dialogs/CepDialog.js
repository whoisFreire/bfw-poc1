const { ComponentDialog, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { cepApi } = require('../Services');

const CEP_DIALOG = 'CEP_DIALOG';
const CEP_PROMPT = 'CEP_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class CepDialog extends ComponentDialog {
    constructor(id) {
        super(id || CEP_DIALOG);

        this.addDialog(new TextPrompt(CEP_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.cepStep.bind(this),
            this.cepRequisitionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async cepStep(stepContext) {
        return await stepContext.prompt(CEP_PROMPT, 'informe seu CEP:');
    }

    async cepRequisitionStep(stepContext) {
        const cep = stepContext.result;
        const address = await cepApi.fetch(cep);
        return await stepContext.endDialog(address);
    }
}

module.exports.CEP_DIALOG = CEP_DIALOG;
module.exports.CepDialog = CepDialog;
