const { ComponentDialog, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const intentsNames = require('../constants/intentsNames');
const { cepApi } = require('../Services');

const CEP_DIALOG = 'CEP_DIALOG';
const CEP_PROMPT = 'CEP_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class CepDialog extends ComponentDialog {
    constructor(id) {
        super(id || CEP_DIALOG);

        this.addDialog(new TextPrompt(CEP_PROMPT, this.cepValitor.bind(this)));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.cepStep.bind(this),
            this.cepRequisitionStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async cepStep(stepContext) {
        return await stepContext.prompt(CEP_PROMPT, 'informe seu CEP:');
    }

    async cepValitor(stepContext) {
        const { intent } = stepContext.context.result;
        if (!intent) return false;
        return intent.score > 0.7 && intentsNames.includes(intent.intent);
    }

    async cepRequisitionStep(stepContext) {
        const cep = stepContext.result;
        const address = await cepApi.fetch(cep);
        return await stepContext.endDialog(address);
    }
}

module.exports.CEP_DIALOG = CEP_DIALOG;
module.exports.CepDialog = CepDialog;
