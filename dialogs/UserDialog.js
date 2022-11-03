const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, TextPrompt, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');

const { UserProfile } = require('../Models/UserProfile');
const { CEP_DIALOG, CepDialog } = require('./CepDialog');
const intentsNames = require('../constants/intentsNames');
const birthdateGenerator = require('../utils/birthdateGenerator');
const cpfFormater = require('../utils/cpfFormater');

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
        this.addDialog(new TextPrompt(BIRTHDATE_PROMPT, this.bithdateValidator.bind(this)));
        this.addDialog(new ChoicePrompt(GENDER_PROMPT, this.genderValidator.bind(this)));
        this.addDialog(new TextPrompt(CPF_PROMPT, this.cpfValidator.bind(this)));
        this.addDialog(new CepDialog(CEP_DIALOG));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.nameStep.bind(this),
            this.ageStep.bind(this),
            this.birthdateStep.bind(this),
            this.genderStep.bind(this),
            this.cpfStep.bind(this),
            this.cepStep.bind(this),
            this.finalStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async nameStep(stepContext) {
        stepContext.values.userProfile = new UserProfile();
        return stepContext.prompt(NAME_PROMPT, 'informe seu nome:');
    }

    async nameValidator(stepContext) {
        const { entity } = stepContext.context.result;
        if (entity === undefined) {
            stepContext.context.sendActivity('Não entendi, tente novamente');
            return false;
        };
        return true;
    };

    async ageStep(stepContext) {
        const { entity: nome } = stepContext.context.result;
        stepContext.values.userProfile.name = nome;

        return stepContext.prompt(AGE_PROMPT, 'informe sua idade:');
    }

    async ageValidator(stepContext) {
        const { entity } = stepContext.context.result;
        if (entity === undefined || isNaN(entity) || entity === null) {
            stepContext.context.sendActivity('Não entendi, tente novamente');
            return false;
        };
        return true;
    }

    async birthdateStep(stepContext) {
        stepContext.values.userProfile.age = stepContext.context.result.entity;
        return stepContext.prompt(BIRTHDATE_PROMPT, `informe o dia e o mês do seu aniversário: 

(exemplo: 10/09) 😊`);
    }

    async bithdateValidator(stepContext) {
        if (stepContext.recognized.value.split(' ').length > 1) {
            stepContext.context.sendActivity('Não entendi, tente novamente. Lembre-se de informar no formato informado');
            return false;
        }
        return true;
    }

    async genderStep(stepContext) {
        const age = stepContext.values.userProfile.age;
        const birthdate = birthdateGenerator(stepContext.result, age);
        stepContext.values.userProfile.birthdate = birthdate;
        const buttons = ['Masculino', 'Feminino', 'Outro'];
        const card = CardFactory.heroCard(undefined, undefined, buttons, { text: 'Informe seu gênero:' });
        const prompt = MessageFactory.attachment(card);

        return stepContext.prompt(GENDER_PROMPT, { prompt });
    }

    async genderValidator(stepContext) {
        const { intent } = stepContext.context.result;
        if (intent === undefined) {
            stepContext.context.sendActivity('Não entendi, tente novamente');
            return false;
        }
        return intent.score > 0.8 && intentsNames.includes(intent.intent);
    };

    async cpfStep(stepContext) {
        const { context } = stepContext;
        stepContext.values.userProfile.gender = context.activity.text;
        return stepContext.prompt(CPF_PROMPT, 'informe seu CPF:');
    }

    async cpfValidator(stepContext) {
        const { intent } = stepContext.context.result;
        if (intent === undefined) {
            stepContext.context.sendActivity('Não entendi, tente novamente');
            return false;
        }
        return intent.score > 0.7 && intentsNames.includes(intent.intent);
    }

    async cepStep(stepContext) {
        const cpf = cpfFormater(stepContext.result);
        stepContext.values.userProfile.cpf = cpf;

        return stepContext.beginDialog(CEP_DIALOG);
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
        return stepContext.endDialog(userProfile);
    }
}

module.exports.UserDialog = UserDialog;
module.exports.USER_DIALOG = USER_DIALOG;
