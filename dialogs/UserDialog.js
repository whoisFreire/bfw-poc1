const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, TextPrompt, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');

const { UserProfile } = require('../Models/UserProfile');
const { CEP_DIALOG, CepDialog } = require('./CepDialog');

const USER_DIALOG = 'USER_DIALOG';
const NAME_PROMPT = 'NAME_PROMPT';
const AGE_PROMPT = 'AGE_PROMPT';
const GENDER_PROMPT = 'GENDER_PROMPT';
const CPF_PROMPT = 'CPF_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserDialog extends ComponentDialog {
    constructor() {
        super(USER_DIALOG);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(AGE_PROMPT));
        this.addDialog(new ChoicePrompt(GENDER_PROMPT, this.validateGender.bind(this)));
        this.addDialog(new TextPrompt(CPF_PROMPT));
        this.addDialog(new CepDialog(CEP_DIALOG));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.nameStep.bind(this),
            this.ageStep.bind(this),
            this.genderStep.bind(this),
            this.cpfStep.bind(this),
            this.cepStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async nameStep(stepContext) {
        stepContext.values.userProfile = new UserProfile();
        return await stepContext.prompt(NAME_PROMPT, 'informe seu nome:');
    }

    async ageStep(stepContext) {
        stepContext.values.userProfile.name = stepContext.result;
        return await stepContext.prompt(AGE_PROMPT, 'informe sua idade:');
    }

    async genderStep(stepContext) {
        stepContext.values.userProfile.age = stepContext.result;
        const buttons = ['Masculino', 'Feminino', 'Outro'];
        const card = CardFactory.heroCard(undefined, undefined, buttons, { text: 'Informe seu gênero:' });
        const prompt = MessageFactory.attachment(card);

        return await stepContext.prompt(GENDER_PROMPT, { prompt });
    }

    async cpfStep(stepContext) {
        const { context } = stepContext;
        stepContext.values.userProfile.gender = context.activity.text;
        return await stepContext.prompt(CPF_PROMPT, 'informe seu CPF (somente números):');
    }

    async cepStep(stepContext) {
        stepContext.values.userProfile.cpf = stepContext.result;

        return await stepContext.beginDialog(CEP_DIALOG);
    }

    async finalStep(stepContext) {
        // stepContext.values.userProfile.cep = stepContext.options.address;
        console.log(stepContext.result.data);
        return await stepContext.endDialog();
    }

    async validateGender(stepContext) {
        const { context } = stepContext;
        const options = ['Masculino', 'Feminino', 'Outro'];
        return options.includes(context.activity.text);
    }
}

module.exports.UserDialog = UserDialog;
module.exports.USER_DIALOG = USER_DIALOG;
