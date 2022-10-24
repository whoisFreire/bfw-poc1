const { entitiesNames } = require('../constants/entitiesNames');
const intentsNames = require('../constants/intentsNames');

class Recognizer {
    async start(option, luis, context) {
        const result = await luis.configured.recognize(context);
        const topIntent = luis.class.topIntent(result);

        switch (option) {
        case 'entity':
            return this.entity(result);
        case 'intent':
            return this.intent(topIntent);
        case 'both':
            return {
                intent: this.intent(topIntent),
                entity: this.entity(result)
            };
        }
    }

    entity(result) {
        const { entities } = result;
        let entity;

        entitiesNames.forEach(element => {
            // eslint-disable-next-line no-prototype-builtins
            if (entities.hasOwnProperty(element)) {
                entity = entities[element][0][0];
            };
        });
        return entity;
    }

    intent(topIntent) {
        let intent;
        intentsNames.forEach(element => {
            if (topIntent === element) {
                intent = topIntent;
            }
        });

        return intent;
    }
}

module.exports.Recognizer = Recognizer;
