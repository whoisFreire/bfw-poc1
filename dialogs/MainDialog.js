const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { UserDialog, USER_DIALOG } = require('./UserDialog');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const MAIN_DIALOG = 'MAIN_DIALOG';

class MainDialog extends ComponentDialog {
    constructor() {
        super(MAIN_DIALOG);

        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new UserDialog())
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async introStep(stepContext) {
        await stepContext.context.sendActivity('Vamos iniciar seu cadastro.');
        return stepContext.next();
    }

    async actStep(stepContext) {
        return await stepContext.beginDialog(USER_DIALOG);
    }

    async finalStep(stepContext) {
        const user = stepContext.result;
        await stepContext.context.sendActivity(`Seu nome é ${ user.name }, você nasceu no dia 17/09/1996, e seu gênero é ${ user.gender }.Seu CPF é ${ user.cpf }, e você reside na cidade ${ user.address.city } – ${ user.address.country }.`);
        return await stepContext.context.sendActivity('cadastro Finalizado');
    }
}

module.exports.MainDialog = MainDialog;
