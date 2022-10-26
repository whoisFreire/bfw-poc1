const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, TextPrompt, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');

const { UserProfile } = require('../Models/UserProfile');
const { CEP_DIALOG, CepDialog } = require('./CepDialog');
const intentsNames = require('../constants/intentsNames');

const USER_DIALOG = 'USER_DIALOG';
const NAME_PROMPT = 'NAME_PROMPT';
const AGE_PROMPT = 'AGE_PROMPT';
const BIRTHDATE_PROMPT = 'BIRTHDATE_PROMPT';
const GENDER_PROMPT = 'GENDER_PROMPT';
const CPF_PROMPT = 'CPF_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class UserDialog extends ComponentDialog {
    constructor() {
        super(USER_DIALOG);

        this.addDialog(new TextPrompt(NAME_PROMPT, this.nameValidator.bind(this)));
        this.addDialog(new TextPrompt(AGE_PROMPT, this.ageValidator.bind(this)));
        this.addDialog(new ChoicePrompt(GENDER_PROMPT, this.genderValidator.bind(this)));
        this.addDialog(new TextPrompt(CPF_PROMPT, this.cpfValidator.bind(this)));
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
        const options = {
            prompt: 'informe seu nome:',
            retryPrompt: 'nao entendi seu nome, tente novamente.\n Informe seu nome:'
        };

        stepContext.values.userProfile = new UserProfile();
        return await stepContext.prompt(NAME_PROMPT, options);
    }

    async nameValidator(stepContext) {
        const resultRecognized = stepContext.context.result;
        return resultRecognized.intent.score > 0.6 && intentsNames.includes(resultRecognized.intent.intent);
    };

    async ageStep(stepContext) {
        const { entity: nome } = stepContext.context.result;
        stepContext.values.userProfile.name = nome;

        return await stepContext.prompt(AGE_PROMPT, 'informe sua idade:');
    }

    async ageValidator(stepContext) {
        const { intent } = stepContext.context.result;
        return intent.score > 0.6 && intentsNames.includes(intent.intent);
    }

    async birthdateStep(stepContext) {
        stepContext.values.userProfile.age = stepContext.result;
        return await stepContext.prompt(BIRTHDATE_PROMPT, 'informe o dia e o mês do seu aniversário');
    }

    async genderStep(stepContext) {
        stepContext.values.userProfile.age = stepContext.result;
        const buttons = ['Masculino', 'Feminino', 'Outro'];
        const card = CardFactory.heroCard(undefined, undefined, buttons, { text: 'Informe seu gênero:' });
        const prompt = MessageFactory.attachment(card);

        return await stepContext.prompt(GENDER_PROMPT, { prompt });
    }

    async genderValidator(stepContext) {
        const { intent } = stepContext.context.result;
        if (!intent) {
            return false;
        }
        return intent.score > 0.8 && intentsNames.includes(intent.intent);
    };

    async cpfStep(stepContext) {
        const { context } = stepContext;
        stepContext.values.userProfile.gender = context.activity.text;
        return await stepContext.prompt(CPF_PROMPT, 'informe seu CPF (somente números):');
    }

    async cpfValidator(stepContext) {
        const { intent } = stepContext.context.result;
        if (!intent) {
            return false;
        }
        return intent.score > 0.7 && intentsNames.includes(intent.intent);
    }

    async cepStep(stepContext) {
        stepContext.values.userProfile.cpf = stepContext.result;

        return await stepContext.beginDialog(CEP_DIALOG);
    }

    async finalStep(stepContext) {
        const data = stepContext.result.data;
        const { cep, bairro, localidade, logradouro, uf } = data;
        stepContext.values.userProfile.address.cep = cep;
        stepContext.values.userProfile.address.street = logradouro;
        stepContext.values.userProfile.address.district = bairro;
        stepContext.values.userProfile.address.city = localidade;
        stepContext.values.userProfile.address.country = uf;
        const userProfile = stepContext.values.userProfile;
        return await stepContext.endDialog(userProfile);
    }
}

module.exports.UserDialog = UserDialog;
module.exports.USER_DIALOG = USER_DIALOG;
